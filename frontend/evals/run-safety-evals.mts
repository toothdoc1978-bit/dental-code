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
import { ALL_CASES, type SafetyEvalCase } from '../src/services/__fixtures__/clinicalSafetyCases.ts';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function check(c: SafetyEvalCase): string[] {
  const alerts = detectContraindications(c.visit);
  const byId = new Map(alerts.map(a => [a.id, a]));
  const problems: string[] = [];

  for (const e of c.expect ?? []) {
    const got = byId.get(e.id);
    if (!got) problems.push(`expected '${e.id}' (${e.severity}) — not produced`);
    else if (got.severity !== e.severity) problems.push(`'${e.id}' was ${got.severity}, expected ${e.severity}`);
  }
  for (const id of c.expectAbsent ?? []) {
    if (byId.has(id)) problems.push(`'${id}' fired but should be absent`);
  }
  if (c.expectNoCritical) {
    const crit = alerts.filter(a => a.severity === 'critical').map(a => a.id);
    if (crit.length) problems.push(`unexpected critical: ${crit.join(', ')}`);
  }
  return problems;
}

console.log(`\n${BOLD}Clinical Safety Eval — contraindication engine${RESET}\n`);

let passed = 0;
const failures: string[] = [];

for (const c of ALL_CASES) {
  const problems = check(c);
  const ok = problems.length === 0;
  if (ok) passed++;

  const mark = ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
  console.log(`${mark}  ${c.caseId.padEnd(8)} ${DIM}${c.category}${RESET}`);
  if (!ok) {
    for (const p of problems) {
      console.log(`        ${RED}✗ ${p}${RESET}`);
      failures.push(`${c.caseId}: ${p}`);
    }
    const produced = detectContraindications(c.visit).map(a => `${a.id}(${a.severity})`);
    console.log(`        ${DIM}produced: ${produced.join(', ') || 'none'}${RESET}`);
  }
}

const total = ALL_CASES.length;
const color = passed === total ? GREEN : RED;
console.log(`\n${color}${BOLD}${passed}/${total} cases passed${RESET}\n`);

if (passed !== total) {
  console.error(`Missed:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
