import { v4 as uuidv4 } from 'uuid';
import { Visit } from '../types/visit';

export function createDefaultVisit(): Visit {
  return {
    id: uuidv4(),
    patient: {
      name: '',
      dob: '',
      age: 0,
      payer: 'MCNA',
      payerGroup: 'medicaid',
    },
    visitInfo: {
      dos: new Date().toISOString().split('T')[0],
      provider: 'Dr. Chad Gardner',
      chiefComplaint: '',
      guardianPresent: false,
    },
    procedures: [],
    diagnoses: [],
    radiographs: [],
    clinicalFindings: {
      cariesRisk: 'moderate',
    },
    healthHistory: {
      riskFlags: [],
      activeConditions: [],
      medications: [],
      allergies: [],
      labs: {},
    },
    consent: [],
    anesthesia: [],
    outcome: {
      text: '',
      followup: [],
      postOpMethod: 'verbal',
      postOpInstructions: '',
    },
  };
}
