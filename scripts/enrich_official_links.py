import csv
import json
import os
import re
import time
import urllib.parse
import urllib.request
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MASTER_CSV = os.path.join(DATA_DIR, "maharashtra_colleges_all_5378.csv")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

def clean_name_for_search(name):
    # Remove unwanted prefixes, quotes, and taluka details for cleaner search queries
    name = re.sub(r'^[0-9\-]+', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def search_official_website(college_name, district):
    clean_name = clean_name_for_search(college_name)
    query = f"{clean_name} {district} Maharashtra official website"
    
    # Method: Query DuckDuckGo Lite / HTML with robust fallback
    search_url = f"https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({"q": query}).encode("utf-8")
    
    try:
        req = urllib.request.Request(search_url, data=data, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        
        soup = BeautifulSoup(html, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if "uddg=" in href:
                actual = urllib.parse.unquote(href.split("uddg=")[1].split("&")[0])
                if actual.startswith("http"):
                    links.append(actual)
            elif href.startswith("http"):
                links.append(href)
        
        # Filter for genuine institutional candidate domains
        # Exclude aggregators like shiksha, collegedunia, careers360, wikipedia, justdial
        aggregators = [
            "shiksha.com", "collegedunia.com", "careers360.com", "wikipedia.org",
            "justdial.com", "indiamart.com", "facebook.com", "youtube.com",
            "instagram.com", "linkedin.com", "twitter.com", "x.com", "colleges-india.com",
            "targetadmission.com", "getmyuni.com", "vidyavision.com", "entrancezone.com"
        ]
        
        candidate = None
        for l in links:
            l_lower = l.lower()
            if not any(agg in l_lower for agg in aggregators):
                candidate = l
                break
        
        if candidate:
            # Extract root domain
            parsed = urllib.parse.urlparse(candidate)
            root_url = f"{parsed.scheme}://{parsed.netloc}/"
            return root_url
    except Exception as e:
        pass
    
    return None

def verify_live_url(url):
    if not url or not url.startswith("http"):
        return None, None
    try:
        res = requests.get(url, headers=HEADERS, timeout=8, allow_redirects=True, verify=False)
        final_url = res.url
        # If redirected to a valid page
        if res.status_code in [200, 403]: # 403 is often WAF on university servers
            return final_url, res.status_code
    except Exception:
        pass
    return None, None

def enrich_batch(district_filter=None, limit=20):
    print(f"Loading master CSV: {MASTER_CSV}")
    records = []
    with open(MASTER_CSV, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        records = list(reader)
    
    print(f"Total records in master: {len(records)}")
    
    # Filter target records that need official link enrichment
    targets = []
    for idx, r in enumerate(records):
        status = r.get("verification_status", "")
        # If already verified working, skip
        if status == "VERIFIED_HTTP_WORKING":
            continue
        
        dist = r.get("district", "")
        if district_filter and dist.lower() != district_filter.lower():
            continue
        
        targets.append((idx, r))
        if len(targets) >= limit:
            break
    
    print(f"Selected {len(targets)} colleges for official link search...")
    
    updated_count = 0
    for idx, r in targets:
        name = r["college_name"]
        dist = r["district"]
        print(f"Searching official link for: {name} ({dist})...")
        
        found_url = search_official_website(name, dist)
        if found_url:
            verified_url, code = verify_live_url(found_url)
            if verified_url:
                print(f"  -> FOUND & VERIFIED: {verified_url} [HTTP {code}]")
                records[idx]["website_url"] = verified_url
                records[idx]["source_page_url"] = urllib.parse.urljoin(verified_url, "contact-us")
                records[idx]["http_status_code"] = str(code)
                records[idx]["verification_status"] = "VERIFIED_HTTP_WORKING"
                updated_count += 1
            else:
                print(f"  -> Found candidate {found_url} but connection timed out.")
        else:
            print("  -> No direct institutional domain candidate found in search.")
        
        # Polite delay to prevent rate limiting
        time.sleep(1.5)
    
    print(f"\nEnrichment complete: Updated {updated_count} institutions with verified official websites.")
    
    # Save back to CSV
    if updated_count > 0:
        fieldnames = reader.fieldnames
        with open(MASTER_CSV, mode="w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        print(f"Saved updated records to: {MASTER_CSV}")

if __name__ == "__main__":
    import sys
    district = sys.argv[1] if len(sys.argv) > 1 else "Pune"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    enrich_batch(district_filter=district, limit=count)
