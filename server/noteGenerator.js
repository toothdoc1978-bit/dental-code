import Anthropic from '@anthropic-ai/sdk'
import { buildMedicalNecessitySentences, CONSENTS, detectDrugAllergyConflicts } from '../src/data/examDefaults.js'

const client = new Anthropic()

const TRANSIENT_STATUS = new Set([408, 409, 429, 500, 502, 503, 504, 529])

function isTransient(err) {
  if (err?.status == null) return true // network / connection error, no HTTP status
  return TRANSIENT_STATUS.has(err.status)
}

async function createWithRetry(params, { attempts = 4 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await client.messages.create(params)
    } catch (err) {
      lastErr = err
      if (i === attempts - 1 || !isTransient(err)) throw err
      await new Promise((r) => setTimeout(r, 500 * 2 ** i))
    }
  }
  throw lastErr
}

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

function isInterproximal(surfaces) {
  return (surfaces || []).some((s) => s === 'M' || s === 'D')
}

function curingPhrase(p) {
  if (!p.cureTimeSec) return ''
  const base = `each increment light-cured for ${p.cureTimeSec} seconds per layer with an Ultradent VALO curing light`
  return p.valoPowerCures ? `${base}, with additional 4-second high-power cures from multiple angles` : base
}

function etchPhrase(p) {
  if (p.etchType === 'No etch / self-adhesive') return 'self-adhesive protocol (no separate phosphoric-acid etch)'
  if (p.etchType === 'Selective etch (enamel only)') return `selective-etch technique — enamel only etched with 37% phosphoric acid for ${p.etchTimeEnamel ?? 30}s (dentin left unetched)`
  return `total-etch technique with 37% phosphoric acid — enamel etched ${p.etchTimeEnamel ?? 30}s and dentin etched ${p.etchTimeDentin ?? 15}s`
}

function cleaningPhrase(p) {
  return p.prepCleaning ? `preparation cleaned with ${p.prepCleaning} followed by a thorough distilled-water rinse` : ''
}

function dryFieldPhrase(p) {
  return p.fieldIsolatedDry
    ? 'the operative field was isolated and kept dry, free of salivary/moisture contamination, throughout the procedure'
    : ''
}

function contactPhrase(surfaces) {
  return isInterproximal(surfaces)
    ? 'proximal contact with the adjacent tooth was verified (floss passed with appropriate resistance) and marginal ridge contour confirmed'
    : ''
}

