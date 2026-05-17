import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const ALLOWED_KEYS = new Set([
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
  'patientEducation'
])

function sanitize(data) {
  const out = {}
  for (const k of Object.keys(data)) if (ALLOWED_KEYS.has(k)) out[k] = data[k]
  return out
}

function buildVisitNarrative(v) {
  const types = { comprehensive: 'comprehensive oral evaluation', periodic: 'periodic recall examination', limited: 'limited problem-focused evaluation', emergency: 'emergency visit' }
  const pts = { epsdt: 'pediatric EPSDT Medicaid patient', child: 'pediatric patient', adult: 'adult patient' }
  return `${types[v.visitType] || 'dental visit'} for a ${pts[v.patientType] || 'patient'} on ${v.visitDate}`
}

function buildMedHx(m) {
  const parts = []
  if (m.changesSinceLastVisit === false) parts.push('Medical history reviewed, no changes since last visit')
  else if (m.changesSinceLastVisit === true) parts.push('Medical history reviewed, changes noted')
  if (m.conditions?.length) parts.push(`Significant conditions: ${m.conditions.join(', ')}`)
  if (m.allergies?.includes('NKA')) parts.push('NKDA')
  else if (m.allergies?.length) parts.push(`Allergies: ${m.allergies.join(', ')}`)
  if (m.medications) parts.push(`Current medications: ${m.medications}`)
  if (m.asaClass) parts.push(`ASA Class ${m.asaClass}`)
  return parts.join('; ') || 'Medical history reviewed'
}

function buildCC(c) {
  if (!c.type) return 'No specific chief complaint documented'
  const labels = { recall: 'routine recall/preventive visit', pain: 'pain/discomfort', followup: 'follow-up from previous treatment', emergency: 'emergency visit', cosmetic: 'cosmetic concern', other: 'other' }
  if (c.type !== 'pain') return `Patient presents for ${labels[c.type]}`
  const parts = [`Patient presents with pain`]
  if (c.location) parts.push(`location: ${c.location}`)
  if (c.duration) parts.push(`duration: ${c.duration}`)
  if (c.severity != null) parts.push(`severity ${c.severity}/10`)
  if (c.character?.length) parts.push(`character: ${c.character.join(', ')}`)
  return parts.join('; ')
}

function buildEpsdt(e) {
  if (!e) return ''
  const parts = []
  if (e.developmentWNL === true) parts.push('Growth and development within normal limits')
  else if (e.developmentWNL === false) parts.push('Growth and development - concerns noted')
  if (e.waterSource) parts.push(`Water source: ${e.waterSource}`)
  if (e.supplementalFluoride?.length) parts.push(`Fluoride: ${e.supplementalFluoride.join(', ')}`)
  if (e.cariesRisk) parts.push(`Caries risk: ${e.cariesRisk.toUpperCase()}`)
  if (e.riskFactors?.length) parts.push(`Risk/protective factors: ${e.riskFactors.join(', ')}`)
  if (e.counselingTopics?.length) parts.push(`Prevention counseling provided: ${e.counselingTopics.join(', ')}`)
  if (e.referralsNeeded?.length) parts.push(`Referrals: ${e.referralsNeeded.join(', ')}`)
  return parts.join('; ')
}

function buildSoftTissue(s) {
  const labels = { lips: 'Lips', buccalMucosa: 'Buccal mucosa', hardPalate: 'Hard palate', softPalate: 'Soft palate', tongue: 'Tongue', floorOfMouth: 'Floor of mouth', gingiva: 'Gingiva', oropharynx: 'Oropharynx', lymphNodes: 'Lymph nodes', tmj: 'TMJ' }
  const abnormal = Object.entries(s).filter(([, v]) => v !== 'wnl')
  if (!abnormal.length) return 'Soft tissue examination within normal limits in all areas'
  const findings = abnormal.map(([k, v]) => `${labels[k]}: ${v}`).join('; ')
  const wnlAreas = Object.entries(s).filter(([, v]) => v === 'wnl').map(([k]) => labels[k]).join(', ')
  return `Soft tissue findings: ${findings}. Remaining areas (${wnlAreas}) within normal limits`
}

function buildToothChart(chart) {
  const entries = Object.entries(chart).filter(([, v]) => v.conditions?.length)
  if (!entries.length) return 'Hard tissue examination - no significant findings'
  return entries
    .map(([tooth, v]) => {
      const surf = v.surfaces?.length ? ` (${v.surfaces.join('')})` : ''
      return `#${tooth}${surf}: ${v.conditions.join(', ')}`
    })
    .join('; ')
}

function buildPerio(p) {
  const parts = []
  if (p.periodontiumType) parts.push(p.periodontiumType)
  if (p.bop) parts.push(`BOP: ${p.bop}`)
  if (p.pocketDepthRange) parts.push(`Pocket depths: ${p.pocketDepthRange}`)
  if (p.furcation && p.furcation !== 'None') parts.push(`Furcation: ${p.furcation}`)
  if (p.calculus) parts.push(`Calculus: ${p.calculus}`)
  if (p.mobility) parts.push(`Mobility: ${p.mobility}`)
  if (p.ohStatus) parts.push(`Oral hygiene: ${p.ohStatus}`)
  if (p.fullChartDone) parts.push('Full periodontal chart completed and documented separately')
  return parts.join('; ') || 'Periodontal assessment not documented'
}

