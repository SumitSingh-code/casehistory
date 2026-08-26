# 🏥 VaidyaAI — AI-Powered Clinical History Taking Platform

> **SIH Problem Statement 26047** | Ministry of Ayush | All India Institute of Ayurveda

VaidyaAI is an AI-powered, voice-first clinical intake platform that enables patients to independently record their complete medical history through natural conversation and touch-based interaction, scan paper medical documents, and generate a structured physician-ready clinical summary — supporting both Allopathic and AYUSH (Ayurvedic) history frameworks.

## 🚀 Features

- **🎙️ Multilingual Voice AI** — Speak naturally in Hindi or English. AI understands colloquial medical terms.
- **🌿 AYUSH Integration** — Built-in Prakriti assessment (Dashavidha Pariksha) alongside allopathic history.
- **📄 Document OCR** — Scan old prescriptions and lab reports to extract clinical data automatically.
- **🚨 Red-Flag Detection** — AI detects emergency symptoms (cardiac, stroke, respiratory) in real-time.
- **👨‍⚕️ Doctor Dashboard** — Priority-sorted patient queue with structured clinical summaries.
- **🖨️ QR OPD Slip** — Bridge paper-digital gap with QR code-linked patient summaries.
- **🔒 Privacy-First** — No hardcoded keys, session auto-purge, DPDP Act 2023 compliant design.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS v4 |
| Backend | Python FastAPI |
| Database | Supabase (Hosted PostgreSQL) |
| AI (Primary) | Google Gemini API |
| AI (Fallback) | OpenRouter API |
| Voice | Web Speech API (Browser-native) |
| OCR | Gemini Vision API |

## 📦 Project Structure

```
vaidya-ai/
├── frontend/          # Next.js 14 App
│   ├── app/           # Pages (landing, register, intake, prakriti, scan, summary, doctor)
│   ├── components/    # Reusable UI components
│   └── lib/           # API client, constants
├── backend/           # FastAPI Python Backend
│   ├── routers/       # API endpoints
│   ├── services/      # AI, OCR, summary, red-flag services
│   └── models/        # Pydantic data models
├── .env.example       # Environment variables template
└── README.md
```

## ⚡ Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/SumitSingh-code/casehistory.git
cd casehistory
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → Run the contents of `backend/supabase_schema.sql`
3. Copy your project URL and keys into `.env`

### 3. Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# Backend runs at http://localhost:8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key ([Get free key](https://ai.google.dev)) |
| `OPENROUTER_API_KEY` | OpenRouter API key (fallback) ([Get key](https://openrouter.ai)) |

## 🏗️ Architecture

```
Patient → [Voice/Touch Input] → [Web Speech API] → [FastAPI Backend]
                                                        ↓
                                              [Gemini AI / OpenRouter]
                                                        ↓
                                              [Clinical History Engine]
                                                        ↓
                                              [Supabase Database]
                                                        ↓
Doctor ← [Dashboard Summary] ← [QR OPD Slip] ← [Structured FHIR Output]
```

## 👥 Team

Built for Smart India Hackathon 2025 — Problem Statement 26047

---

**VaidyaAI** — *Bridging Modern Medicine and AYUSH through AI* 🌿
