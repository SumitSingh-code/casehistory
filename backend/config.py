import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Gemini (Primary)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# OpenRouter (Fallback)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# App
FRONTEND_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
