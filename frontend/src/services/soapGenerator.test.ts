import { generateSOAPNote } from './soapGenerator';
import { SAFETY_CASES } from './__fixtures__/clinicalSafetyCases';
import type { Visit } from '../types/visit';

function visitWithComposite(): Visit {
  return {
    id: 'v',
    patient: { name: 't', dob: '', age: 40, payer: 'Self-Pay', payerGroup: 'self-pay' },
    visitInfo: { dos: '2026-06-16', provider: 'Dr. Chad Gardner', chiefComplaint: '', guardianPresent: false },
    procedures: [{ id: 'p', cdt: 'D2391', tooth: 3, surfaces: ['O'], icd10: 'K02.51', procFields: {} }],
    diagnoses: [],
    radiographs: [],
    clinicalFindings: { cariesRisk: 'moderate', cariesDepth: 'dentin' },
    healthHistory: { riskFlags: [], activeConditions: [] },
    consent: [],
    anesthesia: [],
    outcome: { text: '', followup: [], postOpMethod: 'verbal', postOpInstructions: '' },
  };
}

describe('soapGenerator — subjective records safety-relevant facts', () => {
  it('documents medications and allergies entered in health history', () => {
    const syn001 = SAFETY_CASES.find(c => c.caseId === 'SYN-001')!;
    const note = generateSOAPNote(syn001.visit);
    expect(note.subjective).toMatch(/Current medications:.*Fosamax/);
    expect(note.subjective).toMatch(/Allergies:.*NKDA/);
  });

  it('omits the allergy line when none are recorded', () => {
    const syn004 = SAFETY_CASES.find(c => c.caseId === 'SYN-004')!; // meds but no allergies
    const note = generateSOAPNote(syn004.visit);
    expect(note.subjective).toContain('Current medications: Metformin.');
    expect(note.subjective).not.toContain('Allergies:');
  });

  it('uses the "Pt" abbreviation in procedure narratives', () => {
    const note = generateSOAPNote(visitWithComposite());
    expect(note.plan).toContain('Pt tolerated well');
    expect(note.plan).not.toContain('Patient tolerated');
  });
});
