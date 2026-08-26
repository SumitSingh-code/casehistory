from services.llm_service import generate_json_response

async def generate_clinical_summary(conversation: str) -> dict:
    prompt = f"Here is the conversation history:\n{conversation}\n\nPlease generate a structured clinical summary based on this."
    sys_instruction = """
    You are an expert physician and Ayurvedic Vaidya.
    Return ONLY a JSON object with these keys (fill based on conversation):
    - chief_complaint
    - hpi
    - past_medical_history
    - past_surgical_history
    - drug_history
    - allergy_history
    - family_history
    - personal_history
    - prakriti
    - vikriti
    - agni_status
    - koshtha
    - nidana
    - samprapti
    - ai_summary (A concise paragraph combining allopathic and ayush insights in English)
    - ai_summary_hindi (A concise paragraph combining allopathic and ayush insights in Hindi)
    
    If any information is not present in the conversation, leave its value as an empty string.
    Do NOT include any markdown blocks or text outside the JSON.
    """
    
    resp = await generate_json_response(prompt, sys_instruction)
    
    if resp["success"] and isinstance(resp["response"], dict):
        return resp["response"]
    
    return {}