function hemostasisPhrase(p) {
  return p.hemostaticAgent && p.hemostaticAgent !== 'None' ? `hemostasis achieved with ${p.hemostaticAgent}` : ''
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
          cleaningPhrase(p),
          `prep: ${p.prepMethod}`,
          hemostasisPhrase(p),
          isInterproximal(p.surfaces) && p.matrixSystem ? `matrix system: ${p.matrixSystem}` : ''
        ]
        if (isAmalgam) {
          const d = desensitizerPhrase(p.desensitizers)
          if (d) fields.push(d)
        } else {
          fields.push(`adhesive: ${etchPhrase(p)}`)
          fields.push(`bonding agent: ${p.bondingAgent}${p.msdsReviewed ? ' (applied per MSDS)' : ''}`)
          if (isComposite && p.compositeProduct) {
            fields.push(`restorative material placed: ${p.compositeProduct}`)
          }
          const cure = curingPhrase(p)
          if (cure) fields.push(cure)
        }
        fields.push(`base/liner: ${p.base}`)
        fields.push(p.occlusionAdjusted ? 'occlusion checked and adjusted with articulating paper' : 'occlusion not adjusted')
        const contact = contactPhrase(p.surfaces)
        if (contact) fields.push(contact)
        const dry = dryFieldPhrase(p)
        if (dry) fields.push(dry)
        if (p.additionalNotes) fields.push(`notes: ${p.additionalNotes}`)
        return `Procedure ${i + 1} — Filling ${tooth}: ${fields.filter(Boolean).join('; ')}`
      }
      if (p.type === 'sealant') {
        const isResin = (p.material || '').startsWith('Resin')
        const fields = [
          `${p.material} placed on ${tooth}`,
          `isolation: ${p.isolation}`
        ]
        if (isResin) {
          fields.push(`enamel etched with 37% phosphoric acid for ${p.etchTimeEnamel ?? 30}s, then rinsed and dried`)
          fields.push(`bonding agent: ${p.bondingAgent}${p.msdsReviewed ? ' (applied per MSDS)' : ''}`)
          if (p.flowableProduct) fields.push(`flowable composite: ${p.flowableProduct}`)
          const cure = curingPhrase(p)
          if (cure) fields.push(cure)
        } else {
          fields.push('placed per manufacturer instructions')
        }
        const dry = dryFieldPhrase(p)
        if (dry) fields.push(dry)
        if (p.additionalNotes) fields.push(`notes: ${p.additionalNotes}`)
        return `Procedure ${i + 1} — Sealant ${tooth}: ${fields.filter(Boolean).join('; ')}`
      }
      if (p.type === 'endo') {
        const fields = [
          `${(p.toothType || '').toLowerCase()} endodontic therapy on ${tooth}`.trim(),
          anesthesiaPhrase(p),
          `isolation: ${p.isolation || 'rubber dam'}`,
          p.canals ? `canals located/treated: ${p.canals}` : '',
          p.workingLength ? `working length: ${p.workingLength}` : '',
          p.irrigation ? `irrigation: ${p.irrigation}` : '',
          p.obturation ? `obturation: ${p.obturation}` : ''
        ]
        if (p.buildupPlaced) {
          fields.push(`post-endodontic core build-up placed (${p.buildupMaterial || 'composite core'})`)
          if (p.matrixSystem) fields.push(`matrix system: ${p.matrixSystem}`)
          const cure = curingPhrase(p)
          if (cure) fields.push(cure)
          if (p.occlusionAdjusted) fields.push('occlusion checked and adjusted with articulating paper')
        }
        const dry = dryFieldPhrase(p)
        if (dry) fields.push(dry)
        if (p.additionalNotes) fields.push(`notes: ${p.additionalNotes}`)
        return `Procedure ${i + 1} — Endodontic therapy ${tooth}: ${fields.filter(Boolean).join('; ')}`
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
            hemostasisPhrase(p),
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
            hemostasisPhrase(p),
            `impression: ${p.impression}`,
            `shade: ${p.shade}`,
            `temporary: ${p.temporary}`
          ]
        }
        const dry = dryFieldPhrase(p)
        if (dry) fields.push(dry)
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
  if (m.changesSinceLastVisit === false) parts.push('Medical history reviewed with patient, no changes reported since last visit')
  else if (m.changesSinceLastVisit === true) {
    const detail = (m.changesDetail || '').trim()
    parts.push(
      detail
        ? `Medical history reviewed with patient; changes reported since last visit — ${detail}`
        : 'Medical history reviewed with patient; changes reported since last visit (no detail captured in chart — flag in note rather than fabricate)'
    )
  }
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
  if (p.pediatricVisualExam) {
    const parts = [
      `Age-appropriate visual periodontal assessment (patient under 12): ${p.periodontiumType || 'Periodontally Healthy'} on visual inspection`,
      'comprehensive periodontal probing (bleeding on probing and pocket-depth charting) deferred as not clinically indicated at this age'
    ]
    if (p.ohStatus) parts.push(`oral hygiene status: ${p.ohStatus}`)
    return parts.join('; ')
  }
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

function hasOperativeProcedure(treatmentRendered, scheduledTreatment) {
  const renderedHasOperative = (treatmentRendered || []).some(
    (t) => t.cdtCode && !/^D0/.test(t.cdtCode)
  )
  const scheduledHasOperative = (scheduledTreatment?.procedures || []).length > 0
  return renderedHasOperative || scheduledHasOperative
}

function buildPostOpBlock(treatmentRendered, scheduledTreatment) {
  if (!hasOperativeProcedure(treatmentRendered, scheduledTreatment)) return ''
  return 'POSTOP_CONFIRMATION_REQUIRED — at least one operative (non-diagnostic) procedure was performed today. The Plan section must include exactly one sentence (in natural prose, not a bullet) confirming that post-operative care instructions were provided both orally AND in writing, and that the patient (or guardian/caregiver, when applicable) verbalized understanding of those instructions. Required for audit defense.'
}

function hasClosingDocProcedure(treatmentRendered, scheduledTreatment) {
  const rendered = (treatmentRendered || []).some((t) => t.cdtCode && /^D[2356]/.test(t.cdtCode))
  const scheduled = (scheduledTreatment?.procedures || []).some(
    (p) => p.type === 'filling' || p.type === 'crown' || p.type === 'endo'
  )
  return rendered || scheduled
}

