# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## ⚠️ This repo contains THREE separate projects

Despite the single `dental-code` repo name, there are three independent
applications here that do **not** share a build system, dependency tree, or
runtime. Identify which one a task touches before making changes.

| Project | Location | Stack | What it is |
|---|---|---|---|
| **Marketing site** | repo root: `app/`, `components/`, `lib/`, `public/` | Next.js 14 (App Router), TS, Tailwind | Public website for **Chad Gardner, DDS** dental practice in Bastrop, LA |
| **Clinical Sidecar — backend** | `backend/` | Python / Flask + SQLAlchemy (SQLite) | REST API for dental claim coding, denial-rate "learning" insights, CDT/ICD-10 reference lookup |
| **Clinical Sidecar — frontend** | `frontend/` | Create React App, React 19, TS, react-router | Single-page "visit workspace" for coding a dental visit, generating SOAP notes, and scoring claim/audit readiness |
| _(build artifact)_ | `docs/` | — | **Generated** static build of the `frontend/` app (GitHub Pages output). Do **not** hand-edit; rebuild from `frontend/` instead. |

The root `tsconfig.json` deliberately **excludes** `frontend`, `backend`, and
`docs` — the marketing site's TypeScript project is isolated from the others.

---

## Project 1 — Marketing site (repo root)

Next.js 14 App Router marketing/brochure site. No database; all content is
hard-coded in TypeScript modules under `lib/`.

### Commands (run from repo root)
```bash
npm install
cp .env.example .env.local   # fill in Resend keys when ready
npm run dev                  # dev server → http://localhost:3000
npm run build                # production build
npm run start                # serve the production build
npm run lint                 # ESLint (next/core-web-vitals)
npm run typecheck            # tsc --noEmit
```
Run `npm run lint` and `npm run typecheck` before considering a change done.

### Layout
```
app/                 App Router routes + server actions
  layout.tsx         Root layout: Header/Footer/fonts/SEO metadata/JSON-LD
  page.tsx           Home
  about/  services/  smile-gallery/  reviews/  contact/  pricing/
  blog/  patient-forms/  post-op-instructions/  privacy-policy/  accessibility/
  services/[slug]/   Dynamic per-service detail pages
  post-op-instructions/[slug]/   Dynamic per-procedure aftercare pages
  contact/actions.ts Server action (Resend email) — "use server"
  sitemap.ts  robots.ts        SEO
  globals.css        Tailwind entry
components/          Shared UI (Header, Footer, ContactForm, ServiceCard, …)
lib/                 ★ Single source of truth for ALL content
  site.ts            Practice NAP (name/address/phone), hours, tech, highlights
  services.ts        Service slugs + copy + FAQs (drives services/[slug])
  gallery.ts         Smile-gallery before/after cases + filters
  testimonials.ts    Patient quotes
  pricing.ts         Pricing rows
  post-op.ts         Post-op instruction content (drives post-op/[slug])
public/              Static assets; see public/IMAGES.md for expected filenames
  gallery/ team/ office/ og/    (currently .gitkeep placeholders — real photos TODO)
```

### Conventions
- **Content lives in `lib/`, never in JSX.** To change a service, price, hour,
  testimonial, or aftercare text, edit the relevant `lib/*.ts` module — pages
  render from these typed arrays. Dynamic routes derive their static params from
  these slugs.
- Import via the `@/*` path alias (e.g. `import { site } from "@/lib/site"`),
  mapped to the repo root in `tsconfig.json`.
- Components are mostly server components; add `"use client"` only when needed
  (e.g. `ContactForm`). Server-only logic uses `"use server"` (see
  `app/contact/actions.ts`).
- Tailwind with a custom theme in `tailwind.config.ts`: brand palette
  (`brand.*`, `surface.*`, `ink.*`), `font-sans`/`font-display` (Inter + Plus
  Jakarta via `next/font`), `shadow-soft`, `rounded-2xl`. Prefer these tokens
  over ad-hoc hex values.
- Keep accessibility intact (skip-link in `layout.tsx`, semantic landmarks).

### Contact form / email
`app/contact/actions.ts` validates with `zod` and sends via **Resend**. It
fails gracefully: with no `RESEND_API_KEY` it still returns cleanly and tells
the patient to call. Includes a honeypot (`website`) field. Env vars
(`.env.example`): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.

---

## Project 2 — Clinical Sidecar backend (`backend/`)

Flask app factory (`backend/app.py → create_app()`) with SQLAlchemy over a
local SQLite file (`clinical_sidecar.db`). On startup it `db.create_all()` and
seeds `LearningInsight` rows (real MCNA/commercial denial-rate examples).

### Commands (run from `backend/`)
```bash
pip install -r requirements.txt
python app.py                     # dev server → http://localhost:5000 (debug)
# production:
gunicorn "app:create_app()"
```
There is no test suite or linter configured for the backend yet.

