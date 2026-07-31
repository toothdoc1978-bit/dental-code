// Compliance rubric. Each check is self-gating: applies(chart) decides whether
// the check is relevant, evaluate(note, chart) returns { status, detail }.
// status: 'pass' | 'fail' | 'warn' | 'na'. Only pass/fail count toward score.

import { MEDICAL_NECESSITY_TEMPLATES, detectDrugAllergyConflicts } from '../src/data/examDefaults.js'

// Mirrors server/noteGenerator.js#requiresInvasiveConsent (kept inline so the rubric
// stays free of server-side SDK imports). If you change one, change the other.
function requiresInvasiveConsent(data) {
  const procs = data?.scheduledTreatment?.procedures || []
  if (procs.some((p) => ['extraction', 'endo', 'crown'].includes(p?.type))) return true
  const rendered = data?.treatmentRendered || []
  return rendered.some((t) => {
    const c = t?.cdtCode || ''
    if (/^D3\d{3}$/.test(c)) return true
    if (/^D7\d{3}$/.test(c)) return true
    if (c === 'D4341' || c === 'D4342') return true
    if (/^D27[4-9]\d$/.test(c)) return true
    if (['D9230', 'D9241', 'D9243', 'D9248'].includes(c)) return true
    return false
  })
}

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

// A catch-all radiograph with an empty reason isn't an actual rephrasing case — the prompt is
// instructed to flag the missing reason rather than fabricate one. Detect that state separately.
function hasCatchAllWithEmptyReason(chart) {
  return (chart.radiographs?.taken || []).some(
    (t) => (t.panoIndications || []).includes('alara-retake') && !(t.alaraCatchAllReason || '').trim()
  )
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
      if (hasCatchAllWithEmptyReason(c)) {
        // Reason is blank — prompt is instructed to flag the gap, not generate the dynamic-rephrasing concepts.
        // Pass when the note explicitly flags the missing rationale within ~140 chars of ALARA or the
        // radiograph noun, using any of: missing/absent/no rationale, addendum/finaliz, record deficiency,
        // not documented/supplied/specified/recorded/on file, treating dentist should/must.
        const flagged = m(
          note,
          /(ALARA[^.]{0,140}(?:not (?:documented|specified|supplied|provided|recorded|on file)|missing|absent|absence of|gap|deficien|addendum|finaliz|treating dentist (?:should|must|may)|flagged as a record)|no (?:specific|clinical|documented)?\s*(?:clinical )?(?:rationale|indication|reason)[^.]{0,140}(?:radiograph|imag|panoram|ALARA)|(?:rationale|indication|reason)[^.]{0,140}(?:was )?not (?:documented|supplied|provided|recorded|on file)|absence of a documented (?:clinical )?(?:rationale|indication|reason))/i
        )
        return flagged
          ? { status: 'pass', detail: 'catch-all empty-reason flagged (prompt did not fabricate)' }
          : { status: 'fail', detail: 'catch-all reason blank but note neither flags the gap nor declines to fabricate' }
      }
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
    why: 'Consent language only when consents are signed OR an invasive procedure is documented without consent (where the note must flag the gap).',
    applies: (c) => hasOperative(c),
    evaluate: (note, c) => {
      const hasConsentLang = m(note, /consent/i)
      const signed = (c.signedConsents || []).length > 0
      const invasive = requiresInvasiveConsent(c)
      if (signed && !hasConsentLang) return { status: 'fail', detail: 'consents signed but no consent sentence' }
      if (!signed && !invasive && hasConsentLang) return { status: 'fail', detail: 'consent language present with NONE recorded (fabrication)' }
      // When !signed && invasive, the note SHOULD mention consent (as a flag) — handled by consent_required_on_invasive.
      return { status: 'pass', detail: signed ? 'consent confirmed' : invasive ? 'flag path (see consent_required_on_invasive)' : 'correctly silent on consent' }
    }
  },
  {
    name: 'consent_required_on_invasive',
    why: 'Invasive procedures (extraction, endo, crown, SRP, sedation) without a signed consent on file must be flagged as a documentation gap, not silently passed.',
    applies: (c) => requiresInvasiveConsent(c) && !(c.signedConsents || []).length,
    evaluate: (note) => {
      // Pass when the note explicitly flags the gap — mentions consent in proximity to a gap/addendum word.
      const flagged = m(note, /(no (?:signed )?(?:informed )?consent[^.]{0,120}(?:on file|in the chart|located|found|documented|addendum|signature|prior to finaliz|audit))|((?:addendum|signature|finaliz)[^.]{0,80}consent)|(consent[^.]{0,60}(?:not (?:on file|documented|located|found|signed)|gap|missing))/i)
      if (flagged) return { status: 'pass', detail: 'consent gap flagged for addendum' }
      return { status: 'fail', detail: 'invasive procedure documented but consent gap not flagged' }
    }
  },
  {
    name: 'drug_allergy_conflict',
    why: 'A documented allergy that conflicts with a drug recorded for the visit must be surfaced as a safety flag — naming both the allergy and the drug — never silently passed or papered over.',
    applies: (c) => detectDrugAllergyConflicts(c).length > 0,
    evaluate: (note, c) => {
      const conflicts = detectDrugAllergyConflicts(c)
      const flagWord = /(contraindicat|cross-react|reconcil|discrepan|potential (reaction|interaction|conflict|contraindication)|verif|caution|safety (concern|flag|alert)|should (not )?(be )?(verif|confirm|administ|avoid)|must (be )?(verif|confirm|reconcil)|flag)/i
      const sentences = note.split(/(?<=[.;:\n])\s+/)
      const hasAllergy = m(note, /allerg/i)
      const unflagged = conflicts.filter((cf) => {
        const drugRe = new RegExp('\\b' + cf.drug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
        if (!drugRe.test(note)) return true // conflicting drug not even named
        // Require a sentence that ties a flag word to either the drug or the allergy concept.
        return !sentences.some((s) => flagWord.test(s) && (drugRe.test(s) || /allerg/i.test(s)))
      })
      // The conflict must be surfaced as UNRESOLVED. Asserting it was cleared/tolerated/safe is a
      // fabrication (no such data exists) and a false reassurance — fail it even if "flagged".
      const fabricatedClearance = m(
        note,
        /((cross-react\w*|allerg\w*|contraindication)[^.]{0,70}(was|were|is|are|been)?\s*(cleared|ruled out|deemed safe|deemed appropriate|resolved|not a concern|no concern|not clinically significant)|tolerated[^.]{0,40}without (any )?(reaction|incident|adverse)|no contraindication (exists|is present|was identified|noted))/i
      )
      if (fabricatedClearance) {
        return { status: 'fail', detail: 'allergy conflict asserted cleared/tolerated (fabrication — must surface as unresolved)' }
      }
      if (unflagged.length === 0 && hasAllergy) {
        return { status: 'pass', detail: 'allergy–drug conflict flagged for verification' }
      }
      return {
        status: 'fail',
        detail: 'drug–allergy conflict not surfaced: ' + (unflagged.map((u) => `${u.allergen}↔${u.drug}`).join(', ') || 'no allergy mention')
      }
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
      // Only fail when verbalized-understanding language is anchored to a procedure/post-op concept
      // (instructions, post-op care, risks, treatment, the procedure). On exam-only EPSDT visits the
      // caregiver routinely "verbalizes understanding" of *counseling/education*, which is fine.
      m(note, /(post-operative instructions|prognosis was discussed|verbalized understanding[^.]{0,80}(?:post-?op|procedure|treatment|instructions|risks|care given|aftercare)|(?:post-?op|procedure|treatment|aftercare)[^.]{0,80}verbalized understanding)/i)
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
    why: 'Procedures flagged as isolated should attest the field was kept dry / isolation maintained throughout. Accepts the dryness/moisture vocabulary OR maintained-isolation phrasing (clinically equivalent), but not a bare "isolation placed" with no maintenance.',
    applies: (c) => scheduledProcs(c).some((p) => p.fieldIsolatedDry),
    evaluate: (note) =>
      m(
        note,
        /(kept dry|maintained dry|moisture control|dry field|dry and controlled|free of (salivary|saliva|moisture)|moisture[ -]?free|saliva[ -]?free|dry[,\s][^.]{0,40}(?:field|environment|operative|throughout)|(?:field|isolat\w*|preparation)[^.]{0,40}dry|isolat\w*[^.]{0,60}(?:maintained|throughout|sustained)|(?:maintained|sustained)[^.]{0,40}isolat)/i
      )
        ? { status: 'pass', detail: 'dry-field / maintained-isolation attestation present' }
        : { status: 'fail', detail: 'no dry-field or maintained-isolation confirmation' }
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
