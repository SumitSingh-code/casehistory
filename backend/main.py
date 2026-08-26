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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
