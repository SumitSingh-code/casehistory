import google.generativeai as genai
from config import GEMINI_API_KEY
import base64

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def process_document(image_b64: str, mime_type: str) -> dict:
    if not GEMINI_API_KEY:
        return {"text": "OCR unavailable (No API key)", "json": {}}
        
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        image_part = {
            "mime_type": mime_type,
            "data": image_b64
        }
        
        prompt = "Extract text from this medical document and structure it as JSON containing medications, diagnoses, and lab_values. Also return the raw text."
        response = model.generate_content([prompt, image_part])
        
        text = response.text
        
        import json
        extracted_json = {}
        try:
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
                extracted_json = json.loads(json_str)
        except Exception:
            pass
            
        return {"text": text, "json": extracted_json}
    except Exception as e:
        print(f"OCR Error: {e}")
        return {"text": "Failed to extract text", "json": {}}