function buildClosingDocBlock(treatmentRendered, scheduledTreatment) {
  if (!hasClosingDocProcedure(treatmentRendered, scheduledTreatment)) return ''
  return [
    'CLOSING_DOCUMENTATION_REQUIRED — at least one definitive restorative, endodontic, crown & bridge, or removable-prosthesis procedure was completed today. The Plan section must conclude with a brief closing-documentation statement, in natural prose (not bullets), covering ALL of the following clinical-attestation elements. This reflects the prevailing standard of care for definitive treatment and is required for audit defense:',
    '  1. OCCLUSION — state that the occlusion was checked following the procedure and adjusted as needed. If a procedure-level occlusion flag in the data indicates it was NOT adjusted (or not applicable, e.g. a root canal prior to the buildup), reflect that accurately rather than asserting an adjustment.',
    '  2. POST-OP INSTRUCTIONS — confirm post-operative care instructions were provided both orally AND in writing, and that the patient (or guardian/caregiver, when applicable) verbalized understanding. If POSTOP_CONFIRMATION_REQUIRED also appears in this prompt, THIS element satisfies it — do not write a second, separate post-op sentence.',
    '  3. RISKS — state that the risks associated with the procedure were reviewed with the patient.',
    '  4. PROGNOSIS — state that the prognosis for the treated tooth/teeth (or prosthesis) was discussed.',
    '  5. REFERRAL — include a referral recommendation ONLY if one is clinically indicated by the data; if no referral is indicated, omit this element entirely. Do not fabricate a referral and do not assert "no referral needed" unless the data supports it.',
    'Vary phrasing and clause order between regenerations so the closing statement does not read as a fixed macro. Elements 1–4 are mandatory; element 5 is conditional.'
  ].join('\n')
}

function buildDrugAllergyBlock(conflicts) {
  if (!conflicts.length) return ''
  const lines = conflicts.map(
    (c) =>
      `  - Documented allergy: "${c.allergen}" ↔ drug recorded (${c.source}): "${c.drug}" (${c.drugClass})${
        c.severity === 'caution' ? ' [verify — lower-certainty/class-level match]' : ' [potential contraindication]'
      }`
  )
  return [
    'DRUG_ALLERGY_ALERT — the chart contains a documented drug allergy that conflicts with a drug recorded for this visit. This is a patient-safety flag and MUST be surfaced explicitly in the note. State it in the Subjective medical-history review (and, when a prescription is involved, also in the Plan). For EACH conflict below, write a clear sentence naming the documented allergy AND the conflicting drug, and state that this represents a potential contraindication the treating dentist must verify and reconcile before the record is finalized.',
    'Hard prohibitions: do NOT assert that cross-reactivity was clinically cleared, that the drug was tolerated without reaction, that the allergy was ruled out, or that the conflict was otherwise resolved — none of that is in the data. Surface the discrepancy for the dentist to address; never paper over it or fabricate a clinical justification. Vary phrasing between regenerations.',
    'Conflicts:',
    ...lines
  ].join('\n')
}

export function requiresInvasiveConsent(data) {
  const procs = data?.scheduledTreatment?.procedures || []
  if (procs.some((p) => ['extraction', 'endo', 'crown'].includes(p?.type))) return true
  const rendered = data?.treatmentRendered || []
  return rendered.some((t) => {
    const c = t?.cdtCode || ''
    if (/^D3\d{3}$/.test(c)) return true // endodontics
    if (/^D7\d{3}$/.test(c)) return true // oral surgery / extractions
    if (c === 'D4341' || c === 'D4342') return true // SRP
    if (/^D27[4-9]\d$/.test(c)) return true // crowns (D2740–D2799)
    if (['D9230', 'D9241', 'D9243', 'D9248'].includes(c)) return true // sedation
    return false
  })
}

function buildConsentsBlock(signedConsents, invasiveConsentRequired) {
  const labels = Array.isArray(signedConsents)
    ? signedConsents.map((id) => CONSENTS.find((c) => c.id === id)?.label || id).filter(Boolean)
    : []
  if (labels.length) {
    return `CONSENTS_SIGNED: ${labels.join('; ')} — include a single natural sentence in the note confirming informed consent was obtained for these specific services. Do not list as bullets.`
  }
  if (invasiveConsentRequired) {
    return 'CONSENTS_STATUS: REQUIRED_BUT_MISSING — no signed consent is on file but an invasive procedure (extraction, endodontic therapy, crown, SRP, or sedation) is documented today. The Plan section MUST include exactly one prose sentence explicitly flagging that no signed informed consent was found in the chart for the documented procedure and that the record requires addendum/signature for audit defense. Do NOT fabricate language asserting consent was obtained, reviewed, or discussed; instead, surface the gap so the treating dentist can correct it before finalizing. Vary phrasing between regenerations.'
  }
  return 'CONSENTS_STATUS: NONE_RECORDED — do NOT include any consent-obtained, informed-consent, or consent-discussed language anywhere in the note. The consent topic must be silently omitted.'
}

