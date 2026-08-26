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

@app.get("/api/test-ai")
async def test_ai():
    """Test AI providers with direct HTTP calls."""
    import httpx
    from config import GEMINI_API_KEY, OPENROUTER_API_KEY
    results = {
        "gemini_key_prefix": f"{GEMINI_API_KEY[:15]}..." if GEMINI_API_KEY else "NOT SET",
        "gemini_key_length": len(GEMINI_API_KEY) if GEMINI_API_KEY else 0,
        "openrouter_key_prefix": f"{OPENROUTER_API_KEY[:15]}..." if OPENROUTER_API_KEY else "NOT SET",
    }
    
    # Test Gemini via direct REST API (bypass SDK)
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # First try to list models
                list_resp = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
                )
                if list_resp.status_code == 200:
                    models = [m["name"] for m in list_resp.json().get("models", [])[:5]]
                    results["gemini_models"] = models
                    
                    # Try generate with gemini-3.6-flash
                    if models:
                        model_name = "models/gemini-3.6-flash"
                        gen_resp = await client.post(
                            f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={GEMINI_API_KEY}",
                            json={"contents": [{"parts": [{"text": "Say hello in one word"}]}]}
                        )
                        if gen_resp.status_code == 200:
                            text = gen_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                            results["gemini"] = f"OK: {text[:50]}"
                        else:
                            results["gemini"] = f"GENERATE FAILED: {gen_resp.status_code} {gen_resp.text[:200]}"
                else:
                    results["gemini"] = f"LIST FAILED: {list_resp.status_code} {list_resp.text[:200]}"
        except Exception as e:
            results["gemini"] = f"ERROR: {type(e).__name__}: {str(e)[:200]}"
    
    # Test OpenRouter via direct HTTP call
    if OPENROUTER_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "meta-llama/llama-3.1-8b-instruct:free",
                        "messages": [{"role": "user", "content": "Say hi"}],
                        "max_tokens": 10,
                    }
                )
                results["openrouter_status"] = resp.status_code
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["choices"][0]["message"]["content"]
                    results["openrouter"] = f"OK: {text[:50]}"
                else:
                    results["openrouter"] = f"FAILED: {resp.text[:300]}"
        except Exception as e:
            results["openrouter"] = f"ERROR: {type(e).__name__}: {str(e)[:200]}"
    
    return results

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
