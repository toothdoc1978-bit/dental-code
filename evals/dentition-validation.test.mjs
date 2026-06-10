// Deterministic unit tests for the dentition–age mismatch detector in
// src/data/examDefaults.js. Plain Node assert — no framework.
// Run: node evals/dentition-validation.test.mjs

import assert from 'node:assert/strict'
import { detectDentitionMismatches } from '../src/data/examDefaults.js'

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

const chart = (overrides = {}) => ({
  visitSetup: { age: 35 },
  toothChart: {},
  treatmentRendered: [],
  treatmentPlan: [],
  scheduledTreatment: { procedures: [] },
  ...overrides
})

test('silent when age missing', () => {
  const flags = detectDentitionMismatches({
    visitSetup: {},
    toothChart: { 30: { conditions: ['caries'], surfaces: ['O'] } }
  })
  assert.equal(flags.length, 0)
})

test('adult age + permanent #30 → no flag', () => {
  const flags = detectDentitionMismatches(
    chart({ toothChart: { 30: { conditions: ['caries'], surfaces: ['O'] } } })
  )
  assert.equal(flags.length, 0)
})

test('age 3 + permanent #30 charted → flagged', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 3 },
      toothChart: { 30: { conditions: ['caries'], surfaces: ['O'] } }
    })
  )
  assert.equal(flags.length, 1)
  assert.match(flags[0].issue, /permanent tooth #30/i)
})

test('age 9 + permanent #19 first molar → no flag (erupts ~6)', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 9 },
      toothChart: { 19: { conditions: ['caries'], surfaces: ['O'] } }
    })
  )
  assert.equal(flags.length, 0)
})

test('age 7 + permanent #15 second molar → flagged (erupts ~11)', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 7 },
      toothChart: { 15: { conditions: ['caries'], surfaces: ['O'] } }
    })
  )
  assert.equal(flags.length, 1)
})

test('age 16 + third molar #32 → no flag', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 16 },
      toothChart: { 32: { conditions: ['Unerupted/partially erupted'], surfaces: [] } }
    })
  )
  assert.equal(flags.length, 0)
})

test('toddler age 4 + primary K charted → no flag', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 4 },
      toothChart: { K: { conditions: ['arrested caries'], surfaces: ['O'] } }
    })
  )
  assert.equal(flags.length, 0)
})

test('adult age 18 + primary K charted → flagged (past exfoliation)', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 18 },
      toothChart: { K: { conditions: ['caries'], surfaces: ['O'] } }
    })
  )
  assert.equal(flags.length, 1)
  assert.match(flags[0].issue, /primary tooth K/i)
})

test('Unerupted/partially erupted permanent in young chart → silent (legitimate monitoring)', () => {
  const flags = detectDentitionMismatches(
    chart({
      visitSetup: { age: 4 },
      toothChart: { 30: { conditions: ['Unerupted/partially erupted'], surfaces: [] } }
    })
  )
  assert.equal(flags.length, 0)
})

test('scheduled procedure source detected', () => {
  const flags = detectDentitionMismatches({
    visitSetup: { age: 3 },
    toothChart: {},
    scheduledTreatment: { procedures: [{ tooth: '30', type: 'filling' }] },
    treatmentRendered: [],
    treatmentPlan: []
  })
  assert.equal(flags.length, 1)
  assert.equal(flags[0].source, 'scheduled procedure')
})

test('treatment-rendered source detected with CDT in source label', () => {
  const flags = detectDentitionMismatches({
    visitSetup: { age: 3 },
    toothChart: {},
    treatmentRendered: [{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O'] }],
    treatmentPlan: [],
    scheduledTreatment: { procedures: [] }
  })
  assert.equal(flags.length, 1)
  assert.match(flags[0].source, /treatment rendered.*D2391/i)
})

test('same tooth same source not duplicated', () => {
  const flags = detectDentitionMismatches({
    visitSetup: { age: 3 },
    toothChart: { 30: { conditions: ['caries'], surfaces: ['O'] } },
    treatmentRendered: [{ cdtCode: 'D2391', teeth: ['30'], surfaces: ['O'] }],
    treatmentPlan: [],
    scheduledTreatment: { procedures: [] }
  })
  // Once for tooth chart, once for treatment rendered — distinct sources, both reported.
  assert.equal(flags.length, 2)
})

test('quadrant labels like "UR" ignored (not numeric, not letter)', () => {
  const flags = detectDentitionMismatches({
    visitSetup: { age: 3 },
    toothChart: {},
    treatmentRendered: [{ cdtCode: 'D4341', teeth: ['UR'], surfaces: [] }],
    treatmentPlan: [],
    scheduledTreatment: { procedures: [] }
  })
  assert.equal(flags.length, 0)
})

console.log(`\n${passed} test(s) passed`)
