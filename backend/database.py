from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client | None = None


def get_supabase() -> Client:
    """Get or create Supabase client. Returns None-safe client."""
    global supabase
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError(
                "Supabase credentials not configured. "
                "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return supabase
