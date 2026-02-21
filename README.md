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
- [SMS Medication Reminders](#sms-medication-reminders)
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
| 03 | **Care Plan Extraction** | LLaMA 3 extracts medications (name, dosage, frequency, duration, instructions), diagnostic tests ordered, follow-up instructions, lifestyle recommendations, and patient Q&A. |
| 04 | **SOAP Notes** | Generates structured clinical SOAP notes (Subjective, Objective, Assessment, Plan) with evidence quotes from the original transcript. |
| 05 | **Risk Scoring** | Hybrid rule-based + LLM engine produces a 0–100 patient risk score, identifies red flags, and categorises visits as Low / Medium / High risk. |
| 06 | **Literature Search** | Semantic Scholar API retrieves peer-reviewed papers ranked by citation impact. Results are personalised through clinician thumbs-up/thumbs-down feedback. |
| 07 | **Clinical Trials Matching** | Automatically matches patient conditions to actively recruiting studies on ClinicalTrials.gov. |

### Application Features

| Feature | Description |
|---------|-------------|
| **Role-Aware UI** | Separate clinician and patient portals. Patients never see recording tools, SOAP notes, or unapproved data. |
| **Live Recording** | Clinicians record visits directly in the browser via MediaRecorder API — no external recorder needed. |
| **File Upload** | Drag-and-drop any supported audio file with metadata (date, visit type, custom tags). |
| **Approval Workflow** | Processed summaries are held for clinician review before appearing in the patient portal. |
| **Medications Page** | Patients view their complete medication history across all approved visits, filterable by status (Active / Completed / Review). |
| **SMS Medication Reminders** | Patients opt-in to SMS reminders at account creation. Consent (with phone number) is stored and displayed in the patient dashboard. |
| **Feedback Loop** | Clinicians approve/reject individual extracted items; ratings boost or suppress keywords in future literature searches. |
| **PDF Export** | Full visit summary (care plan + SOAP + risk) downloadable as a PDF. |
| **Analytics Dashboard** | Charts for risk distribution, top conditions, visit trends, and extraction accuracy over time. |
| **Inline Approval** | Clinicians approve visits directly from the dashboard visit cards without navigating to the detail page. |
| **Responsive Sidebar** | Collapsible sidebar navigation with hover animations (accent bar, icon scale, label nudge) and role-specific nav items. |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | React framework, SSR, file-based routing |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library (Button, Card, Badge, Dialog, Skeleton, etc.) |
| **Recharts** | Analytics charts (donut, bar, line) |
| **Lucide React** | Icon set |
| **Geist Font** | Typography (Vercel) |
| **Sonner** | Toast notification system |

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
│  ┌──────────┐  ┌──────────────────────────────────────────────┐  │
│  │  Meds    │  │        AppShell (Sidebar + Layout)           │  │
│  │  History │  │  Role-aware nav · Approval state · SMS flag  │  │
│  └──────────┘  └──────────────────────────────────────────────┘  │
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
cd medsift-backend

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
| **Clinician** | Select "Clinician" on login → pre-filled demo credentials → Sign In |
| **Patient (Sign In)** | Select "Patient" → pre-filled demo credentials → Sign In |
| **Patient (Sign Up)** | Select "Patient" → "Create Account" tab → fill name, DOB, phone, password → optionally consent to SMS reminders |

> Auth is simulated for the hackathon — credentials are stored in `localStorage`. No real auth backend is required.

---

## Project Structure

```
GT Hackathon/
├── medsift-frontend/              # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, AppShell wrapper)
│   │   ├── globals.css            # Global styles + all animation keyframes
│   │   ├── page.tsx               # Landing / home page (animated hero, pipeline)
│   │   ├── login/
│   │   │   └── page.tsx           # Split-screen login: form left, photo right
│   │   │                          #   • Sign In + Create Account modes (patient)
│   │   │                          #   • SMS consent checkbox
│   │   │                          #   • Role-specific Unsplash background photo
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Role-aware dashboard hub
│   │   ├── upload/
│   │   │   └── page.tsx           # Audio upload + live recording (clinician only)
│   │   ├── visits/
│   │   │   ├── page.tsx           # Visit history (role-filtered)
│   │   │   └── [id]/page.tsx      # Full visit detail (5 tabs)
│   │   ├── medications/
│   │   │   └── page.tsx           # Patient medication history + filter tabs
│   │   ├── analytics/
│   │   │   └── page.tsx           # Recharts analytics dashboard
│   │   └── literature/
│   │       └── [visit_id]/page.tsx # Papers + clinical trials with feedback
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Authenticated portal layout (sidebar + blobs)
│   │   │   ├── Navbar.tsx         # Public top navbar
│   │   │   └── Sidebar.tsx        # Collapsible sidebar (role-aware nav, animations)
│   │   └── ui/                    # shadcn/ui primitives
│   ├── lib/
│   │   ├── api.ts                 # Typed API client (all endpoints)
│   │   └── utils.ts               # cn() helper, formatters
│   └── types/
│       └── index.ts               # TypeScript interfaces (mirrors Pydantic models)
│                                  #   AuthUser includes phone + sms_consent fields
│
├── medsift-backend/               # FastAPI backend
├── .gitignore
└── README.md
```

---

## Pages & User Roles

### Landing Page (`/`)
Full-width animated hero with ECG background, feature grid (6 cards), interactive pipeline diagram, and tech stack. Entry point for both roles with role-specific CTA buttons.

### Login (`/login`)

Split-screen layout: form panel on the left, full-height role-specific photo on the right (Unsplash).

**Clinician:** Sign-in only. Pre-filled demo credentials. Photo shows a clinical/hospital environment.

**Patient — Sign In:** Pre-filled demo credentials. Photo shows a patient care environment.

**Patient — Create Account:** Extended form with:
- Full Name, Date of Birth, Phone Number, Confirm Password
- **SMS Medication Reminders consent** checkbox — opts patient in to receive text reminders
- Terms of Service and Privacy Policy links
- Google sign-in button (demo mode)

Stores `{ name, email, role, phone?, sms_consent? }` in `localStorage`. Redirects to `/dashboard`.

### Dashboard (`/dashboard`)

**Clinician view:**
- 4 stat cards: Total Visits · Avg Risk Score · High Risk Count · Pending Approvals
- Amber notification banner when summaries await approval
- Visit cards with patient summary snippet, first medication, inline Approve button
- "Upload or Record Audio" quick-action card
- Sidebar: Risk Distribution chart · Top Conditions · Keyword Boost status · Quick Links

**Patient view:**
- 3 stat cards: My Visits · Medications (total count) · SMS Reminders (Active / Not set up)
- Recent approved visits only
- SMS Reminders status card in sidebar — green when active (shows phone number + opt-out reminder), gray when not set up
- Quick Links: My Medications · All Visits

### Upload & Process (`/upload`) — Clinician Only

Patients who navigate to this URL are immediately redirected to their dashboard. Clinicians access:
- **File Upload** — drag-and-drop `.mp3`, `.wav`, `.m4a`, `.webm`
- **Live Recording** — browser microphone via MediaRecorder API with live waveform timer

After upload, a 5-stage animated pipeline runs:
1. Uploading audio
2. Transcribing (Whisper)
3. Redacting PHI (Presidio)
4. Extracting care plan (LLaMA 3)
5. Scoring risk

Results are shown in tabs: Care Plan | SOAP Note | Risk | Transcript. The visit is held for clinician approval before becoming visible to the patient.

### Visit History (`/visits`)

Search bar, tag filter chips, sort controls, paginated grid of visit cards. Role-aware:
- **Clinicians:** see all visits, delete button, "New Recording" button
- **Patients:** see only approved visits, no recording or delete controls; friendly empty state message

### Visit Detail (`/visits/[id]`)

Five tabs:

| Tab | Contents |
|-----|---------|
| **Patient Summary** | Medications table, tests ordered, follow-up checklist, lifestyle recommendations, Q&A accordion, red flags, PDF export |
| **SOAP Note** | Full S/O/A/P with evidence quotes (clinician-only); empty fields shown in red |
| **Risk Assessment** | Score gauge (0–100), risk factors list, red flags panel |
| **Literature & Trials** | Ranked papers with 👍/👎, clinical trial cards with status badges |
| **Transcript** | Raw vs redacted side-by-side |

Clinicians see an approval banner. Patients see a "Summary under review" banner when pending.

### Medications (`/medications`) — Patient Only

Complete medication history aggregated from all approved visits.

- **Status inference** from the duration field: `ongoing/indefinitely` → Active · `discontinued/stopped` → Completed · specific duration (e.g. "7 days") → Completed · ambiguous → Review
- **Filter tabs:** All · Active · Completed · Review (with counts)
- **Search** by drug name, dose, or visit type
- **Medication cards:** name, status dot badge, dose / frequency / duration chips, instructions, visit date, "View visit" link
- **Stats row:** Total · Active · For Review counts

### Analytics (`/analytics`) — Clinician Only

- Summary stat cards: total visits, avg risk score, extraction accuracy %, paper relevance rate %
- Donut: risk level distribution
- Bar: top 10 conditions
- Line: visits over time
- Grouped bar: extraction accuracy by item type (from feedback)
- Keyword boost leaderboard table

### Literature (`/literature/[visit_id]`)

Two-column layout: papers (left, sorted by influential citation count) and clinical trials (right). Each paper has title, authors, year, journal, abstract snippet, relevance explanation, and 👍/👎 feedback buttons. Trials show status badge, conditions, interventions, location, and ClinicalTrials.gov link.

---

## API Reference

All endpoints are served from `http://localhost:8000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/transcribe` | Upload audio file; returns raw + redacted transcript |
| `POST` | `/api/analyze` | Analyze transcript; returns care plan, SOAP, risk, trials, literature |
| `GET` | `/api/visits` | List visits with optional `search`, `tag`, `sort`, `page` params |
| `GET` | `/api/visits/{id}` | Full visit details |
| `DELETE` | `/api/visits/{id}` | Delete a visit |
| `GET` | `/api/export/{id}/pdf` | Download visit summary as PDF |
| `GET` | `/api/literature/{id}` | Retrieve papers for a visit; `?refresh=true` forces re-fetch |
| `GET` | `/api/trials/{id}` | Retrieve clinical trials for a visit |
| `POST` | `/api/feedback` | Submit clinician feedback (item approval / paper rating) |
| `GET` | `/api/feedback/{visit_id}` | Retrieve feedback for a visit |
| `GET` | `/api/analytics` | Aggregated analytics stats |
| `GET` | `/api/feedback/analytics` | Extraction accuracy by item type + top boosted keywords |

---

## Approval Workflow

MedSift AI includes a clinician-gated approval workflow ensuring patients only see reviewed summaries:

```
Clinician processes recording
           │
           ▼
   Visit saved → added to "Pending Approval" queue
           │
           ▼
   Clinician sees amber banner on dashboard
   (visit count badge on notification bell)
           │
           ▼
   Clinician reviews visit — inline on dashboard card
   OR full detail page (/visits/[id])
           │
     ┌─────┴──────┐
     │  Approve   │
     └─────┬──────┘
           │
           ▼
   Visit moved to "Approved"
   → visible in patient portal and medications page
```

Approval state is stored in `localStorage` (`medsift_pending` and `medsift_approvals`) to simulate the workflow without additional backend endpoints. A production implementation would persist this server-side via a `POST /api/visits/{id}/approve` endpoint.

---

## SMS Medication Reminders

Patients can opt in to SMS medication reminders during account creation:

```
Patient sign-up form
           │
           ▼
  Enter phone number
           │
           ▼
  Check "Receive SMS medication reminders"
  (legal copy: Msg & data rates apply · Reply STOP to opt out)
           │
           ▼
  Consent stored: { sms_consent: true, phone: "..." } in localStorage
           │
           ▼
  Dashboard shows green "SMS Reminders Active" status card
  Sidebar shows phone number + opt-out instructions
```

**Current state:** Consent capture and display is fully implemented on the frontend. The actual SMS delivery (via Twilio or similar) is a backend integration stub — see Future Enhancements below.

---

## Future Enhancements

### Short-Term (Next Sprint)

- [ ] **Real authentication** — JWT-based auth with refresh tokens; replace `localStorage` session with secure HTTP-only cookies
- [ ] **Backend approval endpoint** — `POST /api/visits/{id}/approve` persists approval state in SQLite
- [ ] **SMS backend integration** — Wire `sms_consent` + `phone` to Twilio (or AWS SNS) to send actual medication reminders based on extracted frequency/duration
- [ ] **Push notifications** — WebSocket or SSE channel for real-time clinician approval alerts
- [ ] **Patient messaging** — Secure in-app messaging thread between patient and clinician per visit
- [ ] **Multi-language support** — Whisper already supports 100+ languages; expose language selection in the upload UI

### Medium-Term

- [ ] **Speaker diarisation** — Use WhisperX or pyannote.audio to separate doctor vs patient speech
- [ ] **Structured medication database** — Validate extracted drug names against RxNorm; flag interactions via OpenFDA
- [ ] **Reminder scheduling engine** — Parse `frequency` and `duration` from extracted medications to schedule SMS at the right times (e.g. "twice daily for 7 days")
- [ ] **ICD-10 / CPT code suggestion** — Auto-suggest billing codes from the SOAP assessment
- [ ] **Appointment scheduling integration** — Generate calendar invites from follow-up instructions
- [ ] **FHIR export** — Export care plan as HL7 FHIR R4 Bundle for EHR integration
- [ ] **Batch processing** — Queue multiple recordings and process overnight

### Long-Term / Research

- [ ] **Fine-tuned medical LLM** — Fine-tune LLaMA 3 on de-identified clinical notes for higher accuracy
- [ ] **Differential diagnosis suggestions** — Surface alternative diagnoses from assessment data
- [ ] **Population health analytics** — Aggregate anonymised statistics across a clinic
- [ ] **Voice-activated commands** — Hands-free navigation and dictation during live visits
- [ ] **Federated learning** — Improve models across clinics without sharing raw data
- [ ] **EHR deep integration** — Epic / Cerner SMART on FHIR app
- [ ] **Mobile app** — React Native companion for on-the-go clinician review

---

## Disclaimer

MedSift AI is a **hackathon prototype** built for educational and demonstration purposes only.

- It does **not** provide medical diagnoses, treatment recommendations, or clinical advice.
- It is **not** FDA-approved or certified for clinical use.
- It is **not** a substitute for professional medical judgment.
- PHI redaction is best-effort and should not be relied upon for HIPAA compliance in production.
- SMS reminders are a frontend prototype — no actual messages are sent in this demo.

Always consult a qualified healthcare professional for medical decisions.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ at Hacklytics 2026 @ Georgia Tech*
