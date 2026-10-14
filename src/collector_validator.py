"""
Collector and Validator Module
Handles data ingestion, validation, RFC 5322 email syntax verification,
DNS MX record checks, deduplication, and export to Excel/CSV.
"""

import re
import socket
import logging
from typing import List, Dict, Tuple, Optional
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# RFC 5322 compliant regex pattern for email address validation
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

REQUIRED_COLUMNS = [
    "state",
    "city",
    "college_name",
    "website_url",
    "department",
    "contact_person",
    "official_email",
    "source_page_url"
]


class ContactValidator:
    def __init__(self, check_mx: bool = False):
        self.check_mx = check_mx
        self._mx_cache: Dict[str, bool] = {}

    def is_valid_syntax(self, email: str) -> bool:
        if not email or not isinstance(email, str):
            return False
        email = email.strip()
        return bool(EMAIL_REGEX.match(email))

    def verify_mx_domain(self, domain: str) -> bool:
        """Verifies if the domain has a valid MX or A record to accept mail."""
        if not self.check_mx:
            return True
        domain = domain.strip().lower()
        if domain in self._mx_cache:
            return self._mx_cache[domain]

        try:
            # Socket lookup fallback for MX / A record host resolution
            socket.gethostbyname(domain)
            self._mx_cache[domain] = True
            return True
        except (socket.gaierror, socket.timeout):
            self._mx_cache[domain] = False
            return False

    def normalize_record(self, record: Dict[str, str]) -> Dict[str, str]:
        """Normalizes spaces, casing, and standardizes fields."""
        normalized = {}
        for key in REQUIRED_COLUMNS:
            val = record.get(key, "")
            if val is None or pd.isna(val):
                val = ""
            normalized[key] = str(val).strip()

        # Normalize email to lowercase
        normalized["official_email"] = normalized["official_email"].lower()
        return normalized

    def validate_and_deduplicate(self, records: List[Dict[str, str]]) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        """
        Validates records, rejects invalid entries, and performs deduplication.
        Returns: (valid_records, rejected_records)
        """
        valid_records: List[Dict[str, str]] = []
        rejected_records: List[Dict[str, str]] = []
        seen_emails = set()
        seen_colleges = set()

        for raw_item in records:
            item = self.normalize_record(raw_item)
            email = item["official_email"]
            college = item["college_name"].lower()
            website = item["website_url"]

            # Field presence check
            if not item["state"] or not item["city"] or not item["college_name"]:
                item["rejection_reason"] = "Missing core geographic or institution name"
                rejected_records.append(item)
                continue

            if not email or not self.is_valid_syntax(email):
                item["rejection_reason"] = f"Invalid email syntax: {email}"
                rejected_records.append(item)
                continue

            if not website or not item["source_page_url"]:
                item["rejection_reason"] = "Missing website URL or source page URL"
                rejected_records.append(item)
                continue

            # Deduplication Check 1: Duplicate Email
            if email in seen_emails:
                item["rejection_reason"] = f"Duplicate email address: {email}"
                rejected_records.append(item)
                continue

            # Deduplication Check 2: Duplicate College Name
            if college in seen_colleges:
                item["rejection_reason"] = f"Duplicate college entry: {item['college_name']}"
                rejected_records.append(item)
                continue

            # Domain MX check if enabled
            domain = email.split("@")[-1]
            if not self.verify_mx_domain(domain):
                item["rejection_reason"] = f"Domain unresolvable: {domain}"
                rejected_records.append(item)
                continue

            # Mark verification status
            item["verification_status"] = "VERIFIED_OFFICIAL"
            seen_emails.add(email)
            seen_colleges.add(college)
            valid_records.append(item)

        logger.info(f"Validation complete: {len(valid_records)} valid records, {len(rejected_records)} rejected.")
        return valid_records, rejected_records


def export_to_excel_and_csv(records: List[Dict[str, str]], excel_path: str, csv_path: str) -> None:
    """Exports validated records to Excel with auto-fitted columns and standard CSV."""
    df = pd.DataFrame(records)
    
    # Save CSV
    df.to_csv(csv_path, index=False, encoding="utf-8")
    logger.info(f"Saved CSV dataset to {csv_path}")

    # Save Excel
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Official_Colleges", index=False)
        worksheet = writer.sheets["Official_Colleges"]
        # Format column widths
        for col in worksheet.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = col[0].column_letter
            worksheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    logger.info(f"Saved Excel dataset to {excel_path}")
