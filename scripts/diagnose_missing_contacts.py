import sqlite3
import pandas as pd
import httpx
import re
from bs4 import BeautifulSoup

conn = sqlite3.connect(r'd:\Shortfundly\college_scraper\scraper_checkpoint.db')
df = pd.read_sql_query("SELECT * FROM processed_colleges WHERE status='NO_CONTACTS' LIMIT 10;", conn)
print("--- 10 Colleges with NO_CONTACTS ---")
for idx, row in df.iterrows():
    print(f"\n[{idx+1}] {row['college_name']}")
    print(f"URL: {row['website_url']}")
    url = str(row['website_url']).strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        r = httpx.get(url, headers=headers, timeout=8.0, follow_redirects=True, verify=False)
        print(f"HTTP Status: {r.status_code}, Final URL: {r.url}, Length: {len(r.text)}")
        
        # Check if emails exist in HTML
        raw_emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', r.text)
        # Filter image extensions
        valid_emails = [e for e in raw_emails if not any(e.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'])]
        print(f"Emails found in live fetch: {set(valid_emails[:5])}")
    except Exception as e:
        print(f"Fetch Error: {type(e).__name__} - {e}")
