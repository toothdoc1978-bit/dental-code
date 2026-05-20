import Anthropic from '@anthropic-ai/sdk'
import { buildMedicalNecessitySentences, CONSENTS } from '../src/data/examDefaults.js'

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
  'patientEducation',
  'scheduledTreatment',
  'signedConsents'
])

function sanitize(data) {
  const out = {}
  for (const k of Object.keys(data)) if (ALLOWED_KEYS.has(k)) out[k] = data[k]
  return out
}

function buildVisitNarrative(v) {
  const types = {
    comprehensive: 'comprehensive oral evaluation',
    periodic: 'periodic recall examination',
    limited: 'limited problem-focused evaluation',
    emergency: 'emergency visit',
    scheduled: 'scheduled treatment visit'
  }
  const pts = { epsdt: 'pediatric EPSDT Medicaid patient', child: 'pediatric patient', adult: 'adult patient' }
  const provider = v.provider ? ` with ${v.provider}` : ''
  return `${types[v.visitType] || 'dental visit'} for a ${pts[v.patientType] || 'patient'}${provider} on ${v.visitDate}`
}

function anesthesiaPhrase(p) {
  if (!p.anestheticDrug) return `anesthesia: ${p.anesthesia || 'not documented'}`
  const carp = p.anestheticCarpules
  const carpStr = carp == null ? '' : `, ${carp} carpule${carp === 1 ? '' : 's'}`
  const tech = p.anestheticTechnique ? `, ${p.anestheticTechnique.toLowerCase()} technique` : ''
  return `anesthesia: ${p.anestheticDrug}${carpStr}${tech}`
}

function desensitizerPhrase(list) {
  const cleaned = (list || []).filter((d) => d && d !== 'None')
  return cleaned.length ? `desensitizer(s) placed under restoration: ${cleaned.join(', ')}` : ''
}

