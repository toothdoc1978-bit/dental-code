# Dental Code — Overview

This document is the handoff brief for the dental charting companion in this
repo. It explains what the app does, how it's structured, and where to look in
the codebase. The shorter, user-facing pitch lives in `README.md`.

- **Live:** https://dental-code.vercel.app
- **Repo:** `toothdoc1978-bit/dental-code`
- **Active branch:** `claude/dental-charting-tool-Z24j3` (PR #5)
- **Stack:** React 18 + Vite + Tailwind on the client; Vercel serverless
  functions on the server; Anthropic Sonnet (`claude-sonnet-4-6`) for note
  generation; `localStorage` for state persistence (no database).

---

## 1. What the app is

A chairside companion for a licensed Louisiana dentist that runs in a browser
tab next to Dentrix G7. The dentist walks a step-by-step wizard, checking
boxes and entering tooth/surface/CDT data, and at the end the app generates a
SOAP-format chart note via Claude that the dentist pastes into Dentrix.

It is **explicitly HIPAA-aligned**: no field anywhere in the app collects or
stores a patient name, DOB, Medicaid ID, address, or phone number. The
generated note uses the literal token `[PATIENT]` as a name placeholder which
the dentist replaces by hand after pasting. The serverless function also
enforces a PHI deny-list at the boundary before any data reaches Claude.

The app is built specifically for the Louisiana / MCNA Medicaid / EPSDT
environment and ports audit-defense logic from a legacy single-file HTML tool
(`clinicalsidecarv7.2.html`).

---

## 2. The wizard

Two flows exist, selected by `visitSetup.visitType` and `patientType`:

**Non-scheduled (comprehensive / recall / emergency / etc.)**
1. **Setup** — patient type, visit type, date, age
2. **Med Hx** — full intake (changes, conditions, allergies, meds, ASA)
3. **CC** — chief complaint
4. **EPSDT** — only when patientType === `'epsdt'`
5. **Soft Tissue** — 10-region exam
6. **Teeth** — SVG tooth chart, per-tooth condition + surfaces
7. **Perio** — periodontium type, BOP, pocket depth, calculus, mobility
8. **Occlusion** — Angle classes, anterior relationships
9. **X-ray** — selection with ALARA rationale + 31-item pediatric pano
   checklist + catch-all dynamic-rephrasing protocol
10. **Tx Done** — CDT codes performed today (with teeth + surfaces)
11. **Dx** — ICD-10 diagnoses (auto-suggested from the CDT crosswalk; quick-
    pick narratives also available)
12. **Tx Plan** — future-recommended treatment (CDT + priority)
13. **Education** — counseling topics
14. **Consents** — derived from procedures + manual checkmarks
15. **Audit** — live completeness checklist + % score
16. **Note** — LLM-generated SOAP note for paste-into-Dentrix

**Scheduled (procedure-only visit)**
1. **Setup**
2. **Med Hx — Interim Review** (compact form: "any changes since last visit?"
   Yes/No, conditional textarea for reported changes)
3. **Procedures** — anesthesia, isolation, prep, etch, bonding, cure,
   restorative material, occlusion check, complications, sutures, post-op
4. **Consents**
5. **Audit**
6. **Note**

The wizard is assembled in `src/App.jsx` via `getSteps(patientType, visitType)`.
The sticky header shows a live audit % chip (red <70, amber <90, emerald 90+)
that recomputes on every state change.

---

## 3. Data model — the chart store

State lives in a single Zustand-style store at
`src/hooks/useChartStore.js`. It auto-persists to `localStorage` and reloads
on app boot. The store exposes `state`, `setField(path, value)` (supports
dot-paths like `'medicalHistory.changesDetail'`), `toggleItem(path, item)`,
and `reset()`.

The shape (truncated to top-level keys):

```js
{
  visitSetup: { patientType, visitType, visitDate, age, provider, … },
  medicalHistory: {
    changesSinceLastVisit: null | false | true,
    changesDetail: '',
    conditions: [], allergies: [], medications: '', asaClass
  },
  chiefComplaint: { type, location, duration, severity, character: [] },
  epsdtScreening: { cariesRisk, … },
  softTissue: { lips, buccalMucosa, tongue, … },          // 10 regions
  toothChart: { [toothNumber]: { conditions: [], surfaces: [] } },
  dentitionType: 'permanent' | 'primary' | 'mixed',
  perio: { periodontiumType, bop, pocketDepthRange, … },
  occlusion: { molarClassR, molarClassL, … },
  radiographs: { none, taken: [{ type, reason, panoIndications, alaraCatchAllReason }] },
  treatmentRendered: [{ cdtCode, description, teeth: [], surfaces: [] }],
  diagnoses: [],                                          // strings, free or "ICD — label"
  treatmentPlan: [{ cdtCode, description, teeth: [], priority }],
  patientEducation: [],
  scheduledTreatment: {
    procedures: [{ id, type, tooth, anestheticDrug, anestheticCarpules,
                   anestheticTechnique, … }]
  },
  signedConsents: [],                                     // consent ids
  currentStep: 0
}
```

The PHI deny-list is enforced in two places:
- `api/generate-note.js` — rejects any request whose `chartData` contains
  `patientName | name | dob | medicaidId | ssn | address | phone`.
- `server/noteGenerator.js` — `ALLOWED_KEYS` allow-list strips anything not
  on the whitelist before the data reaches the prompt.

---

## 4. Note generation — the prompt

The full generator lives in `server/noteGenerator.js`. The flow is:

1. `sanitize(rawData)` keeps only `ALLOWED_KEYS`.
2. Per-section `buildX()` helpers emit text snippets for the prompt
   (`buildVisitNarrative`, `buildMedHx`, `buildCC`, `buildEpsdt`,
   `buildSoftTissue`, `buildToothChart`, `buildPerio`, `buildOcclusion`,
   `buildRadiographs`, `buildTreatment`, `buildPlan`, `buildProcedures`).
3. Conditional blocks: `buildCatchAllBlock`, `buildMedicalNecessityBlock`,
   `buildConsentsBlock`, `buildPostOpBlock`.
4. Sections are joined and sent to Claude with the system prompt below.

### The system prompt — 17 numbered rules

The prompt anchors itself in La. R.S. 37:757 (the dentist's obligation to
keep a written record of every service performed) and the prevailing standard
of care for dental documentation. The rules in summary:

| # | Rule | Why it matters |
|---|------|----------------|
| 1 | Third person, `[PATIENT]` placeholder | HIPAA + paste-into-Dentrix workflow |
| 2 | **DEFAULT FORMAT: SOAP** — labeled S: / O: / A: / P: sections | Prevailing standard of care; readability |
| 3 | Within-section variation (vary prose, fix outer order) | Avoid EHR clone-flagging across visits |
| 4 | Proper dental terminology | Professional output |
| 5 | Be specific; incorporate actual tooth #s, surfaces, CDT codes | Audit defense |
| 6 | Include EVERY documented element across SOAP sections | La. R.S. 37:757 |
| 7 | EPSDT: caries risk + screening + counseling explicit; cite LAC §106 | MCNA Medicaid compliance |
| 8 | Never fabricate findings not in the data | Audit defense |
| 9 | Length budgets (250–500 comprehensive, 120–250 limited, 200–400 scheduled) | Note quality |
| 10 | **EXTENUATING CASES** — collapse to narrative or truncated SOAP when data is sparse (recalls, no-shows, addenda) | Flexibility |
| 12 | Scheduled-tx visits: full operative-sequence verbatim in Plan (anesthesia agent + carpules + technique, isolation, prep, etch, bonding, cure, post-op) | MCNA compliance |
| 13 | Every radiograph requires explicit ALARA rationale in Objective | Payer audit defense |
| 14 | **ALARA catch-all dynamic-rephrasing protocol** — for pediatric pan replacements that fail intraoral capture, the model must compose a freshly-varied sentence containing 4 immutable concepts (BARRIER, ALARA, RISK AVOIDANCE, TECHNOLOGY) without copying the base template; 4 few-shot examples included | Hardest part of the prompt — prevents cloned defense language across visits |
| 15 | **Medical-necessity sentences** — when MEDICAL_NECESSITY block is present, each pre-composed sentence must appear (preserving "necessary due to", "non-restorable", "vitality testing", etc.) in Plan (or Assessment for D4341) | Audit defense for highest-risk codes |
| 16 | **Consent fork** — CONSENTS_SIGNED → exactly one natural consent sentence in Plan; CONSENTS_STATUS: NONE_RECORDED → hard prohibition on any consent language anywhere in the note | Prevent fabricated consent prose |
| 17 | **Post-op confirmation** — when POSTOP_CONFIRMATION_REQUIRED is present (any non-D0 CDT or any scheduledTreatment procedure), Plan must contain exactly one sentence stating post-op instructions were given orally + in writing AND the patient verbalized understanding | Audit defense, doctor request |

(Rule 11 is reserved — its content was merged into rule 2's Plan
description.)

Each conditional block is silent unless its trigger fires. The blocks that
can appear in the user prompt:

- `ALARA_CATCH_ALL` — populated when a radiograph has `alaraCatchAllReason`
- `MEDICAL_NECESSITY` — populated when any rendered CDT has a template in
  `MEDICAL_NECESSITY_TEMPLATES`
- `CONSENTS_SIGNED` or `CONSENTS_STATUS: NONE_RECORDED` — always exactly one
  of these is present
- `POSTOP_CONFIRMATION_REQUIRED` — populated when any operative procedure
  appears in `treatmentRendered` (non-D0xxx) or `scheduledTreatment.procedures`

---

## 5. Coding & audit defense — Path A port

The HTML legacy tool (`clinicalsidecarv7.2.html`) had hand-curated audit
muscle that the React app lacked. Path A ported the highest-leverage pieces:

**`src/data/examDefaults.js` — new constants**

- `CDT_ICD10_CROSSWALK` — 37 procedure-to-diagnosis entries. Each entry:
  `{ code, desc, category, primary: {icd, label}, alts: [{icd, label}],
     docRequirements, auditFlag, consentCategory }`.
- `CONSENTS` — 10 standardized consent forms (general, imaging, cbct,
  local_anesthesia, nitrous, extraction, endo, crown, sdf, sedation). Each
  has a `triggers` array of procedure-category tags.
- `MEDICAL_NECESSITY_TEMPLATES` — 11 hand-written sentence factories for the
  highest-audit-risk codes (D2391/2/3, D2740/50, D3310/20/30, D4341,
  D7140/7210). Each takes `{tooth, surfaces, findings}` and returns the
  required medical-legal sentence.
- Helpers: `lookupCrosswalk(code)`,
  `derivedRequiredConsents(cdtCodes)`,
  `buildMedicalNecessitySentences(treatmentRendered)`.

**`src/components/Diagnoses.jsx`** — auto-suggests ICD-10 codes (primary + alts)
for every CDT code in `treatmentRendered + treatmentPlan`. Each chip is
labeled with its source CDT.

**`src/components/Consents.jsx`** — derives required consents from the active
CDT codes; shows an amber banner if any required consent isn't on
`state.signedConsents`. Lets the user also check optional consents.

**`src/components/Audit.jsx`** — runs ~8–12 checks against the live chart
and renders pass / fail / warn per row. Exports `computeAuditScore(state)`
which the header consumes. The check set adapts to visit type (scheduled
skips CC; EPSDT requires caries risk; etc.). Each check is a pure function
of the current state — no separate audit-state store.

---

## 6. Louisiana Dental Practice Act alignment

The app's documentation behavior was cross-checked against the Louisiana
statutes and Louisiana State Board of Dentistry rules. Key references baked
into the prompt:

- **La. R.S. 37:757** (Patient Records) — dentist must keep a written record
  of every service performed. Cited in rule #6 of the prompt.
- **LAC tit. 46, Pt. XXXIII, §136** — record access, legibility, radiograph
  readability. Out-of-scope items (patient access, retention) handled by the
  office, not the app.
- **LAC §106** (Parental Consent) — required for any restoration on a patient
  under 18. Cited in rule #7 of the prompt. Surfaced via the Consents step.
- **LAC §203.A.5** (Teledentistry) — same documentation standard as in-person.

LA does not mandate SOAP format by statute or rule — it mandates a written
record of every service performed at "the prevailing standard of care." SOAP
is the prevailing standard, recommended by the ADA Council on Dental
Practice. The default SOAP output satisfies both with margin.

Out-of-app: signature, record retention (6 years per R.S. 40:1165.1), and
patient-access workflow live in the dental office's Dentrix system.

---

## 7. Repo layout — files of interest

```
api/
  generate-note.js              # Vercel serverless POST endpoint;
                                #   enforces PHI deny-list; calls noteGenerator

server/
  index.js                      # Local Express dev server (alternative to Vercel dev)
  noteGenerator.js              # All prompt assembly + Anthropic call.
                                #   Most prompt-engineering effort is here.

src/
  App.jsx                       # Step ordering, header audit badge, wizard shell
  hooks/useChartStore.js        # State, localStorage, reset
  data/
    examDefaults.js             # Option arrays, CDT_ICD10_CROSSWALK, CONSENTS,
                                #   MEDICAL_NECESSITY_TEMPLATES, helpers
    cdtCodes.js                 # CDT_BY_CATEGORY, CDT_CATEGORIES,
                                #   EPSDT_FAVORITES, lookupCdt
  components/
    shared.jsx                  # CheckChip, Section, YesNo, Tile, PageTitle
    VisitSetup.jsx
    MedicalHistory.jsx          # branches on visitType === 'scheduled'
    ChiefComplaint.jsx
    EpsdtScreening.jsx
    SoftTissueExam.jsx
    ToothChart.jsx              # SVG tooth chart, per-tooth state
    PerioAssessment.jsx
    OcclusionExam.jsx
    Radiographs.jsx             # ALARA + pediatric pano checklist + catch-all
    TreatmentRendered.jsx
    Diagnoses.jsx               # auto-suggests from CDT crosswalk
    TreatmentPlan.jsx
    PatientEducation.jsx
    Consents.jsx                # derives required from procedures
    Audit.jsx                   # live checklist; exports computeAuditScore
    CdtPicker.jsx               # search + categorized list of CDT codes
    ScheduledTreatment.jsx      # procedure-specific operative forms
    NoteOutput.jsx              # POST to /api/generate-note + copy button

deploy.mjs                      # Vercel CLI-less deploy (used during this work)
README.md                       # Short user-facing pitch (not for handoff)
OVERVIEW.md                     # This file
```

---

## 8. Local dev + deploy

**Local development:**

```bash
npm install
cp .env.example .env             # add ANTHROPIC_API_KEY
npm run dev                      # Vite at http://localhost:5173
```

The serverless function at `api/generate-note.js` is invoked by Vercel's dev
proxy. If running without `vercel dev`, the Express fallback in
`server/index.js` exposes the same route at the same path.

**Production deploy:** the active branch builds and deploys via `deploy.mjs`,
which uses the Vercel API directly with a project-scoped token. The build
output goes to `dist/`. The production URL is
`https://dental-code.vercel.app`.

`npm run build` runs Vite production build and was used to verify every
change in this session.

---

## 9. What's been built in this session (chronological)

The session added Path A (CDT-ICD10 crosswalk, medical-necessity, audit,
consents), then converted note output to SOAP format, then added the
scheduled-visit interim med-hx and universal post-op confirmation.

| Commit | Summary |
|--------|---------|
| `1865a92` | Path A — CDT-ICD10 crosswalk, medical necessity, audit, consents |
| `306d0ae` | Tighten consent prompt rule — explicit NONE_RECORDED prohibition |
| `11c4505` | SOAP-format default for chart notes (+ LA Practice Act alignment) |
| `6baccc2` | Scheduled-visit interim med-hx + universal post-op confirmation |

All four commits are on `claude/dental-charting-tool-Z24j3`, surfaced via
PR #5.

---

## 10. What is intentionally NOT built (yet)

These items were considered and deferred during the Path A scoping. The
legacy HTML (`clinicalsidecarv7.2.html`) had hand-curated lists for each;
the React app does not yet:

- **COMBOS** — pre-baked quick-add bundles on TreatmentRendered (e.g., one
  click adds D0150 + D0210 + D0274 + D1110).
- **POSTOP enum chips** on the Extraction form (vs. the current free-text
  postOpInstructions field).
- **RECALL_OPTS** picker on TreatmentPlan / PatientEducation.
- **Payer selector** (MCNA / OON Commercial / Self-Pay) with payer-aware
  audit rules and prompt tweaks.
- **CYA contextual flags** — auto-appending Z91.843 when caries risk = High,
  etc.
- **Named §106 audit check** for "patient under 18 + restorative procedure
  + no parental consent" — currently caught transitively by the
  "All required consents signed" check.

Plus structural items deliberately out of scope:

- Record retention (handled by Dentrix).
- Signature blocks (handled by Dentrix).
- Multi-user / multi-clinic (single-doctor PWA design).
- Backend persistence (state is in `localStorage` only).

---

## 11. Pointers for an incoming agent

If you're picking this up to extend or modify:

1. **Read `server/noteGenerator.js` end-to-end first.** The system prompt
   carries ~80% of the app's clinical intelligence; every UI step exists
   to populate inputs to that prompt.
2. **Check `examDefaults.js` for the constants you need before grepping
   blindly** — the crosswalk, consents, and medical-necessity templates
   are all there with helpers.
3. **The audit logic in `Audit.jsx`'s `runChecks(state)` is the single
   source of truth for "is this note complete?"** Add a new check by
   appending to that array — the score badge updates automatically.
4. **Prompt changes are the most fragile.** Every rule has a reason
   (mostly audit defense or HIPAA). Before reordering or relaxing a rule,
   re-run the smoke tests under `/tmp/smoketest-*.mjs` (kept in `/tmp`
   during the session; recreate from this doc if needed) against the live
   API and confirm the must/mustNot assertions still pass.
5. **HIPAA boundary is real.** Never broaden `ALLOWED_KEYS` in
   `noteGenerator.js` without thinking through the PHI implications, and
   never relax the deny-list in `api/generate-note.js`.
