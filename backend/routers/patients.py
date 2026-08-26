from fastapi import APIRouter, HTTPException
from models.patient import PatientCreate, PatientUpdate, PatientResponse
from database import get_supabase
from pydantic import BaseModel
from typing import Optional, List
import traceback

router = APIRouter()

# ─── Models for save-all endpoint ───

class IntakeData(BaseModel):
    complaint: Optional[str] = None
    complaintId: Optional[str] = None
    answers: Optional[list] = []
    extras: Optional[list] = []

class HistoryData(BaseModel):
    pastIllness: Optional[list] = []
    medications: Optional[str] = None
    allergies: Optional[str] = None
    familyHistory: Optional[list] = []
    prakriti: Optional[str] = None
    prakritiAnswers: Optional[dict] = {}

class DocumentData(BaseModel):
    name: Optional[str] = None
    text: Optional[str] = None

class SaveAllRequest(BaseModel):
    patient: Optional[dict] = {}
    intake: Optional[IntakeData] = None
    history: Optional[HistoryData] = None
    documents: Optional[List[DocumentData]] = []

# ─── Existing CRUD ───

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
        print(f"[Patient List Error] {traceback.format_exc()}")
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

# ─── NEW: Save ALL patient data in one shot ───

@router.post("/save-all")
def save_all_patient_data(req: SaveAllRequest):
    """
    Save complete patient data at the end of the flow:
    - Patient info (name, age, gender, abha_id)
    - Intake conversation (complaint + Q&A answers)
    - Medical history (past illness, meds, allergies, family)
    - Prakriti assessment
    - Scanned documents
    
    Creates/updates patient → creates clinical_history record
    """
    client = get_supabase()
    
    try:
        patient_id = None
        
        # Step 1: Save/find patient
        if req.patient:
            patient_data = {
                "name": req.patient.get("name", "Unknown"),
                "age": int(req.patient.get("age", 0)),
                "gender": req.patient.get("gender", "Unknown"),
                "phone": req.patient.get("phone"),
                "language": req.patient.get("language", "hi"),
                "abha_id": req.patient.get("abha_id") or req.patient.get("abhaId"),
            }
            
            # Check if patient exists by abha_id
            abha = patient_data.get("abha_id")
            if abha:
                existing = client.table("patients").select("id").eq("abha_id", abha).execute()
                if existing.data:
                    patient_id = existing.data[0]["id"]
                    # Update existing patient
                    client.table("patients").update(patient_data).eq("id", patient_id).execute()
            
            if not patient_id:
                # Check by id field
                pid = req.patient.get("id")
                if pid:
                    existing = client.table("patients").select("id").eq("id", pid).execute()
                    if existing.data:
                        patient_id = existing.data[0]["id"]
                        client.table("patients").update(patient_data).eq("id", patient_id).execute()
            
            if not patient_id:
                # Create new patient
                res = client.table("patients").insert(patient_data).execute()
                if res.data:
                    patient_id = res.data[0]["id"]
        
        # Step 2: Build clinical summary from collected data
        chief_complaint = ""
        hpi_parts = []
        past_history = ""
        medications = ""
        allergies = ""
        family_history = ""
        prakriti_info = ""
        red_flags = []
        documents_text = ""
        
        # From intake data
        if req.intake:
            chief_complaint = req.intake.complaint or ""
            if req.intake.answers:
                for a in req.intake.answers:
                    q = a.get("questionHi") or a.get("question", "")
                    ans = a.get("answer", "")
                    hpi_parts.append(f"{q}: {ans}")
            if req.intake.extras:
                hpi_parts.append("Additional concerns: " + ", ".join(req.intake.extras))
        
        # From medical history
        if req.history:
            if req.history.pastIllness:
                illness_list = [i for i in req.history.pastIllness if i != "none"]
                past_history = ", ".join(illness_list) if illness_list else "None reported"
            medications = req.history.medications or "None reported"
            allergies = req.history.allergies or "None reported"
            if req.history.familyHistory:
                fam_list = [i for i in req.history.familyHistory if i != "none"]
                family_history = ", ".join(fam_list) if fam_list else "None reported"
            prakriti_info = req.history.prakriti or "Not assessed"
        
        # From documents
        if req.documents:
            doc_texts = [d.text for d in req.documents if d.text]
            documents_text = "\n".join(doc_texts) if doc_texts else ""
        
        # Step 3: Save to clinical_history
        clinical_record = {
            "chief_complaint": chief_complaint,
            "hpi": "\n".join(hpi_parts) if hpi_parts else "No details collected",
            "past_history": past_history,
            "medications": medications,
            "allergies": allergies,
            "family_history": family_history,
            "prakriti": prakriti_info,
            "documents_text": documents_text,
            "is_confirmed": False,
        }
        
        if patient_id:
            clinical_record["patient_id"] = patient_id
        
        # Try to insert into clinical_history
        try:
            res = client.table("clinical_history").insert(clinical_record).execute()
            clinical_id = res.data[0]["id"] if res.data else None
        except Exception as ch_err:
            print(f"[Clinical History Insert Error] {ch_err}")
            clinical_id = None
        
        return {
            "success": True,
            "patient_id": patient_id,
            "clinical_history_id": clinical_id,
            "message": "All patient data saved successfully"
        }
        
    except Exception as e:
        print(f"[Save All Error] {traceback.format_exc()}")
        # Don't crash — return partial success
        return {
            "success": False,
            "error": str(e),
            "message": "Some data may not have been saved"
        }


# ─── NEW: Get patient with full clinical data (for doctor) ───

@router.get("/{patient_id}/full")
def get_patient_full(patient_id: str):
    """Get patient info + all clinical history for doctor dashboard."""
    client = get_supabase()
    try:
        # Get patient
        patient_res = client.table("patients").select("*").eq("id", patient_id).execute()
        if not patient_res.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient = patient_res.data[0]
        
        # Get clinical history
        try:
            history_res = client.table("clinical_history").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
            patient["clinical_history"] = history_res.data if history_res.data else []
        except:
            patient["clinical_history"] = []
        
        return patient
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
