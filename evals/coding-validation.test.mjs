// Deterministic unit tests for the coding-correctness validators in
// src/data/examDefaults.js. Plain Node assert — no framework.
// Run: node evals/coding-validation.test.mjs   (or: npm run eval:coding)

import assert from 'node:assert/strict'
import { validateTreatmentCoding, diagnosisIcdMismatch, toothArch } from '../src/data/examDefaults.js'

let passed = 0
function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`PASS ${name}`)
  } catch (e) {
    console.error(`FAIL ${name}\n     ${e.message}`)
    process.exitCode = 1
  }
}

const errs = (rendered) => validateTreatmentCoding(rendered).filter((i) => i.severity === 'error')

// §8.1 — valid D2391 #30 (O)
test('valid D2391 #30 (O) → no errors', () => {
  assert.equal(errs([{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O'] }]).length, 0)
})

// §8.3 — D2391 with two surfaces → surface-count error
test('D2391 with [O,B] → surface-count error', () => {
  const e = errs([{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O', 'B'] }])
  assert.equal(e.length, 1)
  assert.match(e[0].message, /exactly one surface/i)
})

// arch — D2391 (posterior code) on anterior tooth #8
test('D2391 on tooth #8 → arch error', () => {
  const e = errs([{ cdtCode: 'D2391', teeth: ['8'], surfaces: ['O'] }])
  assert.ok(e.some((i) => /posterior code but tooth #8 is anterior/i.test(i.message)))
})

// D2392 requires exactly two surfaces
test('D2392 with one surface → surface-count error', () => {
  const e = errs([{ cdtCode: 'D2392', teeth: ['19'], surfaces: ['O'] }])
  assert.ok(e.some((i) => /exactly 2 surfaces/i.test(i.message)))
})

// missing surfaces and tooth
test('D2391 with no surfaces/tooth → errors for both', () => {
  const e = errs([{ cdtCode: 'D2391', teeth: [], surfaces: [] }])
  assert.ok(e.some((i) => /tooth number/i.test(i.message)))
  assert.ok(e.some((i) => /exactly one surface/i.test(i.message)))
})

// D2394 is 4+ surfaces
test('D2394 with 4 surfaces → no surface error; with 3 → error', () => {
  assert.equal(errs([{ cdtCode: 'D2394', teeth: ['30'], surfaces: ['M', 'O', 'D', 'B'] }]).length, 0)
  assert.ok(errs([{ cdtCode: 'D2394', teeth: ['30'], surfaces: ['M', 'O', 'D'] }]).some((i) => /at least 4/i.test(i.message)))
})

// anterior code on posterior tooth
test('D2330 (anterior) on tooth #30 → arch error', () => {
  assert.ok(errs([{ cdtCode: 'D2330', teeth: ['30'], surfaces: ['M'] }]).some((i) => /anterior code but tooth #30 is posterior/i.test(i.message)))
})

// non-surface codes (e.g. crown) are ignored by coding rules
test('D2740 crown → no coding-rule errors', () => {
  assert.equal(errs([{ cdtCode: 'D2740', teeth: ['3'], surfaces: [] }]).length, 0)
})

// quadrant labels (non-numeric) skip arch check
test('toothArch ignores quadrant labels', () => {
  assert.equal(toothArch('UR'), null)
  assert.equal(toothArch('30'), 'posterior')
  assert.equal(toothArch('8'), 'anterior')
})

// diagnosis ↔ ICD agreement (warn)
test('D2391 with matching K02.52 dx → no warning', () => {
  assert.equal(diagnosisIcdMismatch([{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O'] }], ['K02.52 — Caries → dentin']).length, 0)
})
test('D2391 with unrelated dx → warning', () => {
  assert.equal(diagnosisIcdMismatch([{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O'] }], ['K05.10 — Gingivitis']).length, 1)
})

console.log(`\n${passed} test(s) passed`)
