// =============================================================================
// Clinical Safety Eval — Jest regression suite
// Mirrors evals/run-safety-evals.mts so the learning-loop cases are enforced by
// `npm test` / CI. Add new cases to __fixtures__/clinicalSafetyCases.ts.
// =============================================================================

import { detectContraindications, highestSeverity } from './contraindicationEngine';
import { SAFETY_CASES, ALL_CASES } from './__fixtures__/clinicalSafetyCases';
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
  it.each(ALL_CASES.map(c => [c.caseId, c] as const))(
    '%s matches its expected contraindications',
    (caseId, c) => {
      expect(c.caseId).toBe(caseId);
      const alerts = detectContraindications(c.visit);
      const byId = new Map(alerts.map(a => [a.id, a]));

      for (const expected of c.expect ?? []) {
        const got = byId.get(expected.id);
        expect(got).toBeDefined();
        expect(got!.severity).toBe(expected.severity);
      }
      for (const absentId of c.expectAbsent ?? []) {
        expect(byId.has(absentId)).toBe(false);
      }
      if (c.expectNoCritical) {
        expect(alerts.some(a => a.severity === 'critical')).toBe(false);
      }
    }
  );

  it('flags every source trap case at critical severity', () => {
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

  it('does not tell DOAC patients to obtain an INR', () => {
    const doac = detectContraindications(visit({ medications: ['Eliquis (apixaban)'] }, [extraction()]));
    const rec = doac.find(a => a.id === 'bleeding-anticoagulant')!.recommendation.toLowerCase();
    expect(rec).toContain('not monitored by inr');
    expect(rec).not.toContain('obtain an inr');
  });

  it('keeps therapeutic warfarin (INR < 3.5) with surgery at warning, not critical', () => {
    const alerts = detectContraindications(visit({ medications: ['Warfarin'], labs: { inr: 3.2 } }, [extraction()]));
    expect(alerts.find(a => a.id === 'bleeding-anticoagulant')!.severity).toBe('warning');
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
