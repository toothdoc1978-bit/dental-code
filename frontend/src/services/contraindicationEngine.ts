// =============================================================================
// Clinical Safety / Contraindication Engine
// -----------------------------------------------------------------------------
// Surfaces medical-safety contraindications by connecting the patient's health
// history (medications, allergies, conditions, labs, pregnancy) to the planned
// treatment. This is the medical-safety counterpart to auditEngine.ts, which
// only covers billing/claim compliance.
//
// The rule set is grown via a "look at the data" learning loop: real cases are
// encoded as evals in __fixtures__/clinicalSafetyCases.ts; when a case the app
// should have caught slips through, a rule is added here and the eval re-run.
// =============================================================================

import type { Visit, Procedure, ContraindicationAlert } from '../types/visit';

// -- Drug / condition vocabularies (lowercase substrings) ---------------------
// Brand and generic names so detection works regardless of how the clinician
// typed the medication.

const ANTIRESORPTIVE = [
  'alendronate', 'fosamax', 'risedronate', 'actonel', 'ibandronate', 'boniva',
  'zoledronic', 'reclast', 'zometa', 'pamidronate', 'aredia', 'bisphosphonate',
  'denosumab', 'prolia', 'xgeva', // RANK-L inhibitors carry the same MRONJ risk
];

const ANTICOAGULANT = [
  'warfarin', 'coumadin', 'jantoven',
  'apixaban', 'eliquis', 'rivaroxaban', 'xarelto', 'dabigatran', 'pradaxa',
  'edoxaban', 'savaysa', 'enoxaparin', 'lovenox', 'heparin',
];

const ANTIPLATELET = ['clopidogrel', 'plavix', 'ticagrelor', 'brilinta', 'prasugrel', 'effient'];

const BLEEDING_DISORDER = ['bleeding disorder', 'hemophilia', 'thrombocytopenia', 'von willebrand'];

const PENICILLIN = ['penicillin', 'amoxicillin', 'amoxil', 'augmentin', 'ampicillin', 'cillin'];

const NSAID = ['ibuprofen', 'advil', 'motrin', 'naproxen', 'aleve', 'ketorolac', 'toradol', 'aspirin', 'diclofenac', 'nsaid'];

const DIABETES = ['diabet']; // matches "diabetes" / "diabetic"

const PREGNANCY = ['pregnan']; // matches "pregnant" / "pregnancy"

// -- Helpers ------------------------------------------------------------------

/** Return the source strings that contain any of the given lowercase needles. */
function matches(sources: string[], needles: string[]): string[] {
  const hits: string[] = [];
  for (const source of sources) {
    const s = source.toLowerCase();
    if (needles.some(n => s.includes(n))) hits.push(source);
  }
  return hits;
}

/** Oral & maxillofacial surgery family (extractions, surgical procedures) + implant placement. */
function isOralSurgery(cdt: string): boolean {
  return /^D7\d{3}$/.test(cdt) || cdt === 'D6010';
}

const PERIO_SURGERY = new Set([
  'D4240', 'D4241', 'D4260', 'D4261', 'D4263', 'D4264', 'D4265',
  'D4270', 'D4273', 'D4275', 'D4277', 'D4278', 'D4283', 'D4285',
]);

function isInvasive(p: Procedure): boolean {
  return isOralSurgery(p.cdt) || PERIO_SURGERY.has(p.cdt);
}

// -- Engine -------------------------------------------------------------------

