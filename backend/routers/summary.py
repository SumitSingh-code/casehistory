from fastapi import APIRouter, HTTPException
from database import get_supabase
from services.summary_service import generate_clinical_summary
import base64
import qrcode
from io import BytesIO
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SummaryUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    hpi: Optional[str] = None
    doctor_notes: Optional[str] = None

@router.post("/generate/{session_id}")
async def generate_summary(session_id: str):
    client = get_supabase()
    try:
        hist = client.table("conversation_history").select("*").eq("session_id", session_id).order("created_at").execute()
        if not hist.data:
            raise HTTPException(status_code=404, detail="No history found")
        
        conversation = "\n".join([f"{msg['role']}: {msg['message']}" for msg in hist.data])
        
        summary = await generate_clinical_summary(conversation)
        
        if not summary.get("chief_complaint"):
            summary["chief_complaint"] = "Not provided"
        
        summary["session_id"] = session_id
        
        res = client.table("clinical_history").upsert(summary).execute()
        return res.data[0] if res.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}")
def get_summary(session_id: str):
    client = get_supabase()
    try:
        res = client.table("clinical_history").select("*").eq("session_id", session_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Summary not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{session_id}")
def edit_summary(session_id: str, data: SummaryUpdate):
    client = get_supabase()
    try:
        res = client.table("clinical_history").update(data.dict(exclude_unset=True)).eq("session_id", session_id).execute()
        return res.data[0] if res.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/confirm")
def confirm_summary(session_id: str):
    client = get_supabase()
    try:
        res = client.table("clinical_history").update({"is_confirmed": True}).eq("session_id", session_id).execute()
        client.table("clinical_sessions").update({"status": "reviewed"}).eq("id", session_id).execute()
        return {"status": "confirmed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}/qr")
def generate_qr(session_id: str):
    try:
        data = f"https://vaidya-ai.app/summary/{session_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"qr_code_base64": img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
