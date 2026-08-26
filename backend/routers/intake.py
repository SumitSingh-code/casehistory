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
        
        # Build complaint-specific decision tree guidance
        complaint_guidance = ""
        msg_lower = req.message.lower()
        if any(kw in msg_lower for kw in ["headache", "sir dard", "sar dard", "सिर दर्द"]):
            complaint_guidance = (
                "The patient has a HEADACHE. Follow this decision tree: "
                "1) Duration (Kab se?), 2) Location (Ek taraf ya poore sar?), "
                "3) Associated symptoms (Ulti/chakkar?), 4) Any other problem? "
            )
        elif any(kw in msg_lower for kw in ["fever", "bukhar", "बुखार"]):
            complaint_guidance = (
                "The patient has FEVER. Follow this decision tree: "
                "1) Duration (Kab se?), 2) Severity (Kitna bukhar?), "
                "3) Associated symptoms (Khaansi/sardi?), 4) Any other problem? "
            )
        elif any(kw in msg_lower for kw in ["chest", "seene", "chhati", "छाती", "सीने"]):
            complaint_guidance = (
                "The patient has CHEST PAIN — HIGH PRIORITY. Follow this decision tree: "
                "1) Duration (Kab se?), 2) Location (Kis taraf?), "
                "3) Breathing difficulty (Saans mein dikkat?), 4) Sweating (Pasina?), "
                "5) Radiation to arm/jaw? This is a potential cardiac red flag. "
            )
        elif any(kw in msg_lower for kw in ["stomach", "pet", "पेट"]):
            complaint_guidance = (
                "The patient has STOMACH PAIN. Follow this decision tree: "
                "1) Duration (Kab se?), 2) Relation to food (Khaane ke baad/pehle?), "
                "3) Associated symptoms (Ulti/dast?), 4) Any other problem? "
            )
        elif any(kw in msg_lower for kw in ["cough", "khansi", "khaansi", "खांसी"]):
            complaint_guidance = (
                "The patient has COUGH. Follow this decision tree: "
                "1) Duration (Kab se?), 2) Type (Sukkhi/balgam wali?), "
                "3) Associated symptoms (Bukhar?), 4) Any other problem? "
            )

        system_instruction = (
            "You are VaidyaAI, a highly competent and compassionate clinical history taking AI. "
            "You ask ONE intelligent question at a time. Keep questions short and simple. "
            "Questions should be SPECIFIC to the complaint mentioned. "
            "For ANY pain complaint, follow the SOCRATES framework: "
            "Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, Severity. "
        )
        
        if complaint_guidance:
            system_instruction += complaint_guidance
        
        if req.ayush_mode:
            system_instruction += (
                "As an AYUSH expert, seamlessly integrate Dashavidha Pariksha questions: "
                "Prakriti (body constitution), Vikriti (current imbalance), Sara (tissue quality), "
                "Samhanana (body compactness), Satva (mental temperament), Ahara Shakti (digestive capacity). "
            )
            
        if req.language == 'hi':
            system_instruction += (
                "You MUST respond ONLY in Hindi (Devanagari script). Do NOT use English at all. "
                "हमेशा हिंदी में जवाब दो। Use natural conversational Hindi. "
                "Natural closing: 'और कोई दिक्कत है?' before finishing. "
            )
        else:
            system_instruction += "Respond in English. Use simple, clear language. "
            
        system_instruction += (
            "RED FLAG DETECTION: Only flag emergencies when MULTIPLE indicators are present together. "
            "For example: chest pain PLUS sweating/arm pain = cardiac red flag. "
            "Single symptoms alone (like headache) are NOT red flags. "
            "If you detect a genuine multi-indicator emergency, alert immediately. "
            "Once you have gathered a comprehensive history (at least 4-5 exchanges), "
            "conclude by saying 'Thank you' or 'धन्यवाद'. "
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
