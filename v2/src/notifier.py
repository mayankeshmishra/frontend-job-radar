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

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
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
