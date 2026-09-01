**`implementation.md`**
```markdown
# Antigravity Task: Automated Real-Time Frontend Job Monitoring Engine

## System Overview
Implement an automated zero-cost job alert engine executing every 10 minutes via GitHub Actions. The system reads active target companies from a public Google Sheet CSV export, queries public JSON endpoints for Greenhouse, Lever, and Ashby, strictly filters for Frontend roles (India/Remote), verifies deduplication against Supabase (using the Service Role key), and dispatches real-time alerts via Telegram Bot and Resend Email.

## 1. Directory Structure
Create the files exactly as mapped below:
├── .github/
│   └── workflows/
│       └── monitor.yml
├── src/
│   ├── init.py
│   ├── config.py
│   ├── ats_fetchers.py
│   ├── db.py
│   └── notifier.py
├── main.py
└── requirements.txt


## 2. File Contents

### `requirements.txt`
```text
requests>=2.31.0
supabase>=2.3.0
resend>=2.1.0
python-dotenv>=1.0.0
src/__init__.py
Python
# Empty init file to mark directory as a package
src/config.py
Python
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "").strip()
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
EMAIL_FROM = os.environ.get("EMAIL_FROM", "").strip()
EMAIL_TO = os.environ.get("EMAIL_TO", "").strip()

# Strict Filtering Regex Patterns
ROLE_INCLUDE_REGEX = r"(?i)\b(frontend|front-end|front end|react|ui engineer|ui developer|sde\s*2\s*-\s*frontend|senior frontend|staff frontend|software engineer\s*2\s*-\s*frontend)\b"
ROLE_EXCLUDE_REGEX = r"(?i)\b(intern|internship|fresher|junior|backend|android|ios|flutter|wordpress|qa|devops|data engineer|engineering manager|director)\b"
LOCATION_REGEX = r"(?i)\b(india|remote|bangalore|bengaluru|gurgaon|gurugram|noida|hyderabad|pune|mumbai|delhi|anywhere)\b"
src/ats_fetchers.py
Python
import csv
import io
import requests
from src.config import GOOGLE_SHEET_ID

def fetch_active_companies():
    if not GOOGLE_SHEET_ID:
        print("[Error] GOOGLE_SHEET_ID environment variable is missing.")
        return []
        
    url = f"[https://docs.google.com/spreadsheets/d/](https://docs.google.com/spreadsheets/d/){GOOGLE_SHEET_ID}/export?format=csv"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        
        companies = []
        reader = csv.DictReader(io.StringIO(res.text))
        for row in reader:
            if (row.get("Active") or "").strip().upper() == "TRUE":
                companies.append({
                    "name": (row.get("Company Name") or "").strip(),
                    "ats_type": (row.get("ATS Type") or "").strip().lower(),
                    "board_slug": (row.get("Board Slug") or "").strip()
                })
        return companies
    except Exception as e:
        print(f"[Error] Failed to fetch Google Sheet companies: {e}")
        return []

def fetch_greenhouse_jobs(slug: str):
    url = f"[https://boards-api.greenhouse.io/v1/boards/](https://boards-api.greenhouse.io/v1/boards/){slug}/jobs"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return []
        raw_jobs = res.json().get("jobs") or []
        
        jobs = []
        for item in raw_jobs:
            loc = (item.get("location") or {}).get("name") or ""
            jobs.append({
                "job_id": str(item.get("id")),
                "title": (item.get("title") or "").strip(),
                "location": loc.strip(),
                "apply_url": f"{item.get('absolute_url', '')}#app"
            })
        return jobs
    except Exception as e:
        print(f"[Warning] Error fetching Greenhouse jobs for slug '{slug}': {e}")
        return []

def fetch_lever_jobs(slug: str):
    url = f"[https://api.lever.co/v0/postings/](https://api.lever.co/v0/postings/){slug}?mode=json"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return []
        raw_jobs = res.json() or []
        
        jobs = []
        for item in raw_jobs:
            loc = (item.get("categories") or {}).get("location") or ""
            jobs.append({
                "job_id": str(item.get("id")),
                "title": (item.get("text") or "").strip(),
                "location": loc.strip(),
                "apply_url": item.get("applyUrl") or item.get("hostedUrl") or ""
            })
        return jobs
    except Exception as e:
        print(f"[Warning] Error fetching Lever jobs for slug '{slug}': {e}")
        return []

def fetch_ashby_jobs(slug: str):
    url = f"[https://api.ashbyhq.com/posting-api/job-board/](https://api.ashbyhq.com/posting-api/job-board/){slug}"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return []
        raw_jobs = res.json().get("jobs") or []
        
        jobs = []
        for item in raw_jobs:
            jobs.append({
                "job_id": str(item.get("id")),
                "title": (item.get("title") or "").strip(),
                "location": (item.get("location") or "").strip(),
                "apply_url": item.get("jobUrl") or ""
            })
        return jobs
    except Exception as e:
        print(f"[Warning] Error fetching Ashby jobs for slug '{slug}': {e}")
        return []
src/db.py
Python
from supabase import create_client, Client
from src.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

supabase_client: Client = None

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[Error] Failed to initialize Supabase client: {e}")

