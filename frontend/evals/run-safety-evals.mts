// =============================================================================
// Clinical Safety Eval Runner — the learning loop's scoreboard
// -----------------------------------------------------------------------------
// Runs every case in src/services/__fixtures__/clinicalSafetyCases.ts through
// the contraindication engine and prints a pass/fail scorecard. Exits non-zero
// if any case is missed, so it can gate CI.
//
//   Run with:  node evals/run-safety-evals.mts      (Node >= 22.6, native TS)
//   or:        npm run eval:safety
//
// This lives outside src/ so it is not part of the app bundle/type-check; it
// imports the app's engine and fixtures directly via their .ts paths.
// =============================================================================

import { detectContraindications } from '../src/services/contraindicationEngine.ts';
import { SAFETY_CASES } from '../src/services/__fixtures__/clinicalSafetyCases.ts';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passed = 0;
const failures: string[] = [];

console.log(`\n${BOLD}Clinical Safety Eval — contraindication engine${RESET}\n`);

for (const c of SAFETY_CASES) {
  const alerts = detectContraindications(c.visit);
  const byId = new Map(alerts.map(a => [a.id, a]));

  const missing = c.expect.filter(e => {
    const got = byId.get(e.id);
    return !got || got.severity !== e.severity;
  });

  const ok = missing.length === 0;
  if (ok) passed++;

  const mark = ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
  console.log(`${mark}  ${c.caseId}  ${DIM}${c.category}${RESET}`);

  if (ok) {
    for (const e of c.expect) {
      const got = byId.get(e.id)!;
      console.log(`        → [${got.severity.toUpperCase()}] ${got.category}: ${got.title}`);
    }
  } else {
    for (const m of missing) {
      const got = byId.get(m.id);
      const reason = got
        ? `severity ${got.severity} (expected ${m.severity})`
        : 'not produced';
      console.log(`        ${RED}✗ expected '${m.id}' (${m.severity}) — ${reason}${RESET}`);
      failures.push(`${c.caseId}: ${m.id}`);
    }
    console.log(`        ${DIM}engine produced: ${alerts.map(a => `${a.id}(${a.severity})`).join(', ') || 'none'}${RESET}`);
  }
}

const total = SAFETY_CASES.length;
const color = passed === total ? GREEN : RED;
console.log(`\n${color}${BOLD}${passed}/${total} cases passed${RESET}\n`);

if (passed !== total) {
  console.error(`Missed: ${failures.join(', ')}`);
  process.exit(1);
}
