// =============================================================================
// Clinical Safety Eval — Jest regression suite
// Mirrors evals/run-safety-evals.mts so the learning-loop cases are enforced by
// `npm test` / CI. Add new cases to __fixtures__/clinicalSafetyCases.ts.
// =============================================================================

import { detectContraindications, highestSeverity } from './contraindicationEngine';
import { SAFETY_CASES } from './__fixtures__/clinicalSafetyCases';
import type { Visit, HealthHistory, Procedure } from '../types/visit';

function visit(health: Partial<HealthHistory>, procedures: Procedure[] = []): Visit {
  return {
    id: 'v',
    patient: { name: 't', dob: '', age: 40, payer: 'Self-Pay', payerGroup: 'self-pay' },
    visitInfo: { dos: '2026-06-16', provider: 'Dr. Chad Gardner', chiefComplaint: '', guardianPresent: false },
    procedures,
    diagnoses: [],
    radiographs: [],
    clinicalFindings: { cariesRisk: 'moderate' },
    healthHistory: { riskFlags: [], activeConditions: [], ...health },
    consent: [],
    anesthesia: [],
    outcome: { text: '', followup: [], postOpMethod: 'verbal', postOpInstructions: '' },
  };
}

const extraction = (): Procedure => ({ id: 'p', cdt: 'D7140', tooth: 30, surfaces: [], icd10: '', procFields: {} });

describe('clinical safety eval cases', () => {
  it.each(SAFETY_CASES.map(c => [c.caseId, c] as const))(
    '%s surfaces the expected contraindication',
    (caseId, c) => {
      expect(c.caseId).toBe(caseId);
      const alerts = detectContraindications(c.visit);
      for (const expected of c.expect) {
        const got = alerts.find(a => a.id === expected.id);
        expect(got).toBeDefined();
        expect(got!.severity).toBe(expected.severity);
      }
    }
  );

  it('flags every trap case at critical severity', () => {
    for (const c of SAFETY_CASES) {
      expect(highestSeverity(detectContraindications(c.visit))).toBe('critical');
    }
  });
});

describe('contraindication engine — behavior', () => {
  it('detects bisphosphonates by brand name', () => {
    const alerts = detectContraindications(visit({ medications: ['Fosamax'] }));
    expect(alerts.some(a => a.id === 'mronj-antiresorptive' && a.severity === 'critical')).toBe(true);
  });

  it('escalates anticoagulant to critical only when INR is supratherapeutic', () => {
    const warnOnly = detectContraindications(visit({ medications: ['Warfarin'] }, [extraction()]));
    expect(warnOnly.find(a => a.id === 'bleeding-anticoagulant')!.severity).toBe('warning');

    const critical = detectContraindications(visit({ medications: ['Warfarin'], labs: { inr: 3.8 } }, [extraction()]));
    expect(critical.find(a => a.id === 'bleeding-anticoagulant')!.severity).toBe('critical');
  });

  it('does not flag well-controlled diabetes as critical', () => {
    const alerts = detectContraindications(visit({ activeConditions: ['Type 2 Diabetes'], labs: { hba1c: 6.5 } }));
    expect(alerts.some(a => a.severity === 'critical')).toBe(false);
  });

  it('treats first-trimester pregnancy as a warning, third as critical', () => {
    expect(detectContraindications(visit({ pregnancyTrimester: 1 })).find(a => a.id === 'pregnancy-nsaid')!.severity).toBe('warning');
    expect(detectContraindications(visit({ pregnancyTrimester: 3 })).find(a => a.id === 'pregnancy-nsaid')!.severity).toBe('critical');
  });

  it('returns no alerts for an unremarkable history', () => {
    expect(detectContraindications(visit({ medications: ['Lisinopril'], allergies: ['Latex'] }))).toHaveLength(0);
  });
});
