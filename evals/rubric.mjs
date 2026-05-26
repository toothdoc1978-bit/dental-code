// Compliance rubric. Each check is self-gating: applies(chart) decides whether
// the check is relevant, evaluate(note, chart) returns { status, detail }.
// status: 'pass' | 'fail' | 'warn' | 'na'. Only pass/fail count toward score.

import { MEDICAL_NECESSITY_TEMPLATES } from '../src/data/examDefaults.js'

const m = (text, re) => re.test(text)
const wordCount = (s) => (s.trim().match(/\S+/g) || []).length

function hasOperative(chart) {
  const rendered = (chart.treatmentRendered || []).some((t) => t.cdtCode && !/^D0/.test(t.cdtCode))
  const scheduled = (chart.scheduledTreatment?.procedures || []).length > 0
  return rendered || scheduled
}

function hasClosingDoc(chart) {
  const rendered = (chart.treatmentRendered || []).some((t) => t.cdtCode && /^D[2356]/.test(t.cdtCode))
  const scheduled = (chart.scheduledTreatment?.procedures || []).some((p) => p.type === 'filling' || p.type === 'crown')
  return rendered || scheduled
}

function radiographsTaken(chart) {
  const r = chart.radiographs || {}
  return !r.none && (r.taken || []).length > 0
}

function hasCatchAll(chart) {
  return (chart.radiographs?.taken || []).some((t) => (t.panoIndications || []).includes('alara-retake'))
}

function scheduledProcs(chart) {
  return chart.scheduledTreatment?.procedures || []
}

function hasType(chart, type) {
  return scheduledProcs(chart).some((p) => p.type === type)
}

// Resin work that requires an etch/adhesive step (excludes self-adhesive fillings and GI/RMGI sealants).
function hasResinEtchWork(chart) {
  return scheduledProcs(chart).some(
    (p) =>
      (p.type === 'filling' && p.material !== 'Amalgam' && p.etchType !== 'No etch / self-adhesive') ||
      (p.type === 'sealant' && (p.material || '').startsWith('Resin'))
  )
}

// Any light-cured resin procedure (filling, resin sealant, or endo with a build-up).
function hasLightCuredResin(chart) {
  return scheduledProcs(chart).some(
    (p) =>
      (p.type === 'filling' && p.material !== 'Amalgam') ||
      (p.type === 'sealant' && (p.material || '').startsWith('Resin')) ||
      (p.type === 'endo' && p.buildupPlaced)
  )
}