function buildProcedures(st) {
  if (!st || !st.procedures?.length) return ''
  return st.procedures
    .map((p, i) => {
      const tooth = p.tooth ? `#${p.tooth}` : 'tooth not specified'
      if (p.type === 'filling') {
        const isAmalgam = p.material === 'Amalgam'
        const isComposite = p.material === 'Composite'
        const fields = [
          `${p.material} restoration on ${tooth}${p.surfaces?.length ? ` (${p.surfaces.join('')} surfaces)` : ''}`,
          `decay depth: ${p.decayDepth}`,
          anesthesiaPhrase(p),
          `isolation: ${p.isolation}`,
          `prep: ${p.prepMethod}`
        ]
        if (isAmalgam) {
          const d = desensitizerPhrase(p.desensitizers)
          if (d) fields.push(d)
        } else {
          fields.push(`etch: ${p.etchType} for ${p.etchTimeEnamel}s enamel and ${p.etchTimeDentin}s dentin`)
          fields.push(`bonding agent: ${p.bondingAgent}${p.msdsReviewed ? ' (applied per MSDS)' : ''}`)
          fields.push(`light-cured ${p.cureTimeSec}s per layer`)
          if (isComposite && p.compositeProduct) {
            fields.push(`restorative material placed: ${p.compositeProduct}, light-cured per manufacturer instructions`)
          }
        }
        fields.push(`base/liner: ${p.base}`)
        fields.push(p.occlusionAdjusted ? 'occlusion checked and adjusted with articulating paper' : 'occlusion not adjusted')
        if (p.additionalNotes) fields.push(`notes: ${p.additionalNotes}`)
        return `Procedure ${i + 1} — Filling ${tooth}: ${fields.filter(Boolean).join('; ')}`
      }
      if (p.type === 'crown') {
        const apt = p.appointmentType || 'Prep (lab case)'
        const isSeat = apt === 'Seat (lab case delivery)' || apt === 'Seat'
        const isCerec = apt === 'Same-day CEREC'
        let fields
        if (isSeat) {
          fields = [
            `${p.crownType} crown seated on ${tooth}`,
            anesthesiaPhrase(p),
            `cementation: ${p.cementation || 'not specified'}`
          ]
        } else if (isCerec) {
          const vitalDetail =
            p.vitality === 'Vital'
              ? 'vital pulp'
              : p.vitality === 'Non-vital'
              ? 'non-vital tooth'
              : p.vitality === 'Previously RCT'
              ? 'previously endodontically treated tooth'
              : ''
          const showCrystallization =
            p.cerecCrystallization && p.cerecCrystallization !== 'N/A (no crystallization required)'
          const showRiva = p.vitality === 'Vital' && p.rivaStarApplied
          fields = [
            `same-day CEREC ${p.crownType} crown delivered on ${tooth}${vitalDetail ? ` (${vitalDetail})` : ''}`,
            anesthesiaPhrase(p),
            `digital impression captured with ${p.cerecScanDevice}`,
            `crown milled on ${p.cerecMill}`,
            showCrystallization ? `crystallization/sintering: ${p.cerecCrystallization}` : '',
            `crown material: ${p.cerecCrownMaterial}`,
            showRiva
              ? 'Riva Star desensitizer was applied to the prepared dentin immediately following the digital scan to manage post-operative sensitivity in the vital tooth'
              : '',
            `cementation: ${p.cementation || 'not specified'}`
          ]
        } else {
          fields = [
            `${p.crownType} crown preparation on ${tooth}`,
            anesthesiaPhrase(p),
            `reduction: ${p.reduction}`,
            `margin: ${p.marginDesign}, ${p.marginLocation}`,
            `retraction: ${p.retractionCord}`,
            `impression: ${p.impression}`,
            `shade: ${p.shade}`,
            `temporary: ${p.temporary}`
          ]
        }
        if (p.additionalNotes) fields.push(`notes: ${p.additionalNotes}`)
        return `Procedure ${i + 1} — Crown ${apt} on ${tooth}: ${fields.filter(Boolean).join('; ')}`
      }
      if (p.type === 'extraction') {
        const fields = [
          `${p.type} extraction of ${tooth}`,
          anesthesiaPhrase(p),
          `technique: ${p.technique}`,
          `complications: ${p.complications}`,
          p.socketPreservation ? `socket preservation with ${p.graftMaterial || 'graft material'}` : 'no socket preservation',
          `sutures: ${p.sutures}`,
          `post-op: ${p.postOpInstructions}`,
          p.additionalNotes ? `notes: ${p.additionalNotes}` : ''
        ].filter(Boolean)
        return `Procedure ${i + 1} — Extraction ${tooth}: ${fields.join('; ')}`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
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
  if (r.taken?.length) {
    const entries = r.taken.map((t) => {
      if (typeof t === 'string') return t
      const usesCatchAll = (t.panoIndications || []).includes('alara-retake')
      if (usesCatchAll) {
        // The ALARA catch-all rationale is emitted in a separate CATCH_ALL block (below) so the model
        // can generate fresh phrasing each visit. Here we only acknowledge the entry, without including
        // the static template text the model could otherwise echo verbatim.
        const stem = t.reason ? ` (additional rationale: ${t.reason})` : ''
        return `${t.type}${stem} [ALARA catch-all justification — see ALARA_CATCH_ALL section]`
      }
      const reason = t.reason ? ` (ALARA rationale: ${t.reason})` : ' (ALARA rationale NOT documented)'
      return `${t.type}${reason}`
    })
    parts.push(`Taken: ${entries.join('; ')}`)
  }
  if (r.findings?.length) parts.push(`Findings: ${r.findings.join(', ')}`)
  if (r.additionalNotes) parts.push(r.additionalNotes)
  return parts.join('; ') || 'Radiographs not documented'
}

function findCatchAllEntries(r) {
  if (!r?.taken?.length) return []
  return r.taken.filter((t) => typeof t === 'object' && (t.panoIndications || []).includes('alara-retake'))
}

function buildCatchAllBlock(catchAllEntries) {
  if (!catchAllEntries.length) return ''
  const lines = catchAllEntries.map((t, i) => {
    const reason = (t.alaraCatchAllReason || '').trim() || '[no specific clinical reason supplied — flag this in the note rather than fabricate one]'
    return `  ${i + 1}. ${t.type} — specific clinical reason to assess: ${reason}`
  })
  return [
    'ALARA_CATCH_ALL — Use the dynamic-rephrasing protocol described in the system prompt for the following images.',
    'Each line below names the radiograph and the specific clinical reason that must be woven into the dynamically rephrased sentence:',
    ...lines
  ].join('\n')
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

function buildMedicalNecessityBlock(treatmentRendered) {
  const sentences = buildMedicalNecessitySentences(treatmentRendered)
  if (!sentences.length) return ''
  const lines = sentences.map((s) => `  • [${s.code}] ${s.sentence}`)
  return [
    'MEDICAL_NECESSITY — Use the following pre-composed medical-necessity sentences verbatim or near-verbatim (preserve all clinical/legal language; you may smooth grammar to fit the narrative). These are required for payer audit defense:',
    ...lines
  ].join('\n')
}

function buildConsentsBlock(signedConsents) {
  const labels = Array.isArray(signedConsents)
    ? signedConsents.map((id) => CONSENTS.find((c) => c.id === id)?.label || id).filter(Boolean)
    : []
  if (!labels.length) {
    return 'CONSENTS_STATUS: NONE_RECORDED — do NOT include any consent-obtained, informed-consent, or consent-discussed language anywhere in the note. The consent topic must be silently omitted.'
  }
  return `CONSENTS_SIGNED: ${labels.join('; ')} — include a single natural sentence in the note confirming informed consent was obtained for these specific services. Do not list as bullets.`
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
11. End with a brief statement of next steps (e.g., "Patient/guardian acknowledged understanding and was scheduled for follow-up.").
12. For scheduled treatment visits: when PROCEDURES PERFORMED is provided, write a procedure note that preserves the full technical sequence (anesthesia, isolation, prep, etch protocol with acid type and durations, bonding agent + MSDS, cure time, base/liner, occlusion check for fillings; reduction, margin, retraction, impression, shade, temporary, cementation for crowns; technique, complications, sutures, post-op for extractions). These technical details are required for MCNA Louisiana Medicaid compliance and must appear verbatim in the narrative — do not abbreviate or summarize them away. Each procedure should be a clearly distinguishable paragraph or run of sentences, in the order provided.
13. For radiographs: when any radiograph is documented, the note MUST explicitly state the ALARA clinical rationale that was provided for each image type (e.g., "Bitewing radiographs were obtained due to the patient's high caries risk profile" or "Panoramic radiograph was obtained to evaluate suspected odontogenic pathology and developing dentition"). This is required for payer audit defense — do not write a generic "radiographs were taken" without the specific clinical reason. If the rationale was NOT documented in the input data, explicitly flag that omission rather than fabricating one.

14. ALARA CATCH-ALL DYNAMIC REPHRASING PROTOCOL — applies whenever the user prompt contains an ALARA_CATCH_ALL section. For each radiograph listed there, you MUST author a single sentence (or two-sentence run) that is freshly composed for this visit. Do NOT copy the base template phrasing below; the EHR will flag near-identical sentences across visits as "cloned notes" during audit. Treat the four concepts in part (b) as immutable medical-legal content that must appear — vary everything else.

  (a) Base template (for your reference only — DO NOT reproduce verbatim or near-verbatim):
      "Attempted intraoral radiographs, but patient age, oral anatomy, and behavioral tolerance precluded successful placement. To prevent unwarranted cumulative radiation exposure from non-diagnostic retakes (ALARA), a fast-capture digital extraoral scan utilizing pediatric dose-reduction/collimation settings was successfully utilized to assess [insert specific clinical reason]."

  (b) Four MANDATORY IMMUTABLE CONCEPTS — every generation MUST include all four, in any order or grammatical form, but with the bolded keywords appearing:
      • BARRIER: Intraoral placement was attempted but could not be obtained, citing some combination of age, oral anatomy, and behavioral tolerance/cooperation.
      • DEFENSE: The acronym "ALARA" must appear, in parentheses or in-line.
      • RISK AVOIDANCE: Mention preventing "cumulative radiation," "unnecessary exposure," or "non-diagnostic retakes" (any one is acceptable, more than one is fine).
      • TECHNOLOGY: Use the phrase "digital extraoral" (scan / imaging / acquisition) AND "pediatric dose-reduction" (or "pediatric collimation," or both).

  (c) Variable injection: blend the supplied "specific clinical reason" into the grammar of the sentence so it does not look like a fill-in-the-blank macro. Never output square brackets, "insert here," or any placeholder syntax in the final note.

  (d) Variation requirement: each generation must use a substantively different sentence structure than any plausible prior version. Lead from different angles between generations — the barrier, ALARA principles, the technology, or the diagnostic question being answered. Vary clause order, voice (active/passive), and connecting phrases.

  (e) Tone: professional, objective, clinically accurate, third-person, single-sentence-to-two-sentences in length.

  (f) FEW-SHOT EXAMPLES — four acceptable variations, each leading from a different angle, all containing the four mandatory concepts. Use these as a guide for the *kind* of variation expected; do NOT copy them verbatim:

  Example 1 — barrier-led:
    "Repeated intraoral receptor placement was attempted but could not be achieved given the patient's age, oral anatomy, and behavioral tolerance during the appointment; rather than incur the cumulative radiation burden of further non-diagnostic retakes, a digital extraoral scan acquired with pediatric dose-reduction and collimation settings was utilized in accordance with ALARA to evaluate the developing permanent dentition."

  Example 2 — ALARA-led:
    "In accordance with ALARA principles, additional intraoral retakes were avoided after initial sensor placement proved unfeasible due to the patient's age and anatomical constraints, and a digital extraoral acquisition employing pediatric collimation and dose-reduction was performed instead — providing diagnostic information about possible supernumerary teeth without contributing to unnecessary cumulative exposure."

  Example 3 — technology-led:
    "A digital extraoral scan with pediatric dose-reduction and collimation parameters was selected as the imaging modality after intraoral placement was precluded by patient anatomy and behavioral tolerance; this approach satisfied ALARA by eliminating the cumulative radiation associated with non-diagnostic retakes while still answering the clinical question regarding eruption pattern of the lower-left quadrant."

  Example 4 — diagnostic-question-led:
    "Evaluation of suspected mandibular pathology required diagnostic imaging that intraoral placement could not safely provide on account of the patient's age, anatomy, and behavioral tolerance; consistent with ALARA, a single digital extraoral acquisition utilizing pediatric dose-reduction and collimation was therefore preferred over repeated, non-diagnostic intraoral exposures."

  (g) If multiple radiographs in the visit fall under this protocol, give each one its own freshly varied sentence — do not repeat the same structure twice in the same note.

15. MEDICAL NECESSITY — When the user prompt contains a MEDICAL_NECESSITY block, each listed sentence is required boilerplate for payer audit defense and must appear in the note. You may smooth grammar to integrate the sentence into the surrounding narrative, but you MUST preserve every clinically-relevant token (tooth number, surfaces, decay depth, "necessary due to", "non-restorable", "vitality testing and periapical radiograph confirm pulpal pathology", "probing depths ≥4 mm", "bone removal/sectioning required", etc.). Do not omit any of the sentences listed. If a sentence references a tooth or surface not otherwise mentioned in the data, treat it as authoritative.

16. CONSENTS — The user prompt will always contain exactly one of these two lines whenever procedures are documented:
  - CONSENTS_SIGNED — include exactly one natural sentence in the note confirming informed consent was obtained for the listed services. Do not list them as a bullet point — integrate into prose. Example: "Informed consent for crown therapy and local anesthesia was reviewed with the patient and obtained prior to treatment."
  - CONSENTS_STATUS: NONE_RECORDED — this is a hard prohibition. Do NOT write any sentence containing the words "informed consent," "consent was obtained," "consent was reviewed," "consent for [anything]," or any similar phrasing. The consent topic is silently absent from the note. Do not flag the gap, do not warn, do not invent — just omit. Treat consent language the same way you would treat a clinical finding that wasn't documented: it doesn't appear.`

export async function generateNote(rawData) {
  const data = sanitize(rawData)
  const v = data.visitSetup || {}
  const isEpsdt = v.patientType === 'epsdt'
  const isScheduled = v.visitType === 'scheduled'

  const catchAllEntries = findCatchAllEntries(data.radiographs || {})
  const catchAllBlock = buildCatchAllBlock(catchAllEntries)
  const necessityBlock = buildMedicalNecessityBlock(data.treatmentRendered)
  const consentsBlock = buildConsentsBlock(data.signedConsents)

  const sections = (isScheduled
    ? [
        `VISIT: ${buildVisitNarrative(v)}`,
        `MEDICAL HISTORY: ${buildMedHx(data.medicalHistory || {})}`,
        `PROCEDURES PERFORMED:\n${buildProcedures(data.scheduledTreatment) || 'None documented'}`,
        catchAllBlock,
        necessityBlock,
        consentsBlock
      ]
    : [
        `VISIT: ${buildVisitNarrative(v)}`,
        `MEDICAL HISTORY: ${buildMedHx(data.medicalHistory || {})}`,
        `CHIEF COMPLAINT: ${buildCC(data.chiefComplaint || {})}`,
        isEpsdt ? `EPSDT SCREENING: ${buildEpsdt(data.epsdtScreening)}` : '',
        `SOFT TISSUE: ${buildSoftTissue(data.softTissue || {})}`,
        `DENTAL FINDINGS (${data.dentitionType || 'permanent'} dentition): ${buildToothChart(data.toothChart || {})}`,
        `PERIODONTAL: ${buildPerio(data.perio || {})}`,
        `OCCLUSION: ${buildOcclusion(data.occlusion || {})}`,
        `RADIOGRAPHS: ${buildRadiographs(data.radiographs || {})}`,
        catchAllBlock,
        `TREATMENT RENDERED: ${buildTreatment(data.treatmentRendered)}`,
        `DIAGNOSES: ${data.diagnoses?.join('; ') || 'None documented'}`,
        `TREATMENT PLAN: ${buildPlan(data.treatmentPlan)}`,
        `PATIENT EDUCATION: ${data.patientEducation?.join(', ') || 'None documented'}`,
        necessityBlock,
        consentsBlock
      ]
  ).filter(Boolean)

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
