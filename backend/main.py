from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import BACKEND_PORT
from routers import patients, intake, summary, documents

import os

app = FastAPI(title="VaidyaAI Backend")

# Allow both local dev and deployed Vercel frontend
allowed_origins = [
    "http://localhost:3000",
    "https://casehistory-nine.vercel.app",
    os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(intake.router, prefix="/api/intake", tags=["Intake"])
app.include_router(summary.router, prefix="/api/summary", tags=["Summary"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

@app.get("/api/health")
def health_check():
    from config import SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
    return {
        "status": "ok",
        "supabase_url": SUPABASE_URL[:30] + "..." if SUPABASE_URL else "NOT SET",
        "supabase_key": "SET" if SUPABASE_SERVICE_KEY else "NOT SET",
        "gemini_key": "SET" if GEMINI_API_KEY else "NOT SET",
    }

@app.get("/api/test-db")
def test_db():
    """Test actual Supabase connection with detailed debugging."""
    import socket
    import httpx
    from config import SUPABASE_URL, SUPABASE_SERVICE_KEY
    
    results = {"supabase_url_raw": repr(SUPABASE_URL), "url_length": len(SUPABASE_URL)}
    
    # Test 1: DNS resolution
    try:
        hostname = SUPABASE_URL.replace("https://", "").replace("http://", "").split("/")[0]
        results["hostname"] = hostname
        ip = socket.gethostbyname(hostname)
        results["dns"] = f"resolved to {ip}"
    except Exception as e:
        results["dns"] = f"FAILED: {e}"
    
    # Test 2: Direct HTTP request
    try:
        resp = httpx.get(f"{SUPABASE_URL}/rest/v1/", headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
        }, timeout=10)
        results["http"] = f"status {resp.status_code}"
    except Exception as e:
        results["http"] = f"FAILED: {type(e).__name__}: {e}"
    
    # Test 3: Supabase client
    try:
        from database import get_supabase
        client = get_supabase()
        res = client.table("patients").select("id").limit(1).execute()
        results["supabase"] = f"connected, {len(res.data)} patients"
    except Exception as e:
        results["supabase"] = f"FAILED: {type(e).__name__}: {e}"
    
    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
