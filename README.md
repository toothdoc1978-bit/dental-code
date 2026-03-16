# Clinical Sidecar

**Bastrop Dental Care — Clinical Documentation & Coding Copilot**

A clinical documentation intelligence layer that sits alongside Dentrix Enterprise, providing structured data capture, SOAP note generation, CDT/ICD-10/CPT coding suggestions, audit risk detection, and claim readiness scoring.

## Architecture

```
┌─────────────────────────────────────────────┐
│              React UI (Frontend)             │
│  Structured data capture, SOAP rendering,   │
│  deterministic audit checks, attestation    │
├─────────────────────────────────────────────┤
│            AI Copilot Layer                  │
│  Coding suggestions, medical necessity      │
│  narratives, payer-sensitive flagging        │
├─────────────────────────────────────────────┤
│           Flask Backend (API)               │
│  Learning engine, payer response tracking,  │
│  frequency limitations, reference data      │
├─────────────────────────────────────────────┤
│         Dentrix Enterprise (Read-Only)      │
│  Source of truth via ODBC shadow DB         │
└─────────────────────────────────────────────┘
```

## Quick Start

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm start
```

Runs on http://localhost:3000

### Backend (Flask + SQLite)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5000

## Features

### Phase 1 (Current) — Clinical Documentation + Coding Copilot

- **Structured Visit Data Capture** — Patient demographics, clinical findings, radiographs, anesthesia, outcomes
- **Procedure Entry with CDT Search** — 80+ CDT codes across 10 priority categories
- **ICD-10 Diagnosis Management** — 50+ dental diagnosis codes with procedure mapping
- **SOAP Note Generation** — Auto-generated from structured data, editable, copy-to-clipboard
- **Coding Suggestions** — Ranked CDT, ICD-10, and CPT codes with clinical reasoning
- **Audit Risk Detection** — Encounter-level and longitudinal pattern detection
- **Claim Readiness Scoring** — 0-100% score with critical/advisory checklists
- **Attachment Manifest** — Procedure-specific evidence requirements
- **MCNA Medicaid Rules Engine** — Frequency limits, EPSDT requirements, mutually exclusive codes
- **Provider Attestation** — Digital signature workflow with edit tracking and note locking
- **CPT Cross-Billing** — Identifies medical insurance cross-coding opportunities

### Phase 2 (Planned) — Denial Defense Engine
### Phase 3 (Planned) — Clinical Intelligence Engine

## Workflow

1. Enter patient demographics and visit info
2. Document clinical findings, radiographs, and anesthesia
3. Add procedures with CDT codes, surfaces, and teeth
4. Map ICD-10 diagnoses to procedures
5. Review AI coding suggestions and audit risk flags
6. Review SOAP note, attachments, and claim readiness
7. Provider attests and locks the note
8. Copy to Dentrix clipboard for charting

## Payer Support

- **MCNA Medicaid** (Primary) — Full EPSDT compliance, frequency checks, auto-deny detection
- **Delta Dental, Cigna, Aetna, MetLife** — Standard ADA documentation, learning-based rules
- **Self-Pay** — Minimal compliance requirements

## Compliance

- MCNA/EPSDT Louisiana Medicaid
- Louisiana State Board of Dentistry (LSBD)
- CDT-2026, ICD-10-CM, CPT
- ADA/FDA Radiograph Guidelines
- HIPAA (no PHI in AI prompts)
