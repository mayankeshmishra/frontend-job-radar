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

        print(f"[{name}] Fetched {len(raw_jobs)} total jobs from {ats}")

        for job in raw_jobs:
            if not is_target_role(job):
                # Uncomment the line below to see all the jobs that get ignored
                print(f"  [Ignored] {job.get('title')} | {job.get('location')}")
                continue

            if not is_job_seen(job["job_id"], name):
                print(f"[New Job] Detected: {job['title']} at {name}")
                record_seen_job(job, name)
                send_telegram_alert(name, job)
                send_email_alert(name, job)
                time.sleep(1)

if __name__ == "__main__":
    run_pipeline()
