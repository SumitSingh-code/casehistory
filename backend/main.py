from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import BACKEND_PORT
from routers import patients, intake, summary, documents

app = FastAPI(title="VaidyaAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