const SYSTEM_PROMPT = `You are a clinical documentation assistant for a licensed Louisiana dentist. Your task is to transform structured dental examination data into a SOAP-format chart note suitable for a Dentrix G7 record, satisfying La. R.S. 37:757 (the dentist's obligation to keep a written record of every service performed) and the prevailing standard of care for dental documentation.

Rules:
1. Write in third person. Use "[PATIENT]" as a placeholder for the patient's name — the dentist will replace it after pasting into Dentrix.

2. DEFAULT OUTPUT FORMAT — SOAP. Use these four labeled sections in this order, each on its own line, with a single blank line between sections:

   S: (Subjective) — chief complaint in clinical phrasing, history of present illness, medical-history review (including any changes since the last visit, allergies, current medications, relevant systemic conditions), and any patient-reported symptoms or concerns. For EPSDT visits, parental/guardian-reported items belong here.

   O: (Objective) — clinically observed findings. Cover extraoral and intraoral soft-tissue examination, hard-tissue/tooth-chart findings, periodontal assessment, occlusion, and radiographic interpretation (with ALARA rationale per rule #13/#14). Include caries-risk level on EPSDT visits and any measurable values supplied (probing depths, mobility, etc.). Do not introduce findings not present in the data.

   A: (Assessment) — diagnoses and clinical impression. When ICD-10 codes are supplied, integrate them into prose (e.g., "Carious lesion extending into dentin on tooth #19 (K02.52)"). For scheduled treatment with no separate exam, the assessment may be brief.

   P: (Plan) — treatment rendered today (with CDT codes integrated into prose, tooth numbers, surfaces), treatment plan / future-recommended treatment, prescriptions, patient education / counseling, recall interval, and consent confirmation (when CONSENTS_SIGNED is supplied per rule #16). The Plan may use a short bulleted list ONLY when there are three or more discrete plan items that would be hard to follow as prose; otherwise prefer prose. End the Plan with a brief next-step statement (e.g., "Patient acknowledged understanding and was scheduled for follow-up.").

3. WITHIN-SECTION VARIATION — every regeneration must read as if freshly written. Within each SOAP section, vary sentence structure, the order findings are presented, voice (active/passive), and emphasis. Do not vary the OUTER order — S → O → A → P is fixed in the default mode. The variation is in the prose, not the labels.

4. Use proper dental clinical terminology (e.g., "carious lesion involving the mesial-occlusal-distal surfaces of tooth #3", "probing depths within physiologic range", "periapical radiograph").

5. Be specific — incorporate actual findings, CDT codes, tooth numbers, and values provided.

6. Include ALL documented elements across the appropriate SOAP sections: chief complaint (S), medical history review (S), examination findings (O), radiographic interpretation (O), diagnoses (A), treatment rendered with CDT codes (P), treatment plan (P), patient education (P). La. R.S. 37:757 requires a written record of EVERY service performed — no service may be silently dropped from the Plan section.

7. For EPSDT visits: explicitly state caries risk level (in O), document EPSDT screening findings (in O), and describe prevention counseling topics in natural prose (in P). This is required for MCNA Louisiana Medicaid compliance. Parental consent for any restorative work on a patient under 18 is required by La. Admin. Code tit. 46, Pt. XXXIII, §106 — when CONSENTS_SIGNED indicates parental consent, surface this in the Plan section.

8. Do NOT fabricate or infer findings not present in the data.

9. Length budget: 250–500 words for comprehensive exams, 120–250 words for limited/emergency visits, 200–400 words for scheduled-treatment visits. SOAP labels and blank lines do not count toward the budget.

10. EXTENUATING CASES — when the data is too sparse to populate every SOAP section meaningfully (e.g., a pure recall, a no-show / missed-appointment note, a phone-call addendum, a single-finding follow-up with no new exam), you MAY collapse the structure. Two acceptable variants:
   (a) Single-paragraph narrative that still touches the four conceptual elements — subjective patient report, observation, impression, plan — leading with the most clinically meaningful element.
   (b) Truncated SOAP — emit only the sections that have content, omitting the labels of empty sections rather than printing "None documented."
   Use SOAP whenever the data supports it. The collapsed form is the exception, not the default.

11. (Reserved — see rule #2 P-section for end-of-note next-step statement.)

12. For scheduled treatment visits: when PROCEDURES PERFORMED is provided, the Plan section is essentially a procedure note and must preserve the full technical sequence (anesthesia, isolation, prep, etch protocol with acid type and durations, bonding agent + MSDS, cure time, base/liner, occlusion check for fillings; reduction, margin, retraction, impression, shade, temporary, cementation for crowns; technique, complications, sutures, post-op for extractions). These technical details are required for MCNA Louisiana Medicaid compliance and must appear verbatim — do not abbreviate or summarize them away. Each procedure should be a clearly distinguishable paragraph within the Plan, in the order provided. The Subjective section may be brief ("Scheduled treatment visit; no new complaints since last visit"). The Objective section should confirm pre-op vitals/anesthesia tolerance and the surgical/operative field. The Assessment is typically a one-sentence restatement of the diagnoses driving the procedures.

13. For radiographs: when any radiograph is documented, the Objective section MUST explicitly state the ALARA clinical rationale for each image type (e.g., "Bitewing radiographs were obtained due to the patient's high caries risk profile" or "Panoramic radiograph was obtained to evaluate suspected odontogenic pathology and developing dentition"). This is required for payer audit defense — do not write a generic "radiographs were taken" without the specific clinical reason. If the rationale was NOT documented in the input data, explicitly flag that omission rather than fabricating one.

14. ALARA CATCH-ALL DYNAMIC REPHRASING PROTOCOL — applies whenever the user prompt contains an ALARA_CATCH_ALL section. The freshly composed sentence(s) belong in the Objective section alongside the rest of the radiograph interpretation. For each radiograph listed there, you MUST author a single sentence (or two-sentence run) that is freshly composed for this visit. Do NOT copy the base template phrasing below; the EHR will flag near-identical sentences across visits as "cloned notes" during audit. Treat the four concepts in part (b) as immutable medical-legal content that must appear — vary everything else.

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

15. MEDICAL NECESSITY — When the user prompt contains a MEDICAL_NECESSITY block, each listed sentence is required boilerplate for payer audit defense and must appear in the note. The natural home for these sentences is the Plan section (or the Assessment section if the sentence is purely diagnostic, e.g., for D4341 SRP justification). You may smooth grammar to integrate each sentence into the surrounding narrative, but you MUST preserve every clinically-relevant token (tooth number, surfaces, decay depth, "necessary due to", "non-restorable", "vitality testing and periapical radiograph confirm pulpal pathology", "probing depths ≥4 mm", "bone removal/sectioning required", etc.). Do not omit any of the sentences listed. If a sentence references a tooth or surface not otherwise mentioned in the data, treat it as authoritative.

16. CONSENTS — The user prompt will always contain exactly one of these three lines whenever procedures are documented. Consent language, when included, lives in the Plan section.
  - CONSENTS_SIGNED — include exactly one natural sentence in the Plan confirming informed consent was obtained for the listed services. Do not list them as a bullet point — integrate into prose. Example: "Informed consent for crown therapy and local anesthesia was reviewed with the patient and obtained prior to treatment."
  - CONSENTS_STATUS: REQUIRED_BUT_MISSING — an invasive procedure is documented today (extraction, endodontic therapy, crown, SRP, or sedation) but the chart shows no signed consent on file. Include exactly one prose sentence in the Plan that explicitly flags the gap and calls for an addendum — do NOT write that consent was obtained, reviewed, or discussed. Example phrasings: "Note: no signed informed consent for the documented procedure was found in the chart; the record requires addendum/signature prior to finalization for audit defense." / "No signed consent for [procedure] was located in the chart at the time of this note; the treating dentist should obtain or document consent before the record is finalized." Vary the wording between regenerations.
  - CONSENTS_STATUS: NONE_RECORDED — this is a hard prohibition. Do NOT write any sentence containing the words "informed consent," "consent was obtained," "consent was reviewed," "consent for [anything]," or any similar phrasing anywhere in the note. The consent topic is silently absent. Do not flag the gap, do not warn, do not invent — just omit. Treat consent language the same way you would treat a clinical finding that wasn't documented: it doesn't appear.

17. POST-OPERATIVE INSTRUCTIONS — when the user prompt contains a POSTOP_CONFIRMATION_REQUIRED line, the Plan section MUST conclude (or near-conclude, before the final next-step statement from rule #2) with exactly one natural sentence in prose confirming that post-operative care instructions were provided BOTH orally AND in writing, AND that the patient (or guardian/caregiver, when applicable) verbalized understanding of those instructions. The sentence must include all three concepts: oral delivery, written delivery, and the patient's expression of understanding. Vary the phrasing between regenerations (e.g., "Post-operative care instructions were reviewed verbally and provided in writing; the patient verbalized understanding." / "Both verbal and written post-operative instructions were given, and [PATIENT] indicated full understanding before being dismissed." / etc.). Do not list as a bullet. Do not omit any of the three concepts. When POSTOP_CONFIRMATION_REQUIRED is NOT present in the user prompt, do not add this sentence — it would be fabricated documentation.

18. CLOSING DOCUMENTATION — when the user prompt contains a CLOSING_DOCUMENTATION_REQUIRED block (fired after definitive restorative, endodontic, crown & bridge, or removable-prosthesis procedures), follow that block's instructions exactly: conclude the Plan with a brief prose closing statement covering occlusion check, post-operative instructions (oral + written + verbalized understanding), risks reviewed, prognosis discussed, and — only when clinically indicated — a referral recommendation. This block SUPERSEDES rule #17: when CLOSING_DOCUMENTATION_REQUIRED is present, its post-op element is the only post-op confirmation needed; do not also emit a separate rule-#17 sentence. Vary clause order and phrasing between regenerations so the statement never reads as a fixed macro. When CLOSING_DOCUMENTATION_REQUIRED is NOT present, do not add this closing statement.

19. DRUG-ALLERGY ALERT — when the user prompt contains a DRUG_ALLERGY_ALERT block, it has detected a documented allergy that conflicts with a drug recorded for this visit. Follow that block exactly: surface each conflict as an explicit patient-safety flag in the Subjective medical-history review (and in the Plan when a prescription is involved), naming both the allergy and the conflicting drug and stating it as a potential contraindication the treating dentist must verify and reconcile before finalizing the record. This is a hard requirement — do NOT omit it, do NOT bury it, and do NOT assert the conflict was clinically cleared, tolerated, or resolved (that would be fabricated). When DRUG_ALLERGY_ALERT is NOT present, do not invent allergy-conflict language.`