export function detectContraindications(visit: Visit): ContraindicationAlert[] {
  const hh = visit.healthHistory;
  const meds = hh.medications ?? [];
  const allergies = hh.allergies ?? [];
  const conditions = hh.activeConditions ?? [];
  const flags = hh.riskFlags ?? [];
  const labs = hh.labs ?? {};
  const procedures = visit.procedures ?? [];

  const medsAndFlags = [...meds, ...flags];
  const alerts: ContraindicationAlert[] = [];

  // -- Rule 1: MRONJ / antiresorptive therapy --------------------------------
  const antiresorptive = matches(medsAndFlags, ANTIRESORPTIVE);
  if (antiresorptive.length > 0) {
    const surgery = procedures.filter(p => isOralSurgery(p.cdt));
    const planned = surgery.length > 0;
    alerts.push({
      id: 'mronj-antiresorptive',
      severity: 'critical',
      category: 'MRONJ Risk',
      title: 'Antiresorptive therapy — osteonecrosis (MRONJ) risk',
      detail:
        `Patient is on antiresorptive therapy (${antiresorptive.join(', ')}). ` +
        (planned
          ? `A surgical/extraction procedure is planned (${surgery.map(p => p.cdt).join(', ')}). `
          : '') +
        'Invasive procedures involving bone carry a risk of medication-related osteonecrosis of the jaw.',
      recommendation:
        'Avoid elective surgical extraction. Favor tooth-preserving treatment (e.g., endodontic therapy / decoronation). ' +
        'If extraction is unavoidable, obtain MRONJ-specific informed consent and consider oral-surgery referral.',
      triggers: antiresorptive,
    });
  }

  // -- Rule 2: Anticoagulant / bleeding risk ---------------------------------
  const anticoag = matches(medsAndFlags, ANTICOAGULANT);
  const antiplatelet = matches(medsAndFlags, ANTIPLATELET);
  const bleedingDisorder = matches([...flags, ...conditions], BLEEDING_DISORDER);
  if (anticoag.length > 0 || antiplatelet.length > 0 || bleedingDisorder.length > 0) {
    const surgery = procedures.filter(isInvasive);
    const inr = labs.inr;
    const sources = [...anticoag, ...antiplatelet, ...bleedingDisorder];
    const triggers = [...sources, ...(inr !== undefined ? [`INR ${inr}`] : [])];

    let severity: ContraindicationAlert['severity'];
    let detail: string;
    let recommendation: string;

    if (anticoag.length > 0 && inr !== undefined && inr >= 3.5) {
      severity = 'critical';
      detail =
        `INR is supratherapeutic at ${inr} on anticoagulant therapy (${anticoag.join(', ')}). ` +
        'Extractions or surgery today carry a severe bleeding risk.';
      recommendation =
        'Do not perform extractions or oral surgery today. Obtain physician consult to address the elevated INR; ' +
        'if treatment is urgent, coordinate INR correction and use local hemostatic measures (sutures, oxidized cellulose, tranexamic acid rinse).';
    } else if (surgery.length > 0) {
      severity = inr !== undefined && inr >= 3.0 ? 'critical' : 'warning';
      detail =
        `Invasive procedure planned (${surgery.map(p => p.cdt).join(', ')}) for a patient on ${sources.join(', ')}. ` +
        (inr !== undefined ? `Most recent INR ${inr}.` : 'No recent INR on file.');
      recommendation =
        anticoag.length > 0 && inr === undefined
          ? 'Obtain an INR within 24h before any extraction. Plan local hemostatic measures. Do not interrupt anticoagulation without physician guidance.'
          : 'Proceed only with INR in an acceptable range (generally ≤3.0–3.5) and local hemostatic measures in place.';
    } else {
      severity = 'warning';
      detail = `Patient on anticoagulant/antiplatelet therapy or has a bleeding disorder (${sources.join(', ')}).` +
        (inr !== undefined ? ` INR ${inr}.` : '');
      recommendation =
        'Verify a recent INR (if on warfarin) and plan local hemostatic measures before any invasive procedure.';
    }

    alerts.push({
      id: 'bleeding-anticoagulant',
      severity,
      category: 'Bleeding Risk',
      title: 'Anticoagulant / bleeding risk',
      detail,
      recommendation,
      triggers,
    });
  }

  // -- Rule 3: Penicillin-class allergy --------------------------------------
  const pcnAllergy = matches(allergies, PENICILLIN);
  if (pcnAllergy.length > 0) {
    // Catch an active prescribing conflict if a penicillin-class drug is also listed.
    const pcnOnMedList = matches(meds, PENICILLIN);
    alerts.push({
      id: 'allergy-penicillin',
      severity: 'critical',
      category: 'Drug Allergy',
      title: 'Penicillin-class allergy',
      detail:
        `Documented penicillin-class allergy (${pcnAllergy.join(', ')}). ` +
        'Amoxicillin, ampicillin, and Augmentin are contraindicated.' +
        (pcnOnMedList.length > 0 ? ` A penicillin-class medication is currently listed (${pcnOnMedList.join(', ')}) — verify immediately.` : ''),
      recommendation:
        'Do NOT prescribe penicillin/amoxicillin derivatives. If a systemic antibiotic is indicated, use clindamycin or azithromycin (confirm no cross-allergy).',
      triggers: pcnAllergy,
    });
  }

  // -- Rule 4: Uncontrolled diabetes (impaired healing) ----------------------
  const diabetes = matches([...conditions, ...flags], DIABETES);
  if (diabetes.length > 0) {
    const hba1c = labs.hba1c;
    if (hba1c !== undefined && hba1c >= 8.0) {
      const critical = hba1c >= 9.0;
      alerts.push({
        id: 'diabetes-glycemic',
        severity: critical ? 'critical' : 'warning',
        category: 'Glycemic Control',
        title: 'Uncontrolled diabetes — impaired healing / infection risk',
        detail:
          `HbA1c is ${hba1c}% (${critical ? 'poorly controlled' : 'above target'}). ` +
          'Impaired wound healing and elevated infection risk compromise surgical and periodontal outcomes.',
        recommendation:
          'Defer extensive elective periodontal/surgical treatment until glycemic control improves (target HbA1c <8%). ' +
          'Coordinate with the primary care physician; reinforce infection-control measures.',
        triggers: [...diabetes, `HbA1c ${hba1c}%`],
      });
    } else if (hba1c === undefined) {
      alerts.push({
        id: 'diabetes-no-hba1c',
        severity: 'info',
        category: 'Glycemic Control',
        title: 'Diabetes — recent HbA1c not on file',
        detail: `Diabetes documented (${diabetes.join(', ')}) without a recent HbA1c value.`,
        recommendation: 'Obtain a recent HbA1c before extensive surgical or periodontal treatment to gauge healing risk.',
        triggers: diabetes,
      });
    }
  }

  // -- Rule 5: Pregnancy — medication & treatment timing ---------------------
  const pregnantByFlag = matches([...flags, ...conditions], PREGNANCY);
  const trimester = hh.pregnancyTrimester;
  if (trimester !== undefined || pregnantByFlag.length > 0) {
    const nsaidMeds = matches(meds, NSAID);
    const triBadge = trimester ? `trimester ${trimester}` : 'pregnancy';
    const triggers = [...(pregnantByFlag.length ? pregnantByFlag : ['Pregnancy']), ...(trimester ? [`trimester ${trimester}`] : []), ...nsaidMeds];
    if (trimester === 3) {
      alerts.push({
        id: 'pregnancy-nsaid',
        severity: 'critical',
        category: 'Pregnancy — Medication',
        title: 'NSAIDs contraindicated in the third trimester',
        detail:
          `Patient is pregnant (${triBadge}). NSAIDs (ibuprofen/Advil, naproxen, aspirin) are contraindicated in the third trimester ` +
          'due to risk of premature closure of the ductus arteriosus.' +
          (nsaidMeds.length > 0 ? ` An NSAID is currently listed/recommended (${nsaidMeds.join(', ')}).` : ''),
        recommendation:
          'Do NOT recommend ibuprofen/NSAIDs. Use acetaminophen for analgesia. Coordinate analgesic choices with the patient’s OB provider.',
        triggers,
      });
    } else {
      alerts.push({
        id: 'pregnancy-nsaid',
        severity: 'warning',
        category: 'Pregnancy — Medication',
        title: 'Pregnancy — review medications and treatment timing',
        detail:
          `Patient is pregnant (${triBadge}). NSAIDs are best avoided (contraindicated in the third trimester) and elective care is ideally timed to the second trimester.` +
          (nsaidMeds.length > 0 ? ` An NSAID is currently listed/recommended (${nsaidMeds.join(', ')}).` : ''),
        recommendation:
          'Prefer acetaminophen for analgesia. Limit elective treatment and radiographs; coordinate with the OB provider as needed.',
        triggers,
      });
    }
  }

  return sortBySeverity(alerts);
}

const SEVERITY_RANK: Record<ContraindicationAlert['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function sortBySeverity(alerts: ContraindicationAlert[]): ContraindicationAlert[] {
  return [...alerts].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

/** Convenience: highest severity present, for badge/summary use. */
export function highestSeverity(alerts: ContraindicationAlert[]): ContraindicationAlert['severity'] | null {
  if (alerts.length === 0) return null;
  return alerts.reduce<ContraindicationAlert['severity']>(
    (worst, a) => (SEVERITY_RANK[a.severity] < SEVERITY_RANK[worst] ? a.severity : worst),
    'info'
  );
}
