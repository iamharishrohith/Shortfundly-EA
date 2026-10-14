"""
Tracker and Idempotency Engine Module
Maintains transactional SQLite audit database with Write-Ahead Logging (WAL).
Enforces deterministic idempotency keys to prevent duplicate dispatches.
Exports comprehensive audit reports in Excel and CSV.
"""

import os
import sqlite3
import hashlib
import logging
from typing import Dict, Any, Optional, List
import pandas as pd

logger = logging.getLogger(__name__)


class AuditTracker:
    def __init__(self, db_path: str = None):
        if not db_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            logs_dir = os.path.join(base_dir, "logs")
            os.makedirs(logs_dir, exist_ok=True)
            self.db_path = os.path.join(logs_dir, "dispatch_audit.db")
        else:
            self.db_path = db_path

        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dispatch_audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    idempotency_key TEXT UNIQUE NOT NULL,
                    campaign_id TEXT NOT NULL,
                    template_hash TEXT NOT NULL,
                    college_name TEXT NOT NULL,
                    official_email TEXT NOT NULL,
                    state TEXT,
                    city TEXT,
                    status TEXT NOT NULL,
                    attempts INTEGER DEFAULT 0,
                    error_message TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_email ON dispatch_audit(official_email);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON dispatch_audit(status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaign ON dispatch_audit(campaign_id);")
            conn.commit()

    def compute_idempotency_key(self, email: str, template_hash: str, campaign_id: str) -> str:
        """Computes deterministic SHA-256 idempotency key."""
        raw = f"{email.strip().lower()}::{template_hash}::{campaign_id}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def is_already_sent(self, email: str, template_hash: str, campaign_id: str) -> bool:
        """Checks if this exact email has already been successfully sent for this template version."""
        key = self.compute_idempotency_key(email, template_hash, campaign_id)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT status FROM dispatch_audit WHERE idempotency_key = ?", (key,))
            row = cursor.fetchone()
            if row and row[0] == "SENT":
                return True
        return False

    def register_or_get_status(self, recipient: Dict[str, Any], template_hash: str, campaign_id: str) -> str:
        """
        Registers candidate recipient as PENDING if not seen, or returns existing status.
        """
        email = recipient["official_email"].strip().lower()
        key = self.compute_idempotency_key(email, template_hash, campaign_id)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT status FROM dispatch_audit WHERE idempotency_key = ?", (key,))
            row = cursor.fetchone()
            if row:
                return row[0]

            cursor.execute("""
                INSERT INTO dispatch_audit 
                (idempotency_key, campaign_id, template_hash, college_name, official_email, state, city, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
            """, (
                key,
                campaign_id,
                template_hash,
                recipient.get("college_name", ""),
                email,
                recipient.get("state", ""),
                recipient.get("city", "")
            ))
            conn.commit()
            return "PENDING"

    def mark_status(self, idempotency_key: str, status: str, error_message: Optional[str] = None) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE dispatch_audit
                SET status = ?,
                    attempts = attempts + 1,
                    error_message = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE idempotency_key = ?
            """, (status, error_message, idempotency_key))
            conn.commit()

    def get_summary_stats(self, campaign_id: Optional[str] = None) -> Dict[str, int]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if campaign_id:
                cursor.execute("""
                    SELECT status, COUNT(*) FROM dispatch_audit
                    WHERE campaign_id = ?
                    GROUP BY status
                """, (campaign_id,))
            else:
                cursor.execute("""
                    SELECT status, COUNT(*) FROM dispatch_audit
                    GROUP BY status
                """)
            rows = cursor.fetchall()

        stats = {"TOTAL": 0, "PENDING": 0, "SENT": 0, "FAILED": 0, "SKIPPED_DUPLICATE": 0}
        total = 0
        for status_val, count in rows:
            stats[status_val] = count
            total += count
        stats["TOTAL"] = total
        return stats

    def export_report(self, output_path: str, campaign_id: Optional[str] = None) -> str:
        """Exports audit records to Excel or CSV."""
        with self._get_connection() as conn:
            query = "SELECT * FROM dispatch_audit"
            params = []
            if campaign_id:
                query += " WHERE campaign_id = ?"
                params.append(campaign_id)
            query += " ORDER BY id ASC"
            df = pd.read_sql_query(query, conn, params=params)

        if output_path.endswith(".xlsx"):
            df.to_excel(output_path, sheet_name="Audit_Report", index=False)
        else:
            df.to_csv(output_path, index=False, encoding="utf-8")

        return output_path
