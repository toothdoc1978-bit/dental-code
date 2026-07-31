// Deterministic unit tests for CDT conflict detection + category reminders in
// src/data/examDefaults.js. Plain Node assert — no framework.
// Run: node evals/conflict-validation.test.mjs   (or: npm run eval:conflicts)

import assert from 'node:assert/strict'
import { detectCdtConflicts, categoryDocReminders } from '../src/data/examDefaults.js'

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

const errs = (codes) => detectCdtConflicts(codes).filter((c) => c.severity === 'error')
const warns = (codes) => detectCdtConflicts(codes).filter((c) => c.severity === 'warn')

test('D0120 + D0150 → one hard conflict', () => {
  assert.equal(errs(['D0120', 'D0150']).length, 1)
})

test('D1110 + D1120 → one hard conflict', () => {
  assert.equal(errs(['D1110', 'D1120']).length, 1)
})

test('order-independent: D0150 + D0120 still conflicts', () => {
  assert.equal(errs(['D0150', 'D0120']).length, 1)
})

test('lowercase codes are normalized', () => {
  assert.equal(errs(['d0120', 'd0150']).length, 1)
})

test('D7140 + D7210 → one caution (warn)', () => {
  assert.equal(warns(['D7140', 'D7210']).length, 1)
  assert.equal(errs(['D7140', 'D7210']).length, 0)
})

test('D1110 + D4341 → one caution (warn)', () => {
  assert.equal(warns(['D1110', 'D4341']).length, 1)
})

test('non-conflicting set → no conflicts', () => {
  assert.equal(detectCdtConflicts(['D0150', 'D2392', 'D0274']).length, 0)
})

test('single code → no conflicts', () => {
  assert.equal(detectCdtConflicts(['D0120']).length, 0)
})

test('D9230 present → reminder', () => {
  const r = categoryDocReminders(['D9230', 'D0150'])
  assert.equal(r.length, 1)
  assert.match(r[0].message, /monitoring/i)
})

test('D7210 present → reminder', () => {
  const r = categoryDocReminders(['D7210'])
  assert.equal(r.length, 1)
  assert.match(r[0].message, /surgical complexity/i)
})

test('no high-audit codes → no reminders', () => {
  assert.equal(categoryDocReminders(['D2392', 'D0150']).length, 0)
})

console.log(`\n${passed} test(s) passed`)
