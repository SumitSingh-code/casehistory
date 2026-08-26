-- ============================================
-- VaidyaAI — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Patients Table
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abha_id VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(15),
    language VARCHAR(10) DEFAULT 'hi',
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Clinical Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS clinical_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'opd' CHECK (session_type IN ('opd', 'ipd', 'emergency')),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'flagged', 'emergency')),
    red_flag_alerts JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ
);

-- ============================================
-- 3. Conversation History Table
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ai', 'patient')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'touch_selection')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Clinical History (Structured Output)
-- ============================================
CREATE TABLE IF NOT EXISTS clinical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    
    -- Allopathic History
    chief_complaint TEXT,
    hpi TEXT,
    past_medical_history TEXT,
    past_surgical_history TEXT,
    drug_history TEXT,
    allergy_history TEXT,
    family_history TEXT,
    personal_history TEXT,
    review_of_systems JSONB DEFAULT '{}'::jsonb,
    
    -- AYUSH / Ayurvedic History
    prakriti VARCHAR(50),
    prakriti_details JSONB DEFAULT '{}'::jsonb,
    vikriti TEXT,
    agni_status VARCHAR(50),
    koshtha VARCHAR(50),
    dosha_assessment JSONB DEFAULT '{}'::jsonb,
    dhatu_assessment JSONB DEFAULT '{}'::jsonb,
    mala_assessment JSONB DEFAULT '{}'::jsonb,
    ahara_vihara JSONB DEFAULT '{}'::jsonb,
    nidana TEXT,
    samprapti TEXT,
    dashavidha_pariksha JSONB DEFAULT '{}'::jsonb,
    
    -- AI Summary
    ai_summary TEXT,
    ai_summary_hindi TEXT,
    
    -- Doctor Edits
    doctor_notes TEXT,
    is_confirmed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Uploaded Documents
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('prescription', 'lab_report', 'discharge_summary', 'imaging', 'other')),
    file_url TEXT,
    file_name VARCHAR(255),
    ocr_text TEXT,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    document_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Seed Data — Demo Patient
-- ============================================
INSERT INTO patients (id, abha_id, name, age, gender, phone, language, address)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '12-3456-7890-1234',
    'Ramesh Kumar',
    58,
    'male',
    '9876543210',
    'hi',
    'Block A, Safdarjung Enclave, New Delhi - 110029'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clinical_sessions (id, patient_id, status, priority, started_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'completed',
    'flagged',
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clinical_history (
    id, session_id,
    chief_complaint, hpi, past_medical_history, drug_history, allergy_history,
    family_history, personal_history,
    prakriti, agni_status, koshtha, vikriti, nidana,
    dosha_assessment, ahara_vihara, dashavidha_pariksha,
    ai_summary, ai_summary_hindi, is_confirmed
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Chest burning and acid reflux for 3 months',
    'Patient reports burning sensation in chest (retrosternal) for the past 3 months, worse after meals especially spicy food, associated with sour eructation and occasional nausea. No radiation to arm or jaw. No exertional component. Partially relieved by antacids. Sleep disturbed due to symptoms when lying flat.',
    'Type 2 Diabetes Mellitus - 10 years. Hypertension - 5 years. No surgical history.',
    'Tab Metformin 500mg BD, Tab Telmisartan 40mg OD, Antacid syrup SOS',
    'Sulfa drugs - causes skin rash',
    'Father - Diabetes, Hypertension. Mother - Hypothyroidism. No family history of cardiac disease or cancer.',
    'Non-smoker, occasional alcohol (social), vegetarian, sedentary lifestyle, software professional, sleeps 5-6 hours.',
    'Vata-Pitta',
    'Mandagni',
    'Krura',
    'Pitta Vriddhi in Annavaha and Annamahasrotas, Vata Prakopa due to irregular diet timing',
    'Vidahi ahara (spicy food), Vishamashana (irregular eating), Ratri Jagarana (late nights), Manasika Chinta (mental stress)',
    '{"vata": "moderately_aggravated", "pitta": "severely_aggravated", "kapha": "normal"}',
    '{"diet_type": "vegetarian", "meal_timing": "irregular", "water_intake": "moderate", "spicy_food": "frequent", "sleep_hours": "5-6", "exercise": "sedentary", "stress_level": "high"}',
    '{"prakriti": "Vata-Pitta", "vikriti": "Pitta Vriddhi", "sara": "Madhyama Rakta Sara", "samhanana": "Madhyama", "pramana": "Sama", "satmya": "Madhyama", "sattva": "Madhyama", "ahara_shakti": "Avara (poor - Mandagni)", "vyayama_shakti": "Avara (sedentary)", "vayas": "Madhyama (58 yrs)"}',
    'CLINICAL SUMMARY:\n\n58-year-old male presents with retrosternal burning × 3 months, post-prandial aggravation, associated with sour eructation. Known DM2 (10yr) and HTN (5yr) on Metformin and Telmisartan. Allergic to Sulfa drugs.\n\nAYUSH Assessment: Vata-Pitta Prakriti with Pitta Vriddhi. Mandagni with Ama formation likely. Nidana includes Vidahi Ahara and Vishamashana.\n\nFLAGGED: HbA1c 8.2% (poor glycemic control). Needs cardiac evaluation to rule out atypical angina given age and DM risk profile.\n\nSuggested: Avipattikar Churna, Yashtimadhu, dietary correction (Pathya), stress management.',
    'क्लिनिकल सारांश:\n\n58 वर्षीय पुरुष रोगी को 3 महीने से छाती में जलन, खाने के बाद बढ़ती है, खट्टी डकार आती है। 10 साल से मधुमेह और 5 साल से उच्च रक्तचाप है। सल्फा दवाओं से एलर्जी।\n\nआयुर्वेदिक मूल्यांकन: वात-पित्त प्रकृति, पित्त वृद्धि। मन्दाग्नि, आम निर्माण की संभावना।\n\nसूचित: HbA1c 8.2% (खराब शुगर नियंत्रण)। हृदय परीक्षण आवश्यक।',
    FALSE
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON clinical_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON clinical_sessions(status);
CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_history_session ON clinical_history(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_session ON uploaded_documents(session_id);

-- ============================================
-- 8. Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER clinical_history_updated_at
    BEFORE UPDATE ON clinical_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
