import os
from dotenv import load_dotenv

load_dotenv()

# Supabase — strip() removes hidden whitespace/newlines from env vars
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

# Gemini (Primary)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# OpenRouter (Fallback)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# App
FRONTEND_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000").strip()
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
