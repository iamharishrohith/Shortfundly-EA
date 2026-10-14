"""
Asynchronous Enterprise Dispatch Engine
Implements:
- Async worker pipeline with concurrency control
- Domain-aware Token Bucket Rate Limiter
- Circuit Breaker Pattern (Hystrix style: CLOSED, OPEN, HALF_OPEN)
- Dead Letter Queue (DLQ) for failed delivery quarantine
- Real-time event broadcasting for Server-Sent Events (SSE)
- Atomic Emergency Kill Switch
"""

import asyncio
import time
import json
import logging
from typing import Dict, Any, List, Optional, Callable
from collections import deque

from template_engine import TemplateEngine
from tracker import AuditTracker
from mailer import EmailDispatcher

logger = logging.getLogger(__name__)


class CircuitBreaker:
    def __init__(self, failure_threshold: float = 0.10, consecutive_fail_limit: int = 3, reset_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.consecutive_fail_limit = consecutive_fail_limit
        self.reset_timeout = reset_timeout
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.failure_count = 0
        self.success_count = 0
        self.consecutive_fails = 0
        self.last_state_change = time.time()

    def can_dispatch(self) -> bool:
        now = time.time()
        if self.state == "OPEN":
            if now - self.last_state_change > self.reset_timeout:
                self.state = "HALF_OPEN"
                self.last_state_change = now
                logger.warning("Circuit breaker entered HALF_OPEN state. Probing...")
                return True
            return False
        return True

    def record_success(self):
        self.success_count += 1
        self.consecutive_fails = 0
        if self.state == "HALF_OPEN":
            self.state = "CLOSED"
            self.last_state_change = time.time()
            logger.info("Circuit breaker reset to CLOSED state.")

    def record_failure(self):
        self.failure_count += 1
        self.consecutive_fails += 1
        now = time.time()

        total = self.success_count + self.failure_count
        rate = (self.failure_count / total) if total > 0 else 0.0

        if self.consecutive_fails >= self.consecutive_fail_limit or (total >= 10 and rate >= self.failure_threshold):
            self.state = "OPEN"
            self.last_state_change = now
            logger.error(f"Circuit breaker TRIPPED to OPEN. Consecutive fails: {self.consecutive_fails}, Fail rate: {rate:.1%}")


class DomainTokenBucket:
    """Controls rate of dispatch to each individual institutional root domain."""
    def __init__(self, interval_seconds: float = 3.0):
        self.interval = interval_seconds
        self.last_dispatch: Dict[str, float] = {}

    async def acquire(self, domain: str):
        domain = domain.lower()
        now = time.time()
        if domain in self.last_dispatch:
            elapsed = now - self.last_dispatch[domain]
            if elapsed < self.interval:
                wait_time = self.interval - elapsed
                await asyncio.sleep(wait_time)
        self.last_dispatch[domain] = time.time()


class AsyncCampaignManager:
    def __init__(self, base_dir: str, config: Dict[str, Any]):
        self.base_dir = base_dir
        self.config = config
        self.template_engine = TemplateEngine(base_dir)
        self.tracker = AuditTracker()
        self.circuit_breaker = CircuitBreaker()
        self.domain_limiter = DomainTokenBucket(interval_seconds=config.get("dispatch", {}).get("min_delay_seconds", 2.0))

        self.is_running = False
        self.kill_switch = False
        self.current_campaign_id = ""
        self.stats = {
            "total": 0,
            "processed": 0,
            "sent": 0,
            "failed": 0,
            "skipped": 0,
            "circuit_state": "CLOSED",
            "status": "IDLE"
        }
        self.event_subscribers: List[asyncio.Queue] = []
        self.dlq: List[Dict[str, Any]] = []

    def subscribe_events(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.event_subscribers.append(q)
        return q

    def unsubscribe_events(self, q: asyncio.Queue):
        if q in self.event_subscribers:
            self.event_subscribers.remove(q)

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        payload = json.dumps({"event": event_type, "timestamp": time.time(), "data": data})
        for q in list(self.event_subscribers):
            try:
                q.put_nowait(payload)
            except Exception:
                pass

    def trigger_kill_switch(self):
        """Emergency stop: halts active dispatch immediately."""
        self.kill_switch = True
        self.stats["status"] = "KILLED"
        logger.warning("Emergency Kill Switch engaged. Halting all campaign operations.")

    async def execute_campaign(
        self,
        campaign_id: str,
        recipients: List[Dict[str, Any]],
        live_mode: bool = False,
        concurrency: int = 3
    ) -> Dict[str, Any]:
        if self.is_running:
            return {"error": "A campaign is already running"}

        self.is_running = True
        self.kill_switch = False
        self.current_campaign_id = campaign_id
        self.stats = {
            "total": len(recipients),
            "processed": 0,
            "sent": 0,
            "failed": 0,
            "skipped": 0,
            "circuit_state": self.circuit_breaker.state,
            "status": "RUNNING"
        }

        template_hash = self.template_engine.get_template_hash()
        dispatcher = EmailDispatcher(
            config=self.config,
            dry_run=not live_mode,
            test_mode=False
        )

        await self.broadcast_event("campaign_start", {
            "campaign_id": campaign_id,
            "total": len(recipients),
            "mode": "LIVE" if live_mode else "DRY_RUN"
        })

        queue = asyncio.Queue()
        for item in recipients:
            await queue.put(item)

        async def worker():
            while not queue.empty():
                if self.kill_switch:
                    break

                if not self.circuit_breaker.can_dispatch():
                    logger.warning("Worker waiting: Circuit breaker OPEN.")
                    await asyncio.sleep(2.0)
                    continue

                rec = await queue.get()
                email = rec.get("official_email", "").strip().lower()
                college = rec.get("college_name", "")
                domain = email.split("@")[-1]

                # Check Idempotency
                if self.tracker.is_already_sent(email, template_hash, campaign_id):
                    self.stats["skipped"] += 1
                    self.stats["processed"] += 1
                    await self.broadcast_event("record_skipped", {
                        "college": college,
                        "email": email,
                        "reason": "DUPLICATE_PREVENTION"
                    })
                    queue.task_done()
                    continue

                idemp_key = self.tracker.compute_idempotency_key(email, template_hash, campaign_id)
                self.tracker.register_or_get_status(rec, template_hash, campaign_id)

                # Rate Limiting
                await self.domain_limiter.acquire(domain)

                # Render
                subj, html_body, text_body = self.template_engine.render(rec)

                # Execute dispatch in executor
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    dispatcher.send_single_email,
                    email,
                    subj,
                    html_body,
                    text_body,
                    college,
                    campaign_id
                )

                self.tracker.mark_status(idemp_key, result["status"], result.get("error"))

                if result["status"] == "SENT":
                    self.stats["sent"] += 1
                    self.circuit_breaker.record_success()
                    await self.broadcast_event("record_sent", {
                        "college": college,
                        "email": email,
                        "message_id": result["message_id"]
                    })
                else:
                    self.stats["failed"] += 1
                    self.circuit_breaker.record_failure()
                    # Quarantine to Dead Letter Queue
                    dlq_item = {
                        "college": college,
                        "email": email,
                        "error": result.get("error"),
                        "timestamp": time.time(),
                        "recipient_data": rec
                    }
                    self.dlq.append(dlq_item)
                    await self.broadcast_event("record_failed", dlq_item)

                self.stats["processed"] += 1
                self.stats["circuit_state"] = self.circuit_breaker.state
                await self.broadcast_event("progress_update", self.stats)
                queue.task_done()

        # Run concurrent workers
        tasks = [asyncio.create_task(worker()) for _ in range(concurrency)]
        await asyncio.gather(*tasks)

        self.is_running = False
        if self.kill_switch:
            self.stats["status"] = "KILLED"
        else:
            self.stats["status"] = "COMPLETED"

        await self.broadcast_event("campaign_complete", self.stats)
        return self.stats