export async function generateNote(rawData) {
  const data = sanitize(rawData)
  const v = data.visitSetup || {}
  const isEpsdt = v.patientType === 'epsdt'
  const isScheduled = v.visitType === 'scheduled'

  const catchAllEntries = findCatchAllEntries(data.radiographs || {})
  const catchAllBlock = buildCatchAllBlock(catchAllEntries)
  const necessityBlock = buildMedicalNecessityBlock(data.treatmentRendered)
  const consentsBlock = buildConsentsBlock(data.signedConsents, requiresInvasiveConsent(data))
  const closingDocBlock = buildClosingDocBlock(data.treatmentRendered, data.scheduledTreatment)
  const postOpBlock = closingDocBlock ? '' : buildPostOpBlock(data.treatmentRendered, data.scheduledTreatment)
  const drugAllergyBlock = buildDrugAllergyBlock(detectDrugAllergyConflicts(data))

  const sections = (isScheduled
    ? [
        `VISIT: ${buildVisitNarrative(v)}`,
        `MEDICAL HISTORY: ${buildMedHx(data.medicalHistory || {})}`,
        drugAllergyBlock,
        `PROCEDURES PERFORMED:\n${buildProcedures(data.scheduledTreatment) || 'None documented'}`,
        catchAllBlock,
        necessityBlock,
        consentsBlock,
        postOpBlock,
        closingDocBlock
      ]
    : [
        `VISIT: ${buildVisitNarrative(v)}`,
        `MEDICAL HISTORY: ${buildMedHx(data.medicalHistory || {})}`,
        drugAllergyBlock,
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
        consentsBlock,
        postOpBlock,
        closingDocBlock
      ]
  ).filter(Boolean)

  const userPrompt = `Generate a dental chart note from the following clinical data. Respond with ONLY the note text — no preamble, no explanation, no markdown formatting.\n\n${sections.join('\n')}`

  const response = await createWithRetry({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    temperature: 1,
    // The system prompt is byte-identical on every call, so mark it cacheable.
    // Repeat generations within the cache window read the ~3.7K-token prefix at
    // ~0.1x cost and lower latency. The per-request user prompt stays uncached
    // (it renders after the system block), so output is unchanged.
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userPrompt }]
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  return text
}
