# Dental Charting Companion

A fast, checkbox-driven dental charting companion that runs in a browser tab alongside Dentrix G7. Captures all documentation required by the Louisiana Dental Practice Act and the MCNA Louisiana EPSDT Medicaid program, then uses Claude to generate a natural, unique narrative chart note for copy-paste into Dentrix.

## Why

- **Fast chairside workflow** — maximum checkboxes, minimal typing
- **MCNA / EPSDT compliant** — caries risk, prevention counseling, screening elements all captured
- **Unique notes per visit** — AI rewrites each note with varied sentence structure to avoid template-audit flags
- **HIPAA-friendly** — no patient names, DOB, or Medicaid IDs are ever stored or sent to AI

## Quick Start

```bash
npm install
cp .env.example .env
# add your ANTHROPIC_API_KEY to .env
npm run dev
```

Then open http://localhost:5173 in a browser tab next to Dentrix.

## How It Works

1. Walk through the wizard step-by-step (Setup → Med Hx → CC → EPSDT → Soft Tissue → Teeth → Perio → Occlusion → X-ray → Tx → Dx → Plan → Education → Note)
2. On the final step, click **Generate Chart Note**
3. AI produces a unique narrative using `[PATIENT]` as the name placeholder
4. Click **Copy** and paste into Dentrix; replace `[PATIENT]` with the patient's name
5. Click **Regenerate** for a different sentence structure if needed

## HIPAA Design

The app has **no fields for patient name, DOB, Medicaid ID, address, or phone**. The Express backend rejects any request containing PHI keys before forwarding to Claude. The generated note uses `[PATIENT]` placeholder — provider replaces it manually in Dentrix.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Express (proxies Claude API, keeps API key server-side)
- `@anthropic-ai/sdk` (claude-sonnet-4-6)

## Repo Structure

```
src/
  App.jsx                   # wizard stepper
  hooks/useChartStore.js    # reducer + localStorage
  data/cdtCodes.js          # CDT codes + EPSDT favorites
  data/examDefaults.js      # static option arrays
  components/               # one per wizard step + CdtPicker
server/
  index.js                  # Express + /api/generate-note
  noteGenerator.js          # PHI sanitizer + Claude API call
```

## Disclaimer

This is a documentation aid — not a replacement for clinical judgement. Always review every generated note for accuracy before saving.
