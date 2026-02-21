# MedSift AI

> **Hacklytics 2026 @ Georgia Tech**
> Turn patient-doctor audio into structured care plans, SOAP notes, risk scores, and clinical research — fully local, zero cost, zero cloud.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & User Roles](#pages--user-roles)
- [API Reference](#api-reference)
- [Approval Workflow](#approval-workflow)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Overview

MedSift AI is an end-to-end, **fully local** medical intelligence platform that processes patient-doctor audio recordings through a five-stage AI pipeline:

```
Audio Recording
      │
      ▼
 Whisper STT  ──────────►  Raw Transcript
      │
      ▼
  Presidio PHI  ─────────►  Redacted Transcript
  Redaction
      │
      ▼
  LLaMA 3  ──────────────►  Care Plan  +  SOAP Note
  Extraction
      │
      ▼
  Risk Engine  ──────────►  Risk Score (0-100)  +  Red Flags
  (Rule + LLM)
      │
      ▼
  Literature  ───────────►  Relevant Papers  +  Clinical Trials
  Search
```

No audio, transcript, or patient data ever leaves the local machine. The entire pipeline runs on-device using open-source models.

---

## Features

### Core Pipeline

| # | Feature | Description |
|---|---------|-------------|
| 01 | **Local Transcription** | OpenAI Whisper converts audio to text entirely on-device. Supports `.mp3`, `.wav`, `.m4a`, `.webm`. |
| 02 | **PHI Redaction** | Microsoft Presidio strips names, SSNs, phone numbers, MRNs, dates of birth, and other identifiers before any AI model sees the text. |
| 03 | **Care Plan Extraction** | LLaMA 3 extracts medications (name, dosage, frequency), diagnostic tests ordered, follow-up instructions, and patient Q&A from the redacted transcript. |
| 04 | **SOAP Notes** | Generates structured clinical SOAP notes (Subjective, Objective, Assessment, Plan) with evidence quotes from the original transcript. |
| 05 | **Risk Scoring** | Hybrid rule-based + LLM engine produces a 0–100 patient risk score, identifies red flags, and categorises visits as Low / Medium / High risk. |
| 06 | **Literature Search** | Semantic Scholar API retrieves peer-reviewed papers ranked by citation impact. Results are personalised through clinician thumbs-up/thumbs-down feedback. |
| 07 | **Clinical Trials Matching** | Automatically matches patient conditions to actively recruiting studies on ClinicalTrials.gov. |

### Application Features

- **Live Recording** — Clinicians can record visits directly in the browser using the microphone; no external recorder needed.
- **File Upload** — Drag-and-drop any supported audio file with metadata (date, visit type, tags).
- **Approval Workflow** — Processed summaries are held for clinician review before being visible in the patient portal.
- **Role-Aware UI** — Separate clinician and patient views; patients see only their approved summaries.
- **Feedback Loop** — Clinicians approve/reject individual extracted items, improving future extractions.
- **PDF Export** — Full visit summary (care plan + SOAP + risk) available as a downloadable PDF for both clinicians and patients.
- **Analytics Dashboard** — Charts for risk distribution, top conditions, visit trends, and extraction accuracy over time.
- **Dark Mode** — Full system-aware dark mode across the entire application.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | React framework, SSR, file-based routing |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library (Button, Card, Badge, Dialog, etc.) |
| **Recharts** | Analytics charts (donut, bar, line) |
| **Lucide React** | Icon set |
| **Geist Font** | Typography (Vercel) |

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI** | Python REST API framework |
| **OpenAI Whisper** | Local speech-to-text transcription |
| **Microsoft Presidio** | Named-entity recognition for PHI detection and redaction |
| **LLaMA 3 (via Ollama)** | Local LLM for care plan extraction and SOAP note generation |
| **SQLite** | Lightweight local database for visits, feedback, and analytics |
| **Semantic Scholar API** | Academic literature retrieval |
| **ClinicalTrials.gov API** | Clinical trial matching |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Port 3000)                       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Landing  │  │  Upload  │  │  Visits  │  │   Analytics    │  │
│  │   Page    │  │ & Record │  │  Detail  │  │   Dashboard    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                         Next.js 14 App Router                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (localhost)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)                    │
│                                                                   │
│  POST /api/transcribe   ──►  Whisper STT                        │
│  POST /api/analyze      ──►  Presidio + LLaMA 3 + Risk Engine   │
│  GET  /api/visits       ──►  SQLite query                        │
│  GET  /api/visits/{id}  ──►  Full visit details                  │
│  GET  /api/literature/{id} ►  Semantic Scholar                   │
│  GET  /api/trials/{id}  ──►  ClinicalTrials.gov                  │
│  POST /api/feedback     ──►  Feedback store + keyword boosting   │
│  GET  /api/analytics    ──►  Aggregated stats                    │
│  GET  /api/export/{id}/pdf ► PDF generation                      │
│                                                                   │
│                    SQLite  ◄──────────────────────────────────►  │
└─────────────────────────────────────────────────────────────────┘
```

All processing happens locally. No data leaves the machine.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Ollama** with LLaMA 3 pulled (`ollama pull llama3`)
- **FFmpeg** (required by Whisper for audio decoding)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "GT Hackathon"
```

### 2. Start the Backend

```bash
# Navigate to the backend directory
cd medsift-backend        # adjust to your backend folder name

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 3. Start the Frontend

```bash
cd medsift-frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Log In

| Role | How to use |
|------|-----------|
| **Clinician** | Click "Clinician Login" → enter any name/email, select Clinician role |
| **Patient** | Click "Patient Login" → enter any name/email, select Patient role |

> Auth is simulated for the hackathon — credentials are stored in `localStorage`, no real auth backend required.

---

## Project Structure

```
GT Hackathon/
├── medsift-frontend/              # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, navbar)
│   │   ├── globals.css            # Global styles + animation keyframes
│   │   ├── page.tsx               # Landing / home page
│   │   ├── login/page.tsx         # Role-aware login
│   │   ├── dashboard/page.tsx     # Role-aware dashboard hub
│   │   ├── upload/page.tsx        # Audio upload + live recording + pipeline
│   │   ├── visits/
│   │   │   ├── page.tsx           # Visit history with search/filter
│   │   │   └── [id]/page.tsx      # Full visit detail (all tabs)
│   │   ├── analytics/page.tsx     # Charts and stats dashboard
│   │   └── literature/
│   │       └── [visit_id]/page.tsx # Papers + clinical trials
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx         # Top navigation (role-aware + notifications)
│   │   ├── MedSiftLogo.tsx        # Brand logo component
│   │   └── ui/                    # shadcn/ui primitives
│   ├── lib/
│   │   ├── api.ts                 # Typed API client (all endpoints)
│   │   └── utils.ts               # cn() helper, formatters
│   └── types/
│       └── index.ts               # TypeScript interfaces (mirrors Pydantic models)
│
├── medsift-backend/               # FastAPI backend (separate repo/folder)
├── .gitignore
└── README.md
```

---

## Pages & User Roles

### Landing Page (`/`)
Full-width animated hero with ECG background, feature grid, pipeline diagram, and tech stack. Entry point for both roles.

### Login (`/login`)
Single page with a role toggle. Stores `{ name, email, role }` in `localStorage`. Redirects to the appropriate dashboard.

### Dashboard (`/dashboard`)

**Clinician view:**
- Summary stat cards (total visits, pending approvals, avg risk score, high-risk count)
- Amber notification banner when summaries are awaiting approval
- Visit cards with patient summary snippet, medication pills, and inline "Approve & Release" button
- Quick actions: New Recording, Live Record

**Patient view:**
- Only shows visits that have been approved by a clinician
- Risk level badge, next follow-up reminder
- Quick link to My Visits

### Upload & Process (`/upload`)

Two recording modes:
- **File Upload** — drag-and-drop `.mp3`, `.wav`, `.m4a`, `.webm`
- **Live Recording** — browser microphone via MediaRecorder API with live timer

After recording/upload, a 5-stage animated pipeline runs:
1. Uploading audio
2. Transcribing (Whisper)
3. Redacting PHI (Presidio)
4. Extracting care plan (LLaMA 3)
5. Scoring risk

Results are shown in tabs: Care Plan | SOAP Note | Risk | Transcript. Empty SOAP fields are highlighted in red. The visit is held for clinician approval before becoming visible to the patient.

### Visit History (`/visits`)
Search bar, tag filter chips, sort controls, paginated grid of visit cards. Each card shows date, type, risk badge, and top conditions. Clinicians see all visits; patients see only approved ones.

### Visit Detail (`/visits/[id]`)

Five tabs:
| Tab | Contents |
|-----|---------|
| **Patient Summary** | Medications table, tests ordered, follow-up checklist, Q&A accordion, PDF export |
| **SOAP Note** | Full S/O/A/P with evidence quotes; empty fields shown in red |
| **Risk Assessment** | Score gauge, risk factors list, red flags panel |
| **Literature & Trials** | Ranked papers with 👍/👎, clinical trial cards with status badges |
| **Transcript** | Raw vs redacted side-by-side |

Clinicians see an approval banner with "Approve & Release to Patient" button. Patients see a "Summary under review" banner when pending.

### Analytics (`/analytics`)
- Total visits, avg risk score, extraction accuracy %, paper relevance rate %
- Donut: risk level distribution
- Bar: top 10 conditions
- Line: visits over time
- Grouped bar: extraction accuracy by item type
- Keyword boost leaderboard

### Literature (`/literature/[visit_id]`)
Two-column layout: papers (sorted by citation count) and clinical trials. Each paper has title, authors, year, journal, abstract snippet, relevance explanation, and thumbs feedback. Trials show status badge (RECRUITING), conditions, interventions, location, and link.

---

## API Reference

All endpoints are served from `http://localhost:8000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/transcribe` | Upload audio file; returns raw transcript |
| `POST` | `/api/analyze` | Analyze transcript; returns care plan, SOAP, risk |
| `GET` | `/api/visits` | List visits with optional search/tag/sort params |
| `GET` | `/api/visits/{id}` | Full visit details |
| `DELETE` | `/api/visits/{id}` | Delete a visit |
| `GET` | `/api/export/{id}/pdf` | Download visit summary as PDF |
| `GET` | `/api/literature/{id}` | Retrieve papers for a visit |
| `GET` | `/api/trials/{id}` | Retrieve clinical trials for a visit |
| `POST` | `/api/feedback` | Submit clinician feedback (item approval / paper rating) |
| `GET` | `/api/analytics` | Aggregated analytics stats |
| `GET` | `/api/feedback/analytics` | Extraction accuracy by item type |

---

## Approval Workflow

MedSift AI includes a clinician-gated approval workflow to ensure patients only see reviewed summaries:

```
Clinician processes recording
           │
           ▼
   Visit saved → added to "Pending Approval" queue
           │
           ▼
   Clinician receives bell notification (navbar badge)
           │
           ▼
   Clinician reviews visit in dashboard or detail page
           │
     ┌─────┴──────┐
     │  Approve   │
     └─────┬──────┘
           │
           ▼
   Visit moved to "Approved" → visible in patient portal
```

In the current implementation this state is managed in `localStorage` (`medsift_pending` and `medsift_approvals` keys) to simulate the workflow without additional backend endpoints. A production implementation would persist this state server-side.

---

## Future Enhancements

### Short-Term (Next Sprint)

- [ ] **Real authentication** — JWT-based auth with refresh tokens; replace `localStorage` session with secure HTTP-only cookies
- [ ] **Backend approval endpoint** — `POST /api/visits/{id}/approve` persists approval state in SQLite instead of localStorage
- [ ] **Push notifications** — WebSocket or SSE channel so clinicians receive real-time approval alerts without page refresh
- [ ] **Patient messaging** — Secure in-app messaging thread between patient and clinician per visit
- [ ] **Multi-language support** — Whisper already supports 100+ languages; expose language selection in the upload UI
- [ ] **FHIR export** — Export structured care plan as HL7 FHIR R4 Bundle for EHR integration

### Medium-Term

- [ ] **Speaker diarisation** — Use WhisperX or pyannote.audio to separate doctor vs patient speech in the transcript
- [ ] **Structured medication database** — Validate extracted drug names against RxNorm; flag interactions via OpenFDA
- [ ] **ICD-10 / CPT code suggestion** — Auto-suggest billing codes from the SOAP assessment
- [ ] **Appointment scheduling integration** — Generate calendar invite from follow-up instructions (Google Calendar / iCal)
- [ ] **Batch processing** — Queue multiple recordings and process overnight
- [ ] **Custom keyword boosting UI** — Let clinicians manage their boosted keyword list directly in the app

### Long-Term / Research

- [ ] **Fine-tuned medical LLM** — Fine-tune LLaMA 3 on de-identified clinical notes for higher extraction accuracy
- [ ] **Differential diagnosis suggestions** — Leverage assessment data to surface potential alternative diagnoses
- [ ] **Population health analytics** — Aggregate anonymised statistics across a clinic for trend monitoring
- [ ] **Voice-activated commands** — Hands-free navigation and dictation during live visits
- [ ] **Federated learning** — Improve models across multiple clinics without sharing raw data
- [ ] **EHR deep integration** — Epic / Cerner SMART on FHIR app for seamless workflow embedding
- [ ] **Mobile app** — React Native companion app for on-the-go review by clinicians

---

## Disclaimer

MedSift AI is a **hackathon prototype** built for educational and demonstration purposes only.

- It does **not** provide medical diagnoses, treatment recommendations, or clinical advice.
- It is **not** FDA-approved or certified for clinical use.
- It is **not** a substitute for professional medical judgment.
- PHI redaction is best-effort and should not be relied upon for HIPAA compliance in production.

Always consult a qualified healthcare professional for medical decisions.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with love at Hacklytics 2026 @ Georgia Tech*
