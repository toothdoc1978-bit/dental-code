# Clinical Safety Evals — the learning loop

A small, data-driven loop for teaching the app to catch medical-safety
contraindications (the kind that don't show up in billing/claim checks).

## The loop

1. **Look at the data.** Encode a real(istic) case as a structured visit in
   [`../src/services/__fixtures__/clinicalSafetyCases.ts`](../src/services/__fixtures__/clinicalSafetyCases.ts),
   together with the contraindication the app *must* surface (`expect`).
2. **Run the scoreboard.**
   ```bash
   npm run eval:safety        # Node 22+, no install needed
   ```
   It runs every case through
   [`../src/services/contraindicationEngine.ts`](../src/services/contraindicationEngine.ts)
   and prints PASS/FAIL per case, exiting non-zero if any are missed.
3. **Close the gap.** When a case fails, add or refine a rule in
   `contraindicationEngine.ts`, then re-run until the scoreboard is green.
4. **Lock it in.** The same cases run under Jest (`npm test`,
   `contraindicationEngine.test.ts`) so regressions are caught in CI.

## Current cases

The five source "trap" cases plus 12 held-out / negative-control probes
(17 total). Source cases (`SYN-*`):

| Case | Trap | Rule fired |
|------|------|------------|
| SYN-001 | Bisphosphonate (Fosamax) → MRONJ | `mronj-antiresorptive` (critical) |
| SYN-002 | Warfarin + INR 3.8 → bleeding | `bleeding-anticoagulant` (critical) |
| SYN-003 | Penicillin anaphylaxis → antibiotic choice | `allergy-penicillin` (critical) |
| SYN-004 | Type 2 diabetes, HbA1c 9.8% → healing | `diabetes-glycemic` (critical) |
| SYN-005 | Pregnancy, 3rd trimester → NSAID | `pregnancy-nsaid` (critical) |

The `EDGE-*` / `NEG-*` cases probe beyond the tuned set: alternative drugs
(denosumab, DOACs), boundaries (INR 3.2, HbA1c 8.2, 2nd-trimester), and
false-positive guards (statin-only, latex/sulfa allergy, controlled diabetes,
a penicillin on the med list without an allergy).

The engine is intentionally severity-graded, and those boundaries are pinned
by the cases so future rule edits don't silently over- or under-fire. Probing
beyond the source cases is what caught two real defects, now fixed:

- DOAC/heparin patients were being told to "obtain an INR" — but DOACs are not
  INR-monitored. INR now only drives *warfarin* severity.
- A warfarin INR of 3.0–3.5 with planned surgery was flagged *critical*; simple
  extractions are generally safe below ~3.5 with local hemostasis, so critical
  is reserved for supratherapeutic INR (≥3.5).

## At the point of sign-off

Critical alerts aren't just advisory: `AttestationPanel` lists any unresolved
critical contraindications and requires an explicit acknowledgment before a
note can be attested and locked.

## How alerts reach the clinician

`detectContraindications(visit)` is consumed by `VisitWorkspace`, which renders
`ContraindicationPanel` at the top of the intelligence column. Critical alerts
outline the panel in red. The inputs these rules read (medications, allergies,
INR/HbA1c, pregnancy trimester) are entered in the Health History panel.
