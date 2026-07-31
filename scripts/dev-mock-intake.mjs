// Dev-only mock of the dental-intake-forms middleware.
// Verifies HMAC over /api/intake-fetch?code=XXXX-XXXX and returns a fixture.
// Run alongside `npm run dev` (or via `npm run dev:intake`).
//
// Pair with these .env values:
//   INTAKE_MIDDLEWARE_URL=http://localhost:4000
//   INTAKE_SHARED_SECRET=test-secret
//
// Recognized fixture codes:
//   ABCD-1234  → adult asthma + ADHD + penicillin allergy + pain CC
//   PEDS-2025  → pediatric EPSDT preview (water source, dev WNL, caries-risk)
//   PHI0-LEAK  → returns a fragment with a PHI key (to test guard rejection)
//   anything else (matching regex) → 404 visit code not found

import http from 'node:http'
import crypto from 'node:crypto'

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4000
const SECRET = process.env.INTAKE_SHARED_SECRET || 'test-secret'

const FIXTURES = {
  'ABCD-1234': {
    visitSetup: { patientType: 'adult', age: 34 },
    medicalHistory: {
      conditions: ['asthma', 'adhd'],
      allergies: ['penicillin'],
      medications: 'albuterol, concerta, amoxicillin',
      asaClass: 'II'
    },
    chiefComplaint: {
      type: 'pain',
      location: 'upper right molar',
      severity: 6,
      character: ['sharp', 'cold-sensitive'],
      duration: '2 weeks'
    },
    signedConsents: ['general', 'photo_video']
  },
  'PEDS-2025': {
    visitSetup: { patientType: 'pediatric', age: 8 },
    medicalHistory: {
      conditions: ['asthma'],
      allergies: [],
      medications: 'flovent',
      asaClass: 'II'
    },
    epsdtScreening: {
      developmentWNL: true,
      waterSource: 'fluoridated municipal',
      supplementalFluoride: ['varnish'],
      cariesRisk: 'moderate',
      riskFactors: ['snacking between meals']
    },
    chiefComplaint: { type: 'recall' },
    signedConsents: ['general', 'photo_video']
  },
  'PHI0-LEAK': {
    visitSetup: { patientType: 'adult', age: 42 },
    medicalHistory: {
      name: 'Jane Doe',
      conditions: ['diabetes']
    }
  }
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (req.method !== 'GET' || url.pathname !== '/api/intake-fetch') {
    return send(res, 404, { error: 'not found' })
  }
  const code = url.searchParams.get('code') || ''
  const pathAndQuery = `/api/intake-fetch?code=${code}`
  const expected = crypto.createHmac('sha256', SECRET).update(pathAndQuery).digest('hex')
  const got = req.headers['x-intake-signature']
  if (got !== expected) {
    console.log(`mock-intake [bad-sig] ${code.slice(0, 4)}-****`)
    return send(res, 401, { error: 'bad signature' })
  }
  const fixture = FIXTURES[code]
  if (!fixture) {
    console.log(`mock-intake [unknown] ${code.slice(0, 4)}-****`)
    return send(res, 404, { error: 'visit code not found or expired' })
  }
  console.log(`mock-intake [hit] ${code.slice(0, 4)}-****`)
  return send(res, 200, { chartFragment: fixture })
})

server.listen(PORT, () => {
  console.log(`mock-intake listening on http://localhost:${PORT}`)
  console.log(`  fixtures: ${Object.keys(FIXTURES).join(', ')}`)
  console.log(`  HMAC secret: ${SECRET === 'test-secret' ? 'test-secret (default)' : '(from env)'}`)
})
