// =============================================================================
// Clinical Safety Eval Cases
// -----------------------------------------------------------------------------
// Real(istic) presentations encoded as structured visits, paired with the
// contraindication the app MUST surface. This is the dataset behind the
// "look at the data" learning loop: each case is a synthetic chart that a
// clinician would enter, and `expect` is the ground-truth safety flag.
//
// To grow the loop: add a case here, run `npm run eval:safety` (or the Jest
// suite), and if it fails, add/adjust a rule in ../contraindicationEngine.ts.
// =============================================================================

import type { Visit, HealthHistory, Procedure, ContraindicationSeverity } from '../../types/visit';

export interface SafetyEvalCase {
  caseId: string;
  category: string;
  /** What the clinician sees; mirrors the raw_clinical_input of the source case. */
  summary: string;
  visit: Visit;
  /** Contraindication rule ids (+severity) the engine must produce for this case. */
  expect: { id: string; severity: ContraindicationSeverity }[];
}

// -- Builders -----------------------------------------------------------------
// Self-contained (no uuid / runtime deps) so the eval runner can execute under
// plain Node with native TypeScript support.

let seq = 0;
const id = (prefix: string) => `${prefix}-${++seq}`;

function proc(cdt: string, tooth?: number): Procedure {
  return { id: id('proc'), cdt, tooth, surfaces: [], icd10: '', procFields: {} };
}

function makeVisit(opts: {
  name: string;
  age: number;
  chiefComplaint: string;
  health: Partial<HealthHistory>;
  procedures?: Procedure[];
}): Visit {
  return {
    id: id('visit'),
    patient: { name: opts.name, dob: '', age: opts.age, payer: 'Self-Pay', payerGroup: 'self-pay' },
    visitInfo: {
      dos: '2026-06-16',
      provider: 'Dr. Chad Gardner',
      chiefComplaint: opts.chiefComplaint,
      guardianPresent: false,
    },
    procedures: opts.procedures ?? [],
    diagnoses: [],
    radiographs: [],
    clinicalFindings: { cariesRisk: 'moderate' },
    healthHistory: { riskFlags: [], activeConditions: [], ...opts.health },
    consent: [],
    anesthesia: [],
    outcome: { text: '', followup: [], postOpMethod: 'verbal', postOpInstructions: '' },
  };
}

// -- Cases --------------------------------------------------------------------

export const SAFETY_CASES: SafetyEvalCase[] = [
  {
    caseId: 'SYN-001',
    category: 'MRONJ / Bisphosphonate Trap',
    summary:
      '68F, throbbing #14 with nocturnal pain. Irreversible pulpitis + apical periodontitis. ' +
      'On oral Fosamax x5yr — surgical extraction risks osteonecrosis; endodontics preferred.',
    visit: makeVisit({
      name: 'SYN-001',
      age: 68,
      chiefComplaint: 'Throbbing upper-left tooth (#14), wakes her at night',
      health: {
        activeConditions: ['Osteopenia', 'High cholesterol'],
        medications: ['Atorvastatin', 'Fosamax (alendronate), oral x5 years'],
        allergies: ['NKDA'],
      },
    }),
    expect: [{ id: 'mronj-antiresorptive', severity: 'critical' }],
  },
  {
    caseId: 'SYN-002',
    category: 'Anticoagulant / Bleeding Trap',
    summary:
      '71M, non-restorable fractured #30, wants it pulled today. On Warfarin with INR 3.8 — ' +
      'severe bleeding risk; do not extract without physician consult / hemostatic measures.',
    visit: makeVisit({
      name: 'SYN-002',
      age: 71,
      chiefComplaint: 'Broke a back tooth (#30) on a popcorn kernel',
      health: {
        activeConditions: ['Atrial fibrillation', 'Hypertension'],
        medications: ['Metoprolol', 'Warfarin (Coumadin)'],
        labs: { inr: 3.8 },
      },
      procedures: [proc('D7140', 30)], // patient requesting same-day extraction
    }),
    expect: [{ id: 'bleeding-anticoagulant', severity: 'critical' }],
  },
  {
    caseId: 'SYN-003',
    category: 'Allergy / Anaphylaxis Trap',
    summary:
      '34F, acute apical abscess on #3 with buccal swelling. Severe penicillin allergy (anaphylaxis) — ' +
      'do not prescribe amoxicillin; use clindamycin or azithromycin.',
    visit: makeVisit({
      name: 'SYN-003',
      age: 34,
      chiefComplaint: 'Right cheek swollen, painful to bite (#3)',
      health: {
        activeConditions: ['Asthma'],
        medications: ['Albuterol inhaler'],
        allergies: ['Penicillin (anaphylaxis / throat swelling)'],
      },
    }),
    expect: [{ id: 'allergy-penicillin', severity: 'critical' }],
  },
  {
    caseId: 'SYN-004',
    category: 'Uncontrolled Diabetes / Healing Trap',
    summary:
      '55M, generalized 5–8mm pockets, mobility, heavy calculus. Type 2 diabetes with HbA1c 9.8% — ' +
      'impaired healing; defer elective periodontal surgery until glycemic control improves.',
    visit: makeVisit({
      name: 'SYN-004',
      age: 55,
      chiefComplaint: 'Bleeding gums, teeth feel loose',
      health: {
        activeConditions: ['Type 2 Diabetes'],
        medications: ['Metformin'],
        labs: { hba1c: 9.8 },
      },
    }),
    expect: [{ id: 'diabetes-glycemic', severity: 'critical' }],
  },
  {
    caseId: 'SYN-005',
    category: 'Pregnancy / NSAID Trap',
    summary:
      '28F, reversible pulpitis on #19, pregnant at 30 weeks (3rd trimester). Asks about Advil — ' +
      'NSAIDs contraindicated in 3rd trimester; recommend acetaminophen.',
    visit: makeVisit({
      name: 'SYN-005',
      age: 28,
      chiefComplaint: 'Sharp pain to cold, lower left (#19), resolves quickly',
      health: {
        riskFlags: ['Pregnancy'],
        medications: ['Prenatal vitamins'],
        pregnancyTrimester: 3,
      },
    }),
    expect: [{ id: 'pregnancy-nsaid', severity: 'critical' }],
  },
];
