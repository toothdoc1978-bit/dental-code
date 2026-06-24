# Dental Charting Companion

A fast, checkbox-driven dental charting companion that runs in a browser tab alongside Dentrix G7. Captures all documentation required by the Louisiana Dental Practice Act and the MCNA Louisiana EPSDT Medicaid program, then uses Claude to generate a natural, unique narrative chart note for copy-paste into Dentrix.

## Why

- **Fast chairside workflow** — maximum checkboxes, minimal typing
- **MCNA / EPSDT compliant** — caries risk, prevention counseling, screening elements all captured
- **Unique notes per visit** — AI rewrites each note with varied sentence structure to avoid template-audit flags
- **HIPAA-friendly** — no patient names, DOB, or Medicaid IDs are ever stored or sent to AI

## Local Setup

Run the app on your own machine for development or offline use.

**Prerequisites:** Node.js 18+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
# 1. Clone and install
git clone <your-repo-url> dental-code
cd dental-code
npm install

# 2. Create your local env file from the template
cp .env.example .env
```

Then open `.env` (it lives in the repo root, next to `package.json`) and paste your key:

```
ANTHROPIC_API_KEY=sk-ant-...your-real-key...
PORT=3001
```

`.env` is gitignored, so your key is never committed. Start the dev servers:

```bash
npm run dev          # Vite client + Express API together
```

Open http://localhost:5173 in a browser tab next to Dentrix.

> **Note on the deployed app:** the live Vercel deployment does **not** use this
> `.env`. Its key is stored as the `ANTHROPIC_API_KEY` environment variable in the
> Vercel project (Settings → Environment Variables), so the hosted site already
> works without any local setup. You only need a local `.env` to run the app or
> the eval harness on your own machine.

## Eval Harness

A scored, regression-safe loop for improving note quality (details in
[`evals/README.md`](evals/README.md)). Uses the same local `.env` for the key.

```bash
npm run eval:seed       # run the hand-written regression core
npm run eval:generate   # generate diverse synthetic (PHI-free) encounters
npm run eval            # score everything; writes evals/report.md

# Or score the deployed API instead of local code (no key needed locally):
EVAL_URL=https://dental-code.vercel.app/api/generate-note npm run eval:seed
```

## How It Works

1. Walk through the wizard step-by-step (Setup → Med Hx → CC → EPSDT → Soft Tissue → Teeth → Perio → Occlusion → X-ray → Tx → Dx → Plan → Education → Note)
2. On the final step, click **Generate Chart Note**
3. AI produces a unique narrative using `[PATIENT]` as the name placeholder
4. Click **Copy** and paste into Dentrix; replace `[PATIENT]` with the patient's name
5. Click **Regenerate** for a different sentence structure if needed

## HIPAA Design

The app has **no fields for patient name, DOB, Medicaid ID, address, or phone**. The Express backend rejects any request containing PHI keys before forwarding to Claude. The generated note uses `[PATIENT]` placeholder — provider replaces it manually in Dentrix.

## Intake Import

The Visit Setup page has an **Import from intake form** button that pulls patient-supplied answers (medical history, chief complaint, consents) from the companion repo [`toothdoc1978-bit/dental-intake-forms`](https://github.com/toothdoc1978-bit/dental-intake-forms). Forms are completed at home on a HIPAA-tier Jotform; only de-identified clinical fields cross the boundary into dental-code. PHI (name, DOB, address, phone, insurance ID) stays in the Jotform vault under BAA and never touches Vercel.

Clinician workflow: receive a visit code in the form `ABCD-1234` on the appointment card, open dental-code, click **Import from intake form**, enter the code. Empty chart fields fill in; clinician keystrokes are never overwritten. Two server-side env vars (set in Vercel Project Settings → Environment Variables, no `VITE_` prefix):

```
INTAKE_MIDDLEWARE_URL=https://intake-middleware.vercel.app
INTAKE_SHARED_SECRET=<HMAC secret shared with dental-intake-forms>
```

The dental-code proxy at `/api/intake-fetch` signs every upstream call with `x-intake-signature: hex(HMAC_SHA256("/api/intake-fetch?code=ABCD-1234", INTAKE_SHARED_SECRET))` and recursively rejects any PHI key in the response. The store-side `applyFragment` reducer enforces the same PHI list, defense-in-depth.

### Local preview with mock middleware

To click through the full intake flow without standing up the producer repo:

```bash
npm run dev:intake
```

This boots Vite (5173) + Express (3001) + a dev-only mock producer on `:4000` (`scripts/dev-mock-intake.mjs`). The mock verifies the HMAC and serves three fixture codes:

- `ABCD-1234` — adult with asthma + ADHD + penicillin allergy + amoxicillin med (trips the existing drug-allergy safety detector on note generation)
- `PEDS-2025` — pediatric EPSDT with caries-risk pre-filled
- `PHI0-LEAK` — fragment carrying a PHI key (verifies the 502 PHI-guard path)

Any other code matching `ABCD-1234` regex returns 404 visit-not-found.

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