def is_job_seen(job_id: str, company_name: str) -> bool:
    if not supabase_client:
        return False
    try:
        res = supabase_client.table("seen_jobs") \
            .select("id") \
            .eq("job_id", str(job_id)) \
            .eq("company_name", company_name) \
            .execute()
        return len(res.data) > 0
    except Exception as e:
        print(f"[Error] Supabase lookup failure: {e}")
        return False

def record_seen_job(job: dict, company_name: str):
    if not supabase_client:
        return
    try:
        supabase_client.table("seen_jobs").insert({
            "job_id": str(job["job_id"]),
            "company_name": company_name,
            "title": job["title"],
            "location": job["location"],
            "apply_url": job["apply_url"]
        }).execute()
    except Exception as e:
        print(f"[Error] Supabase insert failure: {e}")
src/notifier.py
Python
import html
import requests
import resend
from src.config import (
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
    RESEND_API_KEY,
    EMAIL_FROM,
    EMAIL_TO
)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_telegram_alert(company: str, job: dict):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[Warning] Telegram credentials not configured.")
        return

    safe_company = html.escape(company)
    safe_title = html.escape(job.get("title", "Frontend Developer"))
    safe_location = html.escape(job.get("location") or "Not Specified / Remote")
    safe_url = job.get("apply_url", "")

    text = (
        f"🚨 <b>New Frontend Job Opening!</b>\n\n"
        f"🏢 <b>Company:</b> {safe_company}\n"
        f"💼 <b>Role:</b> {safe_title}\n"
        f"📍 <b>Location:</b> {safe_location}\n\n"
        f"👉 <a href=\"{safe_url}\"><b>[⚡ Apply Directly Here]</b></a>"
    )

    url = f"[https://api.telegram.org/bot](https://api.telegram.org/bot){TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code != 200:
            print(f"[Error] Telegram API returned {res.status_code}: {res.text}")
    except Exception as e:
        print(f"[Error] Failed to send Telegram alert: {e}")

def send_email_alert(company: str, job: dict):
    if not RESEND_API_KEY or not EMAIL_FROM or not EMAIL_TO:
        print("[Warning] Resend email credentials not configured.")
        return

    try:
        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": [EMAIL_TO],
            "subject": f"🔥 New Job: {job['title']} at {company}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; margin-top: 0;">{html.escape(job['title'])}</h2>
                <p style="font-size: 16px; margin: 8px 0;"><strong>Company:</strong> {html.escape(company)}</p>
                <p style="font-size: 16px; margin: 8px 0;"><strong>Location:</strong> {html.escape(job['location'] or 'Not Specified / Remote')}</p>
                <div style="margin-top: 24px;">
                    <a href="{job['apply_url']}" 
                       style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                       ⚡ Apply Directly Now
                    </a>
                </div>
            </div>
            """
        })
    except Exception as e:
        print(f"[Error] Resend email dispatch failed: {e}")
main.py
Python
import re
import time
from src.config import ROLE_INCLUDE_REGEX, ROLE_EXCLUDE_REGEX, LOCATION_REGEX
from src.ats_fetchers import fetch_active_companies, fetch_greenhouse_jobs, fetch_lever_jobs, fetch_ashby_jobs
from src.db import is_job_seen, record_seen_job
from src.notifier import send_telegram_alert, send_email_alert

def is_target_role(job: dict) -> bool:
    title = job.get("title", "")
    location = job.get("location", "")

    matches_role = bool(re.search(ROLE_INCLUDE_REGEX, title))
    is_excluded = bool(re.search(ROLE_EXCLUDE_REGEX, title))
    matches_location = bool(re.search(LOCATION_REGEX, location)) if location else True

    return matches_role and (not is_excluded) and matches_location

def run_pipeline():
    companies = fetch_active_companies()
    if not companies:
        print("[Info] No active companies found to process.")
        return

    print(f"[Pipeline] Processing {len(companies)} active companies...")

    for comp in companies:
        name = comp["name"]
        ats = comp["ats_type"]
        slug = comp["board_slug"]

        if not slug:
            continue

        raw_jobs = []
        if ats == "greenhouse":
            raw_jobs = fetch_greenhouse_jobs(slug)
        elif ats == "lever":
            raw_jobs = fetch_lever_jobs(slug)
        elif ats == "ashby":
            raw_jobs = fetch_ashby_jobs(slug)
        else:
            continue

        for job in raw_jobs:
            if not is_target_role(job):
                continue

            if not is_job_seen(job["job_id"], name):
                print(f"[New Job] Detected: {job['title']} at {name}")
                record_seen_job(job, name)
                send_telegram_alert(name, job)
                send_email_alert(name, job)
                time.sleep(1)

if __name__ == "__main__":
    run_pipeline()
.github/workflows/monitor.yml
YAML
name: Job Monitor Cron

on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:

concurrency:
  group: job-monitor-cron
  cancel-in-progress: true

jobs:
  run-monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Dependencies
        run: pip install -r requirements.txt

      - name: Execute Job Monitor Engine
        env:
          GOOGLE_SHEET_ID: ${{ secrets.GOOGLE_SHEET_ID }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
        run: python main.py