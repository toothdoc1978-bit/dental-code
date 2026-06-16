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
  expect?: { id: string; severity: ContraindicationSeverity }[];
  /** Rule ids that must NOT fire (guards against false positives). */
  expectAbsent?: string[];
  /** No alert of 'critical' severity should be produced (alert-fatigue guard). */
  expectNoCritical?: boolean;
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

// -- Robustness / held-out cases ----------------------------------------------
// Not tuned to the source cases above — these probe boundaries, alternative
// drugs, and false-positive risks. They are where the loop earns its keep.

export const ROBUSTNESS_CASES: SafetyEvalCase[] = [
  {
    caseId: 'EDGE-01',
    category: 'MRONJ — non-bisphosphonate antiresorptive',
    summary: 'Denosumab (Prolia) carries the same MRONJ risk as bisphosphonates.',
    visit: makeVisit({
      name: 'EDGE-01',
      age: 74,
      chiefComplaint: 'Routine evaluation',
      health: { activeConditions: ['Osteoporosis'], medications: ['Prolia (denosumab)'] },
    }),
    expect: [{ id: 'mronj-antiresorptive', severity: 'critical' }],
  },
  {
    caseId: 'EDGE-02',
    category: 'DOAC — not INR-monitored',
    summary: 'Apixaban (Eliquis) with a planned surgical extraction; no INR exists for DOACs.',
    visit: makeVisit({
      name: 'EDGE-02',
      age: 66,
      chiefComplaint: 'Non-restorable #19',
      health: { activeConditions: ['Atrial fibrillation'], medications: ['Eliquis (apixaban)'] },
      procedures: [proc('D7210', 19)],
    }),
    expect: [{ id: 'bleeding-anticoagulant', severity: 'warning' }],
  },
  {
    caseId: 'EDGE-03',
    category: 'Warfarin — therapeutic INR',
    summary: 'Warfarin with INR 3.2 and a planned extraction — safe with local measures (not critical).',
    visit: makeVisit({
      name: 'EDGE-03',
      age: 70,
      chiefComplaint: 'Non-restorable #30',
      health: { medications: ['Warfarin'], labs: { inr: 3.2 } },
      procedures: [proc('D7140', 30)],
    }),
    expect: [{ id: 'bleeding-anticoagulant', severity: 'warning' }],
  },
  {
    caseId: 'EDGE-04',
    category: 'Dual antiplatelet',
    summary: 'Clopidogrel (Plavix) with a planned extraction — bleeding caution, no INR involved.',
    visit: makeVisit({
      name: 'EDGE-04',
      age: 68,
      chiefComplaint: 'Non-restorable #18',
      health: { activeConditions: ['Coronary stent'], medications: ['Clopidogrel (Plavix)', 'Aspirin 81mg'] },
      procedures: [proc('D7140', 18)],
    }),
    expect: [{ id: 'bleeding-anticoagulant', severity: 'warning' }],
  },
  {
    caseId: 'EDGE-05',
    category: 'Diabetes — borderline control',
    summary: 'HbA1c 8.2% is above target but not critical.',
    visit: makeVisit({
      name: 'EDGE-05',
      age: 60,
      chiefComplaint: 'Perio evaluation',
      health: { activeConditions: ['Type 2 Diabetes'], medications: ['Metformin'], labs: { hba1c: 8.2 } },
    }),
    expect: [{ id: 'diabetes-glycemic', severity: 'warning' }],
  },
  {
    caseId: 'EDGE-06',
    category: 'Pregnancy — second trimester',
    summary: 'Second-trimester pregnancy is a caution (NSAIDs still discouraged), not critical.',
    visit: makeVisit({
      name: 'EDGE-06',
      age: 31,
      chiefComplaint: 'Cleaning',
      health: { riskFlags: ['Pregnancy'], pregnancyTrimester: 2 },
    }),
    expect: [{ id: 'pregnancy-nsaid', severity: 'warning' }],
  },
  {
    caseId: 'EDGE-07',
    category: 'Allergy — amoxicillin spelled out',
    summary: 'Amoxicillin allergy is a penicillin-class allergy.',
    visit: makeVisit({
      name: 'EDGE-07',
      age: 40,
      chiefComplaint: 'Localized swelling',
      health: { allergies: ['Amoxicillin — rash'] },
    }),
    expect: [{ id: 'allergy-penicillin', severity: 'critical' }],
  },
  {
    caseId: 'NEG-01',
    category: 'Negative control — statin only',
    summary: 'A statin alone is not a dental contraindication.',
    visit: makeVisit({
      name: 'NEG-01',
      age: 58,
      chiefComplaint: 'Cleaning',
      health: { activeConditions: ['High cholesterol'], medications: ['Atorvastatin'] },
    }),
    expectNoCritical: true,
    expectAbsent: ['mronj-antiresorptive', 'bleeding-anticoagulant', 'diabetes-glycemic'],
  },
  {
    caseId: 'NEG-02',
    category: 'Negative control — non-penicillin allergy',
    summary: 'A latex allergy must not trigger the penicillin rule.',
    visit: makeVisit({
      name: 'NEG-02',
      age: 45,
      chiefComplaint: 'Cleaning',
      health: { allergies: ['Latex'] },
    }),
    expectNoCritical: true,
    expectAbsent: ['allergy-penicillin'],
  },
  {
    caseId: 'NEG-03',
    category: 'Negative control — sulfa allergy',
    summary: 'A sulfa allergy is not a penicillin-class allergy.',
    visit: makeVisit({
      name: 'NEG-03',
      age: 50,
      chiefComplaint: 'Cleaning',
      health: { allergies: ['Sulfa (sulfonamides)'] },
    }),
    expectAbsent: ['allergy-penicillin'],
  },
  {
    caseId: 'NEG-04',
    category: 'Negative control — well-controlled diabetes',
    summary: 'Diabetes with HbA1c 6.5% needs no surgical deferral.',
    visit: makeVisit({
      name: 'NEG-04',
      age: 62,
      chiefComplaint: 'Perio maintenance',
      health: { activeConditions: ['Type 2 Diabetes'], medications: ['Metformin'], labs: { hba1c: 6.5 } },
    }),
    expectNoCritical: true,
    expectAbsent: ['diabetes-glycemic'],
  },
  {
    caseId: 'NEG-05',
    category: 'Negative control — penicillin on med list, no allergy',
    summary: 'Currently taking amoxicillin without an allergy is not a contraindication.',
    visit: makeVisit({
      name: 'NEG-05',
      age: 38,
      chiefComplaint: 'Post-op check',
      health: { medications: ['Amoxicillin 500mg'], allergies: ['NKDA'] },
    }),
    expectAbsent: ['allergy-penicillin'],
  },
  {
    caseId: 'NEG-06',
    category: 'Negative control — benign polypharmacy',
    summary: 'Common chronic meds (statin, ACE inhibitor, thyroid, PPI) carry no dental contraindication.',
    visit: makeVisit({
      name: 'NEG-06',
      age: 64,
      chiefComplaint: 'Routine cleaning',
      health: {
        activeConditions: ['Hypertension', 'Hypothyroidism', 'GERD', 'High cholesterol'],
        medications: ['Lisinopril', 'Levothyroxine', 'Omeprazole', 'Atorvastatin'],
        allergies: ['NKDA'],
      },
    }),
    expectNoCritical: true,
    expectAbsent: [
      'mronj-antiresorptive', 'bleeding-anticoagulant', 'allergy-penicillin',
      'diabetes-glycemic', 'pregnancy-nsaid',
    ],
  },
  {
    caseId: 'NEG-07',
    category: 'Negative control — low-dose aspirin only',
    summary: 'Low-dose aspirin alone is not flagged as an anticoagulant bleeding risk.',
    visit: makeVisit({
      name: 'NEG-07',
      age: 59,
      chiefComplaint: 'Crown prep',
      health: { activeConditions: ['Coronary artery disease'], medications: ['Aspirin 81mg'] },
    }),
    expectNoCritical: true,
    expectAbsent: ['bleeding-anticoagulant'],
  },
];

/** Every case the loop enforces — source traps plus robustness probes. */
export const ALL_CASES: SafetyEvalCase[] = [...SAFETY_CASES, ...ROBUSTNESS_CASES];
