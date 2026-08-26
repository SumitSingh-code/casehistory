from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_supabase
from services.llm_service import generate_response
from services.redflag_service import detect_red_flags
import json

router = APIRouter()

class StartSessionRequest(BaseModel):
    patient_id: str
    session_type: str = "opd"

class MessageRequest(BaseModel):
    session_id: str
    message: str
    language: str = "hi"
    ayush_mode: bool = False

@router.post("/start")
def start_session(req: StartSessionRequest):
    client = get_supabase()
    try:
        data = {"patient_id": req.patient_id, "session_type": req.session_type}
        res = client.table("clinical_sessions").insert(data).execute()
        session_id = res.data[0]["id"]
        
        greeting = "Namaste! Main VaidyaAI hoon. Kripya mujhe bataiye aapko kya samasya ho rahi hai?"
        client.table("conversation_history").insert({
            "session_id": session_id,
            "role": "ai",
            "message": greeting
        }).execute()
        
        return {"session_id": session_id, "message": greeting}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message")
async def send_message(req: MessageRequest):
    client = get_supabase()
    try:
        client.table("conversation_history").insert({
            "session_id": req.session_id,
            "role": "patient",
            "message": req.message
        }).execute()

        red_flags = detect_red_flags(req.message)
        if red_flags:
            client.table("clinical_sessions").update({
                "priority": "flagged",
                "red_flag_alerts": red_flags
            }).eq("id", req.session_id).execute()

        hist = client.table("conversation_history").select("*").eq("session_id", req.session_id).order("created_at").execute()
        history_text = "\n".join([f"{msg['role']}: {msg['message']}" for msg in hist.data])
        
        prompt = f"Conversation so far:\n{history_text}\nNew patient message: {req.message}"
        
        system_instruction = (
            "You are VaidyaAI, a highly competent and compassionate clinical history taking AI. "
            "You ask one intelligent question at a time. "
            "If the patient complains of pain, follow the SOCRATES framework to characterize it. "
        )
        if req.ayush_mode:
            system_instruction += "As an AYUSH expert, seamlessly integrate questions for Dashavidha Pariksha, Prakriti, and Vikriti. "
            
        system_instruction += (
            "Detect red flags like chest pain radiating to arm, or stroke symptoms. "
            "Once you have gathered a comprehensive history, conclude by saying 'Thank you, your history is complete. The doctor will see you now.' "
            f"Respond appropriately in the requested language ({req.language})."
        )
        
        ai_reply = await generate_response(prompt, system_instruction, language=req.language)
        
        if ai_reply["success"]:
            msg = ai_reply["response"]
            client.table("conversation_history").insert({
                "session_id": req.session_id,
                "role": "ai",
                "message": msg
            }).execute()
            return {"response": msg, "red_flags": red_flags}
        else:
            return {"response": ai_reply["response"], "red_flags": red_flags}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prakriti")
def submit_prakriti(assessment: dict):
    return {"status": "received", "data": assessment}

@router.get("/session/{session_id}")
def get_session(session_id: str):
    client = get_supabase()
    try:
        sess = client.table("clinical_sessions").select("*").eq("id", session_id).execute()
        if not sess.data:
            raise HTTPException(status_code=404, detail="Session not found")
        hist = client.table("conversation_history").select("*").eq("session_id", session_id).order("created_at").execute()
        return {"session": sess.data[0], "history": hist.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