### Layout
```
backend/
  app.py              create_app() factory + LearningInsight seed data
  models/database.py  SQLAlchemy models: ClaimRecord, ProcedureRecord,
                      AttachmentRecord, FrequencyRecord, LearningInsight
  routes/
    references.py     CDT / ICD-10 reference lookup + search
    learning.py       Denial-rate insights, claim ingestion, frequency checks
  data/
    cdt_codes.py      CDT_CODES dict (procedure codes)
    icd10_codes.py    ICD10_CODES dict (diagnosis codes)
    payer_rules.py    Payer-specific documentation rules
```

### API (all JSON, prefixed `/api`)
- `GET  /api/cdt/search?q=&limit=` — search CDT by code/description
- `GET  /api/cdt/<code>`           — single CDT code detail
- `GET  /api/icd10/search?q=&limit=` — search ICD-10 by code/description
- `GET  /api/icd10/<code>`         — single ICD-10 code detail
- `GET  /api/learning/<payer>/<cdt_code>` — sample-size-weighted denial rate + recommendations
- `POST /api/claims`               — ingest a claim outcome record
- `GET  /api/frequency/<patient_id>/<cdt_code>` — frequency-limit check

### Conventions
- Models expose a `to_dict()` for serialization; routes return `jsonify(...)`
  with explicit status codes. `JSON_SORT_KEYS` is off (preserve key order).
- CORS is open (`origins: "*"`) for `/api/*` to let the React frontend call it.
- Reference data is **code-as-data** Python dicts under `data/` — extend those
  dicts to add codes; don't introduce a DB table for static reference data.

---

## Project 3 — Clinical Sidecar frontend (`frontend/`)

Create React App (react-scripts 5) SPA, React 19 + react-router-dom 7,
Tailwind v4, `lucide-react` icons. Client-side only; all clinical logic runs in
the browser. Renders a single route (`VisitWorkspace`).

### Commands (run from `frontend/`)
```bash
npm install
npm start     # dev → http://localhost:3000  (conflicts with marketing site port!)
npm run build # production build → frontend/build
npm test      # react-scripts test (jest + Testing Library)
```
> ⚠️ Both this app and the marketing site default to port **3000** — run only
> one at a time, or set `PORT`.

### Layout
```
frontend/src/
  App.tsx                 Router shell + "Clinical Sidecar" header
  pages/VisitWorkspace.tsx Main screen wiring all panels together
  hooks/useVisit.ts       Central visit state + typed updater callbacks
  types/visit.ts          ★ Visit data model (Patient, Procedure, Diagnosis, …)
  services/
    soapGenerator.ts      Derives a SOAP note from the Visit
    auditEngine.ts        Claim-readiness score + audit-risk detection
  data/
    cdtCodes.ts  icd10Codes.ts  payerRules.ts   (frontend copies of reference data)
  components/
    patient/visit/ clinical → visit/   (PatientPanel, VisitInfoPanel, …)
    coding/   (ProcedureEntryPanel, DiagnosisPanel, CodingSuggestionPanel)
    soap/     (SOAPNotePanel)
    audit/    (ClaimReadinessPanel, AuditRiskPanel, AttachmentPanel)
    attestation/ (AttestationPanel)
  utils/visitDefaults.ts  createDefaultVisit()
```

### Conventions
- **`types/visit.ts` is the contract.** The `Visit` interface drives every
  panel, the SOAP generator, and the audit engine. Change types here first,
  then update `useVisit`, `visitDefaults`, and dependent panels/services.
- Visit state is owned by `useVisit()` and threaded down as props with
  `Partial<...>` updater callbacks — there is no global store/Context.
- `services/auditEngine.ts` and `services/soapGenerator.ts` are pure functions
  over a `Visit`. Clinical scoring rules ("Per Spec Sections 8 & 9") live here —
  prefer adding rules in these services over scattering logic in components.
- `frontend/src/data/*.ts` mirror the backend's `backend/data/*.py` reference
  tables. If you change codes/rules in one, consider whether the other needs the
  same update — they are maintained in parallel, not shared.

### `docs/` is generated
`docs/` is a committed production build of this frontend (served via GitHub
Pages). Never edit files in `docs/` by hand; regenerate with
`npm run build` in `frontend/` and copy the output.

---

## Working across projects — checklist
- **Know your project.** Marketing-site work is at the repo root; Clinical
  Sidecar work is in `backend/` or `frontend/`. They have separate
  `package.json`/`requirements.txt`, ports, and tooling.
- Run each project's own checks (`lint`/`typecheck`/`test`) from that project's
  directory before declaring a task done.
- Don't import across project boundaries (the marketing site's `@/*` alias only
  resolves within the root project).
- Edit reference/content data in its source module, not in generated output
  (`docs/`) or in rendered JSX.

## Git / workflow
- Default branch: `main`. Active feature branch for this work:
  `claude/claude-md-docs-le8lr1`. Develop, commit, and push there; open a PR.
- Secrets: `.env*` is gitignored. Never commit Resend keys or other secrets.
- Outstanding launch TODOs for the marketing site are tracked at the bottom of
  `README.md` (real photos, confirm hours, social URLs, verify Resend domain,
  connect domain/deploy).
