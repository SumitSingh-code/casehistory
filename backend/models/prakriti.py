from pydantic import BaseModel
from typing import Dict

class DoshaScore(BaseModel):
    vata: int
    pitta: int
    kapha: int

class PrakritiAssessment(BaseModel):
    session_id: str
    answers: Dict[str, str]

class PrakritiResponse(BaseModel):
    prakriti_type: str
    dosha_scores: DoshaScore
    description: str
