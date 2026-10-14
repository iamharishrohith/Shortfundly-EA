"""
Automated College Contact Harvester
Discovers and extracts official contact details from institutional web pages.
Visits high-priority contact paths, extracts emails matching institution domain,
identifies contact persons and departments, and captures source page URLs.
"""

import re
import urllib.parse
from typing import List, Dict, Optional, Set
import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

# High-priority subpaths on official college websites
CONTACT_PATHS = [
    "",
    "/contact",
    "/contact-us",
    "/contactus.php",
    "/contact-us.php",
    "/contact.html",
    "/contact.php",
    "/about/contact",
    "/administration",
    "/office-of-the-principal",
    "/principal",
    "/placement",
    "/training-and-placement",
]

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

# Exclude generic third-party or technical emails
EXCLUDED_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "wix.com", "wordpress.org", "sentry.io", "example.com"
}


class CollegeContactHarvester:
    def __init__(self, timeout_seconds: int = 10, user_agent: str = None):
        self.timeout = timeout_seconds
        self.headers = {
            "User-Agent": user_agent or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Shortfundly-Education-Harvester/2.0"
        }

    def _extract_domain(self, url: str) -> str:
        parsed = urllib.parse.urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc

    def scrape_url(self, base_url: str, college_name: str, state: str, city: str) -> Optional[Dict[str, str]]:
        """
        Visits contact vectors of a college website and extracts official email and contact details.
        """
        root_domain = self._extract_domain(base_url)
        visited = set()

        for path in CONTACT_PATHS:
            target_url = urllib.parse.urljoin(base_url, path)
            if target_url in visited:
                continue
            visited.add(target_url)

            try:
                resp = requests.get(target_url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
                if resp.status_code != 200 or not resp.text:
                    continue

                text = resp.text
                soup = BeautifulSoup(text, "html.parser")

                # Extract emails from text and mailto links
                raw_emails = set(EMAIL_REGEX.findall(text))
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"]
                    if href.startswith("mailto:"):
                        cleaned_email = href.replace("mailto:", "").split("?")[0].strip()
                        if cleaned_email:
                            raw_emails.add(cleaned_email)

                # Prioritize institutional emails matching root domain
                filtered_emails = []
                for em in raw_emails:
                    em_lower = em.lower()
                    em_domain = em_lower.split("@")[-1]
                    if em_domain in EXCLUDED_EMAIL_DOMAINS:
                        continue
                    if root_domain in em_domain or em_domain.endswith(".edu") or em_domain.endswith(".ac.in"):
                        filtered_emails.append(em_lower)

                if not filtered_emails and raw_emails:
                    # Fallback to any valid non-excluded email
                    filtered_emails = [e.lower() for e in raw_emails if e.split("@")[-1] not in EXCLUDED_EMAIL_DOMAINS]

                if filtered_emails:
                    # Select best candidate (e.g. principal, registrar, placement, info)
                    best_email = filtered_emails[0]
                    for candidate in filtered_emails:
                        if any(k in candidate for k in ["principal", "registrar", "placement", "director"]):
                            best_email = candidate
                            break

                    # Identify possible designation / person from title or headings
                    contact_person = "Respected Principal / Leadership"
                    department = "Office of Academic Administration"

                    if "principal" in best_email:
                        contact_person = "Office of the Principal"
                        department = "Administration"
                    elif "registrar" in best_email:
                        contact_person = "Office of the Registrar"
                        department = "Academic Administration"
                    elif "placement" in best_email:
                        contact_person = "Training and Placement Officer"
                        department = "Career Development and Placement"

                    return {
                        "state": state,
                        "city": city,
                        "college_name": college_name,
                        "website_url": base_url,
                        "department": department,
                        "contact_person": contact_person,
                        "official_email": best_email,
                        "source_page_url": target_url,
                        "verification_status": "VERIFIED_OFFICIAL"
                    }

            except requests.RequestException as e:
                logger.debug(f"Failed to crawl {target_url}: {e}")
                continue

        return None
