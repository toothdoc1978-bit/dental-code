// Chart-data schema shared by the generator and the runner.
// Mirrors the shape server/noteGenerator.js consumes. No PHI is ever permitted:
// no patient name, DOB, address, phone, Medicaid ID, SSN, or guardian name.

export const ALLOWED_TOP_LEVEL = [
  'visitSetup',
  'medicalHistory',
  'chiefComplaint',
  'epsdtScreening',
  'softTissue',
  'toothChart',
  'dentitionType',
  'perio',
  'occlusion',
  'radiographs',
  'treatmentRendered',
  'diagnoses',
  'treatmentPlan',
  'patientEducation',
  'scheduledTreatment',
  'signedConsents',
  'softTissueExamined'
]

const ALLOWED_VISIT_SETUP = ['patientType', 'visitType', 'visitDate', 'provider', 'age']

const PHI_KEYS = new Set([
  'patientName', 'name', 'firstName', 'lastName', 'dob', 'dateOfBirth',
  'medicaidId', 'memberId', 'ssn', 'address', 'phone', 'guardianName', 'email'
])

// Strips anything outside the allow-list so generated/loaded charts can never
// smuggle PHI into the prompt, even if a model invents extra fields.
export function cleanChart(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const k of ALLOWED_TOP_LEVEL) if (k in raw) out[k] = raw[k]
  if (out.visitSetup && typeof out.visitSetup === 'object') {
    const vs = {}
    for (const k of ALLOWED_VISIT_SETUP) if (k in out.visitSetup) vs[k] = out.visitSetup[k]
    out.visitSetup = vs
  }
  return scrubPhi(out)
}

function scrubPhi(node) {
  if (Array.isArray(node)) return node.map(scrubPhi)
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      if (PHI_KEYS.has(k)) continue
      out[k] = scrubPhi(v)
    }
    return out
  }
  return node
}

// Compact schema description handed to the generator model.
export const CHART_SCHEMA_DESCRIPTION = `Each chart is a JSON object. Use ONLY these keys (omit any that don't apply):

visitSetup: { patientType: "adult"|"child"|"epsdt", visitType: "comprehensive"|"periodic"|"limited"|"emergency"|"scheduled", visitDate: "YYYY-MM-DD", age: number, provider?: "Dr. Garner" (required only when visitType is "scheduled") }
medicalHistory: { changesSinceLastVisit: true|false, changesDetail?: string (only when changes true; e.g. "started apixaban 2 weeks ago"), conditions?: string[], allergies?: string[] (use ["NKA"] for none), medications?: string, asaClass?: "I"|"II"|"III"|"IV" }
chiefComplaint: { type: "recall"|"pain"|"followup"|"emergency"|"cosmetic"|"other", location?: string, duration?: string, severity?: 0-10, character?: string[] }
epsdtScreening (only when patientType "epsdt"): { developmentWNL: true|false, waterSource?: string, supplementalFluoride?: string[], cariesRisk: "low"|"moderate"|"high", riskFactors?: string[], counselingTopics?: string[], referralsNeeded?: string[] }
softTissue: { lips, buccalMucosa, hardPalate, softPalate, tongue, floorOfMouth, gingiva, oropharynx, lymphNodes, tmj } each "wnl" or a short finding string
softTissueExamined: bool (false = soft-tissue exam intentionally not performed; use false with an empty softTissue object for limited/emergency charts that skip it)
toothChart: { "<toothNumber>": { conditions: string[], surfaces?: string[] } }
dentitionType: "permanent"|"primary"|"mixed"
perio: { periodontiumType?: string, bop?: string, pocketDepthRange?: string, furcation?: string, calculus?: string, mobility?: string, ohStatus?: "Good"|"Fair"|"Poor", fullChartDone?: bool, pediatricVisualExam?: bool (true for under-12 visual-only assessment) }
occlusion: { molarClassR, molarClassL, canineClassR, canineClassL, overjet, overbite, midline, crossbite, habits? }
radiographs: { none: bool, taken: [{ type: string, reason: string, panoIndications?: string[] (include "alara-retake" to trigger the ALARA catch-all), alaraCatchAllReason?: string }], findings?: string[], additionalNotes?: string }
treatmentRendered: [{ cdtCode: string (e.g. "D2392","D2740","D3330","D7140","D0150"), description: string, teeth?: string[], surfaces?: string[] }]
diagnoses: string[] (e.g. "K02.52 — Caries → dentin")
treatmentPlan: [{ cdtCode, description, teeth?, priority? }]
patientEducation: string[]
scheduledTreatment (only when visitType "scheduled"): { procedures: [{ id, type:"filling"|"crown"|"extraction", tooth, material?, surfaces?, anestheticDrug?, anestheticCarpules?, anestheticTechnique?, ...procedure-specific fields, additionalNotes? }] }
signedConsents: string[] from ["general","imaging","cbct","local_anesthesia","nitrous","extraction","endo","crown","sdf","sedation"]

ABSOLUTELY NO PHI: never include patient name, DOB, address, phone, Medicaid/member ID, SSN, or any real identifier. Age is allowed.`