function buildOcclusion(o) {
  const parts = []
  if (o.molarClassR || o.molarClassL) parts.push(`Molar: R-Class ${o.molarClassR || 'NR'} / L-Class ${o.molarClassL || 'NR'}`)
  if (o.canineClassR || o.canineClassL) parts.push(`Canine: R-Class ${o.canineClassR || 'NR'} / L-Class ${o.canineClassL || 'NR'}`)
  if (o.overjet) parts.push(`Overjet: ${o.overjet}`)
  if (o.overbite) parts.push(`Overbite: ${o.overbite}`)
  if (o.midline) parts.push(`Midline: ${o.midline}`)
  if (o.crossbite && o.crossbite !== 'None') parts.push(`Crossbite: ${o.crossbite}`)
  if (o.habits?.length) parts.push(`Habits: ${o.habits.join(', ')}`)
  return parts.join('; ') || 'Occlusion not documented'
}

function buildRadiographs(r) {
  if (r.none) return 'No radiographs taken today'
  const parts = []
  if (r.taken?.length) parts.push(`Taken: ${r.taken.join(', ')}`)
  if (r.findings?.length) parts.push(`Findings: ${r.findings.join(', ')}`)
  if (r.additionalNotes) parts.push(r.additionalNotes)
  return parts.join('; ') || 'Radiographs not documented'
}

function buildTreatment(items) {
  if (!items?.length) return 'No treatment rendered today'
  return items
    .map((i) => {
      const teeth = i.teeth?.length ? ` #${i.teeth.join(',')}` : ''
      const surf = i.surfaces?.length ? ` (${i.surfaces.join('')})` : ''
      return `${i.cdtCode}${teeth}${surf} - ${i.description}`
    })
    .join('; ')
}

function buildPlan(items) {
  if (!items?.length) return 'No future treatment planned at this time'
  return items
    .map((i) => {
      const teeth = i.teeth?.length ? ` #${i.teeth.join(',')}` : ''
      const pri = i.priority ? ` [${i.priority}]` : ''
      return `${i.cdtCode}${teeth} - ${i.description}${pri}`
    })
    .join('; ')
}

const SYSTEM_PROMPT = `You are a clinical documentation assistant for a licensed Louisiana dentist. Your task is to transform structured dental examination data into a professional chart note narrative suitable for a Dentrix G7 record.

Rules:
1. Write in third person. Use "[PATIENT]" as a placeholder for the patient's name — the dentist will replace it after pasting into Dentrix.
2. Write as a continuous narrative — flowing paragraphs, NOT a bulleted list, NOT section headers, NOT a template form.
3. Vary your sentence structure and the order findings are presented. Each note should read as if written fresh by a clinician, not generated from a template. Lead with different elements between regenerations (sometimes CC, sometimes med hx review, sometimes exam summary).
4. Use proper dental clinical terminology (e.g., "carious lesion involving the mesial-occlusal-distal surfaces of tooth #3", "probing depths within physiologic range", "periapical radiograph").
5. Be specific — incorporate actual findings, CDT codes, tooth numbers, and values provided.
6. Include ALL documented elements: chief complaint, medical history review, examination findings (soft tissue, hard tissue, perio, occlusion), radiographic interpretation (if applicable), diagnoses, treatment rendered with CDT codes, treatment plan, and patient education.
7. For EPSDT visits: explicitly state caries risk level, document EPSDT screening findings, and describe prevention counseling topics in natural prose. This is required for MCNA Louisiana Medicaid compliance.
8. Do NOT fabricate or infer findings not present in the data.
9. Length: 200–400 words for comprehensive exams, 100–200 words for limited/emergency visits.
10. Do not include headers, section labels, or bullet points. Flowing clinical narrative only.
11. End with a brief statement of next steps (e.g., "Patient/guardian acknowledged understanding and was scheduled for follow-up.").`

export async function generateNote(rawData) {
  const data = sanitize(rawData)
  const v = data.visitSetup || {}
  const isEpsdt = v.patientType === 'epsdt'

  const sections = [
    `VISIT: ${buildVisitNarrative(v)}`,
    `MEDICAL HISTORY: ${buildMedHx(data.medicalHistory || {})}`,
    `CHIEF COMPLAINT: ${buildCC(data.chiefComplaint || {})}`,
    isEpsdt ? `EPSDT SCREENING: ${buildEpsdt(data.epsdtScreening)}` : '',
    `SOFT TISSUE: ${buildSoftTissue(data.softTissue || {})}`,
    `DENTAL FINDINGS (${data.dentitionType || 'permanent'} dentition): ${buildToothChart(data.toothChart || {})}`,
    `PERIODONTAL: ${buildPerio(data.perio || {})}`,
    `OCCLUSION: ${buildOcclusion(data.occlusion || {})}`,
    `RADIOGRAPHS: ${buildRadiographs(data.radiographs || {})}`,
    `TREATMENT RENDERED: ${buildTreatment(data.treatmentRendered)}`,
    `DIAGNOSES: ${data.diagnoses?.join('; ') || 'None documented'}`,
    `TREATMENT PLAN: ${buildPlan(data.treatmentPlan)}`,
    `PATIENT EDUCATION: ${data.patientEducation?.join(', ') || 'None documented'}`
  ].filter(Boolean)

  const userPrompt = `Generate a dental chart note from the following clinical data. Respond with ONLY the note text — no preamble, no explanation, no markdown formatting.\n\n${sections.join('\n')}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    temperature: 1,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  return text
}
