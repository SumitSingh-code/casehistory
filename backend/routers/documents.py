from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from database import get_supabase
from services.ocr_service import process_document
import base64

router = APIRouter()

@router.post("/upload")
async def upload_document(session_id: str = Form(...), file: UploadFile = File(...)):
    client = get_supabase()
    try:
        content = await file.read()
        b64 = base64.b64encode(content).decode("utf-8")
        
        extracted_data = await process_document(b64, file.content_type)
        
        doc_data = {
            "session_id": session_id,
            "document_type": "other",
            "file_name": file.filename,
            "ocr_text": extracted_data.get("text", ""),
            "extracted_data": extracted_data.get("json", {})
        }
        
        res = client.table("uploaded_documents").insert(doc_data).execute()
        return res.data[0] if res.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
def get_documents(session_id: str):
    client = get_supabase()
    try:
        res = client.table("uploaded_documents").select("*").eq("session_id", session_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
