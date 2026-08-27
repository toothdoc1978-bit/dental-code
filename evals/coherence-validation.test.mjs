// Deterministic unit tests for the tooth-condition coherence detector in
// src/data/examDefaults.js. Plain Node assert — no framework.
// Run: node evals/coherence-validation.test.mjs

import assert from 'node:assert/strict'
import { detectToothConditionConflicts } from '../src/data/examDefaults.js'

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

test('empty chart → silent', () => {
  assert.equal(detectToothConditionConflicts({}).length, 0)
  assert.equal(detectToothConditionConflicts(null).length, 0)
  assert.equal(detectToothConditionConflicts(undefined).length, 0)
})

test('single condition per tooth → silent', () => {
  const flags = detectToothConditionConflicts({
    3: { conditions: ['Caries'], surfaces: ['O/I'] },
    19: { conditions: ['Crown'] },
    30: { conditions: ['Missing'] }
  })
  assert.equal(flags.length, 0)
})

test('coherent combination → silent', () => {
  const flags = detectToothConditionConflicts({
    19: { conditions: ['Root canal treated', 'Crown'] },
    3: { conditions: ['Caries', 'Watch/monitor'] }
  })
  assert.equal(flags.length, 0)
})

test('Missing + Caries → error', () => {
  const flags = detectToothConditionConflicts({ 3: { conditions: ['Missing', 'Caries'] } })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].severity, 'error')
  assert.equal(flags[0].tooth, '3')
  assert.deepEqual(flags[0].pair, ['Missing', 'Caries'])
})

test('Missing + two other conditions → two error flags', () => {
  const flags = detectToothConditionConflicts({ 3: { conditions: ['Missing', 'Caries', 'Fracture'] } })
  assert.equal(flags.length, 2)
  assert.ok(flags.every((f) => f.severity === 'error'))
})

test('Implant + Root canal treated → error', () => {
  const flags = detectToothConditionConflicts({ 19: { conditions: ['Implant', 'Root canal treated'] } })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].severity, 'error')
})

test('Implant + Crown → silent (implant crowns are real)', () => {
  const flags = detectToothConditionConflicts({ 19: { conditions: ['Implant', 'Crown'] } })
  assert.equal(flags.length, 0)
})

test('Crown + Existing amalgam → warn', () => {
  const flags = detectToothConditionConflicts({ 19: { conditions: ['Crown', 'Existing amalgam'] } })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].severity, 'warn')
})

test('Unerupted + Existing composite → warn', () => {
  const flags = detectToothConditionConflicts({ 18: { conditions: ['Unerupted/partially erupted', 'Existing composite'] } })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].severity, 'warn')
})

test('primary tooth letters as keys work', () => {
  const flags = detectToothConditionConflicts({ K: { conditions: ['Missing', 'Caries'] } })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].tooth, 'K')
})

test('unknown condition strings → silent', () => {
  const flags = detectToothConditionConflicts({ 3: { conditions: ['Craze lines', 'Attrition'] } })
  assert.equal(flags.length, 0)
})

test('conditions missing on entry → silent', () => {
  const flags = detectToothConditionConflicts({ 3: { surfaces: ['O/I'] } })
  assert.equal(flags.length, 0)
})

console.log(`\n${passed} test(s) passed`)
