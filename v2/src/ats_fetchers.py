import csv
import io
import requests
from src.config import GOOGLE_SHEET_ID

def fetch_active_companies():
    if not GOOGLE_SHEET_ID:
        print("[Error] GOOGLE_SHEET_ID environment variable is missing.")
        return []
        
    url = f"https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/export?format=csv"
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
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"
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
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
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
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
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