export const RUBRIC = [
  {
    name: 'soap_structure',
    why: 'Notes default to S/O/A/P labels unless the encounter is too sparse (extenuating collapse allowed).',
    applies: () => true,
    evaluate: (note) => {
      const labels = ['S:', 'O:', 'A:', 'P:'].filter((l) => new RegExp(`^\\s*${l}`, 'm').test(note))
      if (labels.length >= 3) return { status: 'pass', detail: `${labels.length}/4 SOAP labels` }
      if (wordCount(note) < 130) return { status: 'pass', detail: 'short note — collapse permitted' }
      return { status: 'fail', detail: `only ${labels.length}/4 SOAP labels in a full-length note` }
    }
  },
  {
    name: 'patient_placeholder',
    why: 'Name must be the [PATIENT] placeholder, never an invented name.',
    applies: () => true,
    evaluate: (note) => {
      if (m(note, /\[PATIENT\]/)) return { status: 'pass', detail: 'placeholder present' }
      return { status: 'warn', detail: 'no [PATIENT] placeholder (may be fine if patient never named)' }
    }
  },
  {
    name: 'no_phi_pattern',
    why: 'No SSN / phone / MRN-like digit patterns should leak into the note.',
    applies: () => true,
    evaluate: (note) => {
      const ssn = /\b\d{3}-\d{2}-\d{4}\b/
      const phone = /\b\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/
      if (m(note, ssn) || m(note, phone)) return { status: 'fail', detail: 'SSN/phone-like pattern found' }
      return { status: 'pass', detail: 'clean' }
    }
  },
  {
    name: 'treatment_codes_present',
    why: 'La. R.S. 37:757 — every service performed must appear in the note.',
    applies: (c) => (c.treatmentRendered || []).length > 0,
    evaluate: (note, c) => {
      const missing = (c.treatmentRendered || []).map((t) => t.cdtCode).filter((code) => code && !note.includes(code))
      return missing.length
        ? { status: 'fail', detail: `missing CDT codes: ${missing.join(', ')}` }
        : { status: 'pass', detail: 'all CDT codes present' }
    }
  },
  {
    name: 'alara_rationale',
    why: 'Each radiograph needs an ALARA clinical rationale; catch-all needs the dynamic-rephrasing concepts.',
    applies: (c) => radiographsTaken(c),
    evaluate: (note, c) => {
      if (hasCatchAll(c)) {
        const ok = m(note, /ALARA/i) && m(note, /digital extraoral/i) && m(note, /pediatric (dose|collimation|dose-reduction)/i)
        return ok
          ? { status: 'pass', detail: 'catch-all concepts present' }
          : { status: 'fail', detail: 'catch-all missing ALARA / digital extraoral / pediatric dose-reduction' }
      }
      const mentionsRad = m(note, /radiograph|bitewing|periapical|panoramic|imaging|film/i)
      const purpose = m(
        note,
        /(ALARA|caries risk|high caries|bone loss|to (evaluat|assess|facilitat|confirm|determine|screen|rule out|investigat|visualiz)|due to|because|given|owing to|prompted by|secondary to|in light of|based on|warrant|indicat|obtained to|taken to|for (the )?(evaluation|assessment|caries|pain|trauma|pathology|status|pre-extraction|periodontal))/i
      )
      return mentionsRad && purpose
        ? { status: 'pass', detail: 'radiograph rationale present' }
        : { status: 'fail', detail: 'no ALARA / clinical rationale for radiograph' }
    }
  },
  {
    name: 'consent_fork',
    why: 'Consent language only when consents are signed; never invented when none recorded.',
    applies: (c) => hasOperative(c),
    evaluate: (note, c) => {
      const hasConsentLang = m(note, /consent/i)
      const signed = (c.signedConsents || []).length > 0
      if (signed && !hasConsentLang) return { status: 'fail', detail: 'consents signed but no consent sentence' }
      if (!signed && hasConsentLang) return { status: 'fail', detail: 'consent language present with NONE recorded (fabrication)' }
      return { status: 'pass', detail: signed ? 'consent confirmed' : 'correctly silent on consent' }
    }
  },
  {
    name: 'postop_confirmation',
    why: 'Operative procedures require post-op instructions: oral + written + verbalized understanding.',
    applies: (c) => hasOperative(c),
    evaluate: (note) => {
      const oral = m(note, /(orally|verbally|verbal)/i)
      const written = m(note, /(in writing|written)/i)
      const understood = m(note, /(verbalized|understanding|understood)/i)
      const miss = [!oral && 'oral', !written && 'written', !understood && 'understanding'].filter(Boolean)
      return miss.length
        ? { status: 'fail', detail: `post-op missing: ${miss.join(', ')}` }
        : { status: 'pass', detail: 'oral + written + understanding present' }
    }
  },
  {
    name: 'closing_doc_block',
    why: 'Definitive restorative/endo/prosthetic procedures add occlusion + risks + prognosis.',
    applies: (c) => hasClosingDoc(c),
    evaluate: (note) => {
      const occ = m(note, /occlus/i)
      const risk = m(note, /risk/i)
      const prog = m(note, /prognos/i)
      const miss = [!occ && 'occlusion', !risk && 'risks', !prog && 'prognosis'].filter(Boolean)
      return miss.length
        ? { status: 'fail', detail: `closing block missing: ${miss.join(', ')}` }
        : { status: 'pass', detail: 'occlusion + risks + prognosis present' }
    }
  },
  {
    name: 'medical_necessity',
    why: 'High-audit-risk codes must carry necessity language for payer defense.',
    applies: (c) => (c.treatmentRendered || []).some((t) => MEDICAL_NECESSITY_TEMPLATES[t.cdtCode]),
    evaluate: (note) =>
      m(note, /necessar|necessit|required due to|insufficient (tooth )?structure|non-restorable/i)
        ? { status: 'pass', detail: 'necessity language present' }
        : { status: 'fail', detail: 'no medical-necessity language' }
  },
  {
    name: 'epsdt_caries_risk',
    why: 'MCNA Louisiana requires explicit caries-risk level on every EPSDT visit.',
    applies: (c) => c.visitSetup?.patientType === 'epsdt' && !!c.epsdtScreening?.cariesRisk,
    evaluate: (note) =>
      m(note, /caries risk/i) ? { status: 'pass', detail: 'caries risk stated' } : { status: 'fail', detail: 'caries risk not stated' }
  },
  {
    name: 'pediatric_perio',
    why: 'Under-12 visual perio must defer probing and must NOT fabricate pocket/BOP numbers.',
    applies: (c) => !!c.perio?.pediatricVisualExam,
    evaluate: (note) => {
      const visual = m(note, /visual/i) && m(note, /(defer|not .{0,25}indicated|not .{0,25}routine)/i)
      const fabricated = m(note, /\b\d+\s*mm\b/i) || m(note, /bleeding on probing[^.]*\d+\s*%/i) || m(note, /pocket depth[^.]*\d/i)
      if (!visual) return { status: 'fail', detail: 'missing visual / deferred-probing language' }
      if (fabricated) return { status: 'fail', detail: 'fabricated pocket/BOP numbers in a visual-only exam' }
      return { status: 'pass', detail: 'visual exam, no fabricated probing values' }
    }
  },
  {
    name: 'no_postop_when_exam_only',
    why: 'Exam-only visits must not invent post-op or closing-block language.',
    applies: (c) => !hasOperative(c),
    evaluate: (note) =>
      m(note, /(post-operative instructions|prognosis was discussed|verbalized understanding)/i)
        ? { status: 'fail', detail: 'post-op/closing language on a non-operative visit' }
        : { status: 'pass', detail: 'correctly omits post-op language' }
  },
  {
    name: 'isolation_documented',
    why: 'Fillings, sealants, and endodontic therapy must document the isolation method.',
    applies: (c) => scheduledProcs(c).some((p) => ['filling', 'sealant', 'endo'].includes(p.type)),
    evaluate: (note) =>
      m(note, /(isolat|isolite|rubber dam|cotton roll|dri-?angle)/i)
        ? { status: 'pass', detail: 'isolation method documented' }
        : { status: 'fail', detail: 'no isolation method mentioned' }
  },
  {
    name: 'dry_field',
    why: 'Procedures flagged as isolated should confirm the field/prep was kept dry.',
    applies: (c) => scheduledProcs(c).some((p) => p.fieldIsolatedDry),
    evaluate: (note) =>
      m(note, /(kept dry|maintained dry|moisture control|(?:field|isolat\w*|preparation)[^.]{0,30}dry|dry[^.]{0,30}(?:field|throughout))/i)
        ? { status: 'pass', detail: 'dry-field statement present' }
        : { status: 'fail', detail: 'no dry-field confirmation' }
  },
  {
    name: 'valo_curing',
    why: 'Light-cured resin procedures should document Ultradent VALO curing.',
    applies: (c) => hasLightCuredResin(c),
    evaluate: (note) => {
      if (m(note, /VALO/i)) return { status: 'pass', detail: 'VALO curing documented' }
      if (m(note, /light-cur|cured/i)) return { status: 'warn', detail: 'curing mentioned but VALO not named' }
      return { status: 'fail', detail: 'no curing/VALO documented' }
    }
  },
  {
    name: 'interproximal_contact',
    why: 'Interproximal (M/D) restorations must confirm contact with the adjacent tooth.',
    applies: (c) => scheduledProcs(c).some((p) => p.type === 'filling' && (p.surfaces || []).some((s) => s === 'M' || s === 'D')),
    evaluate: (note) =>
      m(note, /((proximal|interproximal) contact|contact[^.]{0,25}adjacent|adjacent tooth|marginal ridge)/i)
        ? { status: 'pass', detail: 'proximal contact confirmed' }
        : { status: 'fail', detail: 'no proximal-contact confirmation for an interproximal restoration' }
  },
  {
    name: 'etch_protocol',
    why: 'Resin work documents an etch/adhesive step; self-adhesive must not fabricate phosphoric-acid etching.',
    applies: (c) => scheduledProcs(c).some((p) => (p.type === 'filling' && p.material !== 'Amalgam') || (p.type === 'sealant' && (p.material || '').startsWith('Resin'))),
    evaluate: (note, c) => {
      if (!hasResinEtchWork(c)) {
        // The only resin work present is self-adhesive — no phosphoric-acid etch should be described.
        return m(note, /(phosphoric acid|total-etch|selective-etch)/i)
          ? { status: 'fail', detail: 'self-adhesive case but note describes phosphoric-acid etching' }
          : { status: 'pass', detail: 'correctly omits etch for self-adhesive work' }
      }
      return m(note, /etch/i) && m(note, /(phosphoric|adhesive)/i)
        ? { status: 'pass', detail: 'etch/adhesive protocol documented' }
        : { status: 'fail', detail: 'no etch/adhesive protocol documented' }
    }
  },
  {
    name: 'endo_protocol',
    why: 'Endodontic therapy must document working length and obturation under rubber-dam isolation.',
    applies: (c) => hasType(c, 'endo'),
    evaluate: (note) => {
      const miss = [
        !m(note, /(working length|apex locator)/i) && 'working length',
        !m(note, /(obturat|gutta|bioceramic|single-cone)/i) && 'obturation',
        !m(note, /rubber dam/i) && 'rubber dam'
      ].filter(Boolean)
      return miss.length
        ? { status: 'fail', detail: `endo missing: ${miss.join(', ')}` }
        : { status: 'pass', detail: 'working length + obturation + rubber dam documented' }
    }
  }
]

export function scoreNote(note, chart) {
  const results = RUBRIC.map((check) => {
    if (!check.applies(chart)) return { name: check.name, status: 'na', detail: '' }
    try {
      const r = check.evaluate(note, chart)
      return { name: check.name, ...r }
    } catch (e) {
      return { name: check.name, status: 'fail', detail: `check error: ${e.message}` }
    }
  })
  const counted = results.filter((r) => r.status === 'pass' || r.status === 'fail')
  const passing = counted.filter((r) => r.status === 'pass').length
  return {
    results,
    passing,
    failing: counted.length - passing,
    counted: counted.length,
    pct: counted.length ? Math.round((passing / counted.length) * 100) : 100
  }
}
