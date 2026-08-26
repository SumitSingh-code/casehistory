from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ConversationMessage(BaseModel):
    role: str
    message: str
    message_type: str = "text"
    metadata: Optional[Dict[str, Any]] = {}

class ClinicalHistoryCreate(BaseModel):
    session_id: str
    chief_complaint: Optional[str] = None
    hpi: Optional[str] = None
    past_medical_history: Optional[str] = None
    past_surgical_history: Optional[str] = None
    drug_history: Optional[str] = None
    allergy_history: Optional[str] = None
    family_history: Optional[str] = None
    personal_history: Optional[str] = None
    review_of_systems: Optional[Dict[str, Any]] = {}
    prakriti: Optional[str] = None
    prakriti_details: Optional[Dict[str, Any]] = {}
    vikriti: Optional[str] = None
    agni_status: Optional[str] = None
    koshtha: Optional[str] = None
    dosha_assessment: Optional[Dict[str, Any]] = {}
    dhatu_assessment: Optional[Dict[str, Any]] = {}
    mala_assessment: Optional[Dict[str, Any]] = {}
    ahara_vihara: Optional[Dict[str, Any]] = {}
    nidana: Optional[str] = None
    samprapti: Optional[str] = None
    dashavidha_pariksha: Optional[Dict[str, Any]] = {}
    ai_summary: Optional[str] = None
    ai_summary_hindi: Optional[str] = None
    doctor_notes: Optional[str] = None
    is_confirmed: bool = False

class ClinicalHistoryResponse(ClinicalHistoryCreate):
    id: str
    created_at: datetime
    updated_at: datetime
