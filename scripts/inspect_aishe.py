import requests
import re
import urllib3
urllib3.disable_warnings()

url = "https://dashboard.aishe.gov.in/hedirectory/"
try:
    res = requests.get(url, timeout=10, verify=False)
    print("Status:", res.status_code)
    scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', res.text)
    print("Scripts found:", scripts)
    for s in scripts:
        if "main" in s or "app" in s:
            s_url = s if s.startswith("http") else f"https://dashboard.aishe.gov.in/hedirectory/{s}"
            print("Fetching:", s_url)
            s_res = requests.get(s_url, timeout=10, verify=False)
            endpoints = re.findall(r'["\'](https?://[^"\']+|/[a-zA-Z0-9_\-/]+)["\']', s_res.text)
            api_endpoints = [e for e in endpoints if "api" in e or "college" in e or "get" in e]
            print("API endpoints found in script:", api_endpoints[:20])
except Exception as e:
    print("Error:", e)
