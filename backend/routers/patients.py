from fastapi import APIRouter, HTTPException
from models.patient import PatientCreate, PatientUpdate, PatientResponse
from database import get_supabase
from pydantic import BaseModel
from typing import Optional, List
import traceback

router = APIRouter()

# ─── Models ───

class SaveAllRequest(BaseModel):
    patient: Optional[dict] = {}
    intake: Optional[dict] = {}
    history: Optional[dict] = {}
    documents: Optional[list] = []

# ─── CRUD ───

@router.post("", response_model=PatientResponse)
def create_patient(patient: PatientCreate):
    client = get_supabase()
    try:
        data = patient.dict()
        res = client.table("patients").insert(data).execute()
        return res.data[0]
    except Exception as e:
        print(f"[Patient Create Error] {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=list[PatientResponse])
def list_patients():
    client = get_supabase()
    try:
        res = client.table("patients").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str):
    client = get_supabase()
    try:
        res = client.table("patients").select("*").eq("id", patient_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, patient: PatientUpdate):
    client = get_supabase()
    try:
        data = patient.dict(exclude_unset=True)
        res = client.table("patients").update(data).eq("id", patient_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SAVE ALL: Complete patient data in one shot ───

@router.post("/save-all")
def save_all_patient_data(req: SaveAllRequest):
    """
    Saves ALL patient data at the end of the flow:
    1. Creates/finds patient in patients table
    2. Creates clinical_session linked to patient
    3. Creates clinical_history with all collected data
    
    Uses EXACT column names from Supabase:
    - clinical_sessions: patient_id, session_type, status
    - clinical_history: session_id, chief_complaint, hpi, past_medical_history,
                        drug_history, allergy_history, family_history, is_confirmed
    """
    client = get_supabase()
    patient_id = None
    session_id = None
    
    try:
        # ─── Step 1: Save/find patient ───
        if req.patient:
            abha_id = req.patient.get("abha_id") or req.patient.get("abhaId")
            
            patient_data = {
                "name": req.patient.get("name", "Unknown"),
                "age": int(req.patient.get("age") or 0),
                "gender": req.patient.get("gender", "Unknown"),
                "phone": req.patient.get("phone"),
                "language": req.patient.get("language", "hi"),
            }
            if abha_id:
                patient_data["abha_id"] = abha_id
            
            # Check if patient exists by ABHA ID
            if abha_id:
                try:
                    existing = client.table("patients").select("id").eq("abha_id", abha_id).execute()
                    if existing.data:
                        patient_id = existing.data[0]["id"]
                        client.table("patients").update(patient_data).eq("id", patient_id).execute()
                except:
                    pass
            
            # Check by UUID
            if not patient_id:
                pid = req.patient.get("id")
                if pid and "-" in str(pid):
                    try:
                        existing = client.table("patients").select("id").eq("id", pid).execute()
                        if existing.data:
                            patient_id = existing.data[0]["id"]
                    except:
                        pass
            
            # Create new patient
            if not patient_id:
                try:
                    res = client.table("patients").insert(patient_data).execute()
                    if res.data:
                        patient_id = res.data[0]["id"]
                except Exception as pe:
                    print(f"[Patient Insert Error] {pe}")
        
        # ─── Step 2: Create clinical_session ───
        session_data = {"session_type": "opd", "status": "completed"}
        if patient_id:
            session_data["patient_id"] = patient_id
        
        try:
            res = client.table("clinical_sessions").insert(session_data).execute()
            if res.data:
                session_id = res.data[0]["id"]
        except Exception as se:
            print(f"[Session Insert Error] {se}")
        
        # ─── Step 3: Build clinical history from collected data ───
        chief_complaint = ""
        hpi_parts = []
        past_medical_history = ""
        drug_history = ""
        allergy_history = ""
        family_history_text = ""
        
        # From intake data (chat Q&A)
        intake = req.intake or {}
        if intake:
            chief_complaint = intake.get("complaint", "")
            answers = intake.get("answers", [])
            if answers:
                for a in answers:
                    q = a.get("questionHi") or a.get("question", "")
                    ans = a.get("answer", "")
                    if q and ans:
                        hpi_parts.append(f"{q}: {ans}")
            extras = intake.get("extras", [])
            if extras:
                hpi_parts.append("अतिरिक्त: " + ", ".join(extras))
        
        # From medical history (prakriti page)
        history = req.history or {}
        if history:
            illness_list = history.get("pastIllness", [])
            if illness_list:
                filtered = [i for i in illness_list if i and i != "none"]
                past_medical_history = ", ".join(filtered) if filtered else "None"
            
            drug_history = history.get("medications", "") or "None"
            allergy_history = history.get("allergies", "") or "None"
            
            fam_list = history.get("familyHistory", [])
            if fam_list:
                filtered = [i for i in fam_list if i and i != "none"]
                family_history_text = ", ".join(filtered) if filtered else "None"
        
        # ─── Step 4: Insert clinical_history with CORRECT column names ───
        clinical_record = {
            "chief_complaint": chief_complaint or "Not recorded",
            "hpi": "\n".join(hpi_parts) if hpi_parts else "No details collected",
            "past_medical_history": past_medical_history or "None",
            "drug_history": drug_history or "None",
            "allergy_history": allergy_history or "None",
            "family_history": family_history_text or "None",
            "is_confirmed": False,
        }
        
        if session_id:
            clinical_record["session_id"] = session_id
        
        clinical_id = None
        try:
            res = client.table("clinical_history").insert(clinical_record).execute()
            if res.data:
                clinical_id = res.data[0]["id"]
        except Exception as ch_err:
            print(f"[Clinical History Insert Error] {ch_err}")
            print(f"[Clinical History Data] {clinical_record}")
        
        return {
            "success": True,
            "patient_id": patient_id,
            "session_id": session_id,
            "clinical_history_id": clinical_id,
            "message": "All patient data saved successfully"
        }
        
    except Exception as e:
        print(f"[Save All Error] {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "message": "Error saving data"
        }


# ─── Get patient with clinical data (for doctor) ───

@router.get("/{patient_id}/full")
def get_patient_full(patient_id: str):
    """Get patient + all clinical history for doctor dashboard."""
    client = get_supabase()
    try:
        # Get patient
        patient_res = client.table("patients").select("*").eq("id", patient_id).execute()
        if not patient_res.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient = patient_res.data[0]
        
        # Get sessions for this patient
        try:
            sessions_res = client.table("clinical_sessions").select("id").eq("patient_id", patient_id).execute()
            session_ids = [s["id"] for s in sessions_res.data] if sessions_res.data else []
        except:
            session_ids = []
        
        # Get clinical history for these sessions
        clinical_records = []
        for sid in session_ids:
            try:
                hist_res = client.table("clinical_history").select("*").eq("session_id", sid).execute()
                if hist_res.data:
                    clinical_records.extend(hist_res.data)
            except:
                pass
        
        patient["clinical_history"] = clinical_records
        return patient
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
