from fastapi import APIRouter, HTTPException
from models.patient import PatientCreate, PatientUpdate, PatientResponse
from database import get_supabase

router = APIRouter()

@router.post("", response_model=PatientResponse)
def create_patient(patient: PatientCreate):
    client = get_supabase()
    try:
        data = patient.dict()
        res = client.table("patients").insert(data).execute()
        return res.data[0]
    except Exception as e:
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
