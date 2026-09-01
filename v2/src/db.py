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
