import os
# pyrefly: ignore [missing-import]
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
