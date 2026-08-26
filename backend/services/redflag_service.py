"""
Red Flag Detection Engine

Rule-based + pattern matching for emergency symptom detection.
Covers cardiac, stroke, respiratory, and other critical emergencies.
Supports both English and Hindi keywords.
"""

import re

# Emergency patterns with categories and severity
RED_FLAG_PATTERNS = {
    "cardiac_emergency": {
        "severity": "critical",
        "display": "🚨 Possible Cardiac Emergency",
        "keywords_en": [
            "chest pain", "heart attack", "chest tightness", "chest pressure",
            "pain radiating to arm", "pain radiating to jaw", "crushing chest pain",
            "heart racing", "palpitations", "cardiac arrest"
        ],
        "keywords_hi": [
            "छाती में दर्द", "सीने में दर्द", "छाती में जकड़न", "दिल का दौरा",
            "सीने में भारीपन", "बाएं हाथ में दर्द", "जबड़े में दर्द",
            "दिल की धड़कन तेज", "सीना दबना"
        ],
    },
    "stroke": {
        "severity": "critical",
        "display": "🚨 Possible Stroke (FAST)",
        "keywords_en": [
            "facial droop", "face drooping", "arm weakness", "arm numbness",
            "speech difficulty", "slurred speech", "sudden confusion",
            "sudden severe headache", "loss of balance", "vision loss sudden",
            "paralysis", "one side weak", "one side numb", "stroke"
        ],
        "keywords_hi": [
            "चेहरा टेढ़ा", "मुंह टेढ़ा", "हाथ में कमजोरी", "बोलने में दिक्कत",
            "लकवा", "एक तरफ सुन्न", "अचानक सिरदर्द", "एक तरफ कमजोरी",
            "बोली लड़खड़ाना", "पैरालिसिस"
        ],
    },
    "respiratory_emergency": {
        "severity": "critical",
        "display": "🚨 Respiratory Emergency",
        "keywords_en": [
            "can't breathe", "cannot breathe", "choking", "severe breathlessness",
            "breathing difficulty", "shortness of breath", "dyspnea",
            "suffocation", "turning blue", "cyanosis", "gasping"
        ],
        "keywords_hi": [
            "सांस नहीं आ रही", "सांस लेने में तकलीफ", "दम घुट रहा",
            "सांस फूलना", "सांस रुकना", "गला घोंटना", "सांस में दिक्कत"
        ],
    },
    "neurological_emergency": {
        "severity": "critical",
        "display": "🚨 Neurological Emergency",
        "keywords_en": [
            "unconscious", "unresponsive", "seizure", "convulsion", "fits",
            "loss of consciousness", "fainting", "blackout", "coma",
            "sudden confusion", "severe headache worst ever"
        ],
        "keywords_hi": [
            "बेहोश", "होश नहीं", "मिर्गी", "दौरे", "चक्कर आकर गिरना",
            "बेहोशी", "आंखों के आगे अंधेरा", "झटके आना"
        ],
    },
    "severe_bleeding": {
        "severity": "high",
        "display": "⚠️ Severe Hemorrhage",
        "keywords_en": [
            "heavy bleeding", "blood vomiting", "vomiting blood", "blood in stool",
            "coughing blood", "hematemesis", "hemoptysis", "hemorrhage",
            "bleeding not stopping", "severe bleeding"
        ],
        "keywords_hi": [
            "खून की उल्टी", "खून आ रहा बंद नहीं हो रहा", "पेशाब में खून",
            "खांसी में खून", "बहुत ज्यादा खून", "पॉटी में खून"
        ],
    },
    "allergic_emergency": {
        "severity": "high",
        "display": "⚠️ Possible Anaphylaxis",
        "keywords_en": [
            "throat swelling", "tongue swelling", "anaphylaxis",
            "severe allergic reaction", "can't swallow", "whole body rash",
            "lips swelling", "face swelling"
        ],
        "keywords_hi": [
            "गला सूज रहा", "जीभ सूज रही", "निगलने में दिक्कत",
            "पूरे शरीर पर दाने", "चेहरा सूज गया", "होंठ सूज गए"
        ],
    },
    "mental_health_crisis": {
        "severity": "high",
        "display": "⚠️ Mental Health Crisis",
        "keywords_en": [
            "suicide", "suicidal", "want to die", "kill myself",
            "self harm", "end my life", "no reason to live"
        ],
        "keywords_hi": [
            "आत्महत्या", "मरना चाहता", "मरना चाहती", "जीने का मन नहीं",
            "खुद को नुकसान"
        ],
    },
}

# Combination patterns (more specific, higher confidence)
COMBINATION_PATTERNS = [
    {
        "name": "ACS (Acute Coronary Syndrome)",
        "severity": "critical",
        "display": "🚨 HIGH SUSPICION: Acute Coronary Syndrome",
        "requires_any": ["chest pain", "छाती में दर्द", "सीने में दर्द", "chest tightness"],
        "plus_any": [
            "sweating", "पसीना", "nausea", "जी मचलना", "arm pain", "बाएं हाथ में दर्द",
            "jaw pain", "breathlessness", "सांस फूलना", "radiating"
        ],
    },
    {
        "name": "Stroke (FAST positive)",
        "severity": "critical",
        "display": "🚨 HIGH SUSPICION: Stroke",
        "requires_any": ["facial droop", "चेहरा टेढ़ा", "मुंह टेढ़ा", "face drooping", "slurred speech"],
        "plus_any": [
            "arm weakness", "हाथ में कमजोरी", "speech difficulty", "बोलने में दिक्कत",
            "one side", "एक तरफ", "sudden", "अचानक"
        ],
    },
]


def detect_red_flags(message: str) -> list:
    """
    Detect emergency red flags in patient message.
    
    Returns list of detected flags:
    [{"category": str, "keyword": str, "severity": str, "display": str}]
    """
    if not message:
        return []
        
    flags = []
    text = message.lower()
    seen_categories = set()

    # Check individual keyword patterns
    for category, pattern in RED_FLAG_PATTERNS.items():
        all_keywords = pattern["keywords_en"] + pattern["keywords_hi"]
        for kw in all_keywords:
            if kw.lower() in text and category not in seen_categories:
                flags.append({
                    "category": category,
                    "keyword": kw,
                    "severity": pattern["severity"],
                    "display": pattern["display"],
                })
                seen_categories.add(category)
                break  # One match per category is enough

    # Check combination patterns (higher confidence alerts)
    for combo in COMBINATION_PATTERNS:
        has_primary = any(kw.lower() in text for kw in combo["requires_any"])
        has_secondary = any(kw.lower() in text for kw in combo["plus_any"])
        if has_primary and has_secondary:
            flags.append({
                "category": combo["name"],
                "keyword": "combination_pattern",
                "severity": combo["severity"],
                "display": combo["display"],
            })

    return flags


def get_red_flag_summary(flags: list) -> str:
    """Generate a human-readable summary of detected red flags."""
    if not flags:
        return ""
    
    critical = [f for f in flags if f["severity"] == "critical"]
    high = [f for f in flags if f["severity"] == "high"]
    
    parts = []
    if critical:
        parts.append("⛑️ CRITICAL ALERTS: " + ", ".join(f["display"] for f in critical))
    if high:
        parts.append("⚠️ HIGH ALERTS: " + ", ".join(f["display"] for f in high))
    
    return " | ".join(parts)
