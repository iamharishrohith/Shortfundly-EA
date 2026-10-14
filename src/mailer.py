"""
Automated Mailer Engine Module
Executes throttled, individualized, anti-spam dispatches via SMTP.
Supports dry-run simulation mode, test mode redirection,
domain-aware rate limiting, and RFC 5322 compliant multipart generation.
"""

import os
import smtplib
import ssl
import time
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class EmailDispatcher:
    def __init__(self, config: Dict[str, Any], dry_run: bool = True, test_mode: bool = False, test_recipient: str = None):
        self.config = config
        self.dry_run = dry_run
        self.test_mode = test_mode
        self.test_recipient = test_recipient
        self.smtp_cfg = config.get("smtp", {})
        self.dispatch_cfg = config.get("dispatch", {})
        self.domain_history: Dict[str, float] = {}

    def _get_root_domain(self, email_addr: str) -> str:
        if "@" in email_addr:
            return email_addr.split("@")[-1].lower()
        return "unknown"

    def _enforce_domain_throttle(self, domain: str) -> None:
        """Applies domain-level throttling to prevent institutional spam firewalls from tripping."""
        now = time.time()
        min_domain_interval = self.dispatch_cfg.get("min_delay_seconds", 3)
        if domain in self.domain_history:
            elapsed = now - self.domain_history[domain]
            if elapsed < min_domain_interval:
                sleep_time = min_domain_interval - elapsed
                logger.info(f"Throttling domain {domain}: sleeping for {sleep_time:.1f}s")
                time.sleep(sleep_time)
        self.domain_history[domain] = time.time()

    def create_message(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: str,
        college_name: str,
        campaign_id: str
    ) -> MIMEMultipart:
        """Creates RFC 5322 compliant multipart email message."""
        msg = MIMEMultipart("alternative")
        
        from_email = self.smtp_cfg.get("from_email", "outreach@shortfundly.com")
        from_name = self.smtp_cfg.get("from_name", "Shortfundly Education Outreach")
        reply_to = self.smtp_cfg.get("reply_to", from_email)

        msg["From"] = f"{from_name} <{from_email}>"
        
        target_email = to_email
        if self.test_mode and self.test_recipient:
            target_email = self.test_recipient
            subject = f"[TEST MODE - Target: {college_name} <{to_email}>] {subject}"

        msg["To"] = target_email
        msg["Subject"] = subject
        msg["Reply-To"] = reply_to
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain=from_email.split("@")[-1])
        msg["X-Campaign-ID"] = campaign_id
        msg["X-College-Target"] = college_name

        # Attach text part first, then HTML part
        part_text = MIMEText(text_body, "plain", "utf-8")
        part_html = MIMEText(html_body, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        return msg

    def send_single_email(
        self,
        recipient_email: str,
        subject: str,
        html_body: str,
        text_body: str,
        college_name: str,
        campaign_id: str
    ) -> Dict[str, Any]:
        """
        Dispatches an individual email with rate-limiting, error trapping, and simulation support.
        """
        domain = self._get_root_domain(recipient_email)
        self._enforce_domain_throttle(domain)

        msg = self.create_message(
            to_email=recipient_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
            college_name=college_name,
            campaign_id=campaign_id
        )

        effective_to = msg["To"]

        # DRY RUN SIMULATION MODE
        if self.dry_run:
            logger.info(f"[SIMULATION DRY-RUN] Would send email to: {effective_to} | Subject: {subject[:40]}...")
            return {
                "success": True,
                "status": "SENT",
                "mode": "DRY_RUN",
                "message_id": msg["Message-ID"],
                "recipient": effective_to,
                "error": None
            }

        # LIVE SMTP SEND
        host = self.smtp_cfg.get("host")
        port = self.smtp_cfg.get("port", 587)
        username = self.smtp_cfg.get("username")
        password = self.smtp_cfg.get("password")
        use_tls = self.smtp_cfg.get("use_tls", True)

        try:
            if not username or not password or username == "${SMTP_USERNAME}":
                raise ValueError("SMTP credentials not configured. Please supply valid credentials in config/.env.")

            context = ssl.create_default_context()
            with smtplib.SMTP(host, port, timeout=30) as server:
                if use_tls:
                    server.starttls(context=context)
                server.login(username, password)
                server.send_message(msg)

            logger.info(f"[LIVE DISPATCH SUCCESS] Delivered to: {effective_to}")
            return {
                "success": True,
                "status": "SENT",
                "mode": "LIVE",
                "message_id": msg["Message-ID"],
                "recipient": effective_to,
                "error": None
            }

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[DISPATCH FAILURE] Recipient {effective_to} failed: {err_msg}")
            return {
                "success": False,
                "status": "FAILED",
                "mode": "LIVE",
                "message_id": msg["Message-ID"],
                "recipient": effective_to,
                "error": err_msg
            }
