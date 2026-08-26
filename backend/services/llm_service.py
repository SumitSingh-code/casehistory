"""
LLM Service — Gemini (Primary) + OpenRouter (Fallback)

Handles all LLM calls with automatic failover:
1. Try Google Gemini API first
2. If Gemini fails (rate limit, error, timeout) → switch to OpenRouter
3. If both fail → return graceful fallback message (never crash)
"""

import google.generativeai as genai
import httpx
import json
import traceback
from config import GEMINI_API_KEY, OPENROUTER_API_KEY, OPENROUTER_BASE_URL

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

FALLBACK_MESSAGE = (
    "AI response abhi generate nahi ho paaya. "
    "Thodi der baad try karein. "
    "Aap touch options ka use karke apni jaankari de sakte hain."
)

FALLBACK_MESSAGE_EN = (
    "AI response could not be generated at this time. "
    "Please try again shortly or use the touch options to provide your information."
)


async def call_gemini(prompt: str, system_instruction: str = "", temperature: float = 0.7) -> str:
    """Call Google Gemini API."""
    try:
        # Try multiple model names for compatibility
        model_names = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"]
        last_error = None
        
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction or None,
                    generation_config=genai.GenerationConfig(
                        temperature=temperature,
                        max_output_tokens=2048,
                    ),
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    print(f"[Gemini OK] Model: {model_name}, Response length: {len(response.text)}")
                    return response.text
                raise ValueError(f"Empty response from Gemini ({model_name})")
            except Exception as model_err:
                last_error = model_err
                print(f"[Gemini] Model {model_name} failed: {type(model_err).__name__}: {model_err}")
                continue
        
        raise last_error or ValueError("All Gemini models failed")
    except Exception as e:
        print(f"[Gemini Error] {type(e).__name__}: {e}")
        raise


async def call_openrouter(
    prompt: str,
    system_instruction: str = "",
    temperature: float = 0.7,
    model: str = "google/gemini-2.0-flash-exp:free",
) -> str:
    """Call OpenRouter API as fallback."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key not configured")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vaidya-ai.app",
        "X-Title": "VaidyaAI",
    }

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2048,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if content:
                return content
            raise ValueError("Empty response from OpenRouter")
    except Exception as e:
        print(f"[OpenRouter Error] {type(e).__name__}: {e}")
        raise


async def generate_response(
    prompt: str,
    system_instruction: str = "",
    temperature: float = 0.7,
    language: str = "hi",
) -> dict:
    """
    Main LLM call with automatic failover.
    
    Returns: {
        "success": bool,
        "response": str,
        "provider": "gemini" | "openrouter" | "fallback",
        "error": str | None
    }
    """
    # Attempt 1: Gemini
    if GEMINI_API_KEY:
        try:
            result = await call_gemini(prompt, system_instruction, temperature)
            return {
                "success": True,
                "response": result,
                "provider": "gemini",
                "error": None,
            }
        except Exception as e:
            print(f"[Failover] Gemini failed, trying OpenRouter... ({e})")

    # Attempt 2: OpenRouter
    if OPENROUTER_API_KEY:
        try:
            result = await call_openrouter(prompt, system_instruction, temperature)
            return {
                "success": True,
                "response": result,
                "provider": "openrouter",
                "error": None,
            }
        except Exception as e:
            print(f"[Failover] OpenRouter also failed. ({e})")

    # Both failed — graceful fallback
    fallback = FALLBACK_MESSAGE if language == "hi" else FALLBACK_MESSAGE_EN
    return {
        "success": False,
        "response": fallback,
        "provider": "fallback",
        "error": "Both Gemini and OpenRouter failed to generate a response.",
    }


async def generate_json_response(
    prompt: str,
    system_instruction: str = "",
    temperature: float = 0.3,
    language: str = "hi",
) -> dict:
    """
    Generate LLM response and parse as JSON.
    Falls back gracefully if parsing fails.
    """
    result = await generate_response(prompt, system_instruction, temperature, language)

    if not result["success"]:
        return result

    # Try to extract JSON from response
    text = result["response"]
    try:
        # Try direct parse
        parsed = json.loads(text)
        result["response"] = parsed
        return result
    except json.JSONDecodeError:
        pass

    # Try extracting JSON from markdown code block
    try:
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
            parsed = json.loads(json_str)
            result["response"] = parsed
            return result
        elif "```" in text:
            json_str = text.split("```")[1].split("```")[0].strip()
            parsed = json.loads(json_str)
            result["response"] = parsed
            return result
    except (json.JSONDecodeError, IndexError):
        pass

    # Return raw text if JSON parsing fails
    return result
