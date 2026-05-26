// Curated seed cases. These pin down the behaviors we've deliberately built.
// The synthetic generator adds breadth on top of this regression core.

export const SEED_CASES = [
  {
    name: 'seed: exam-only D0150 (no post-op, no consent)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'comprehensive', visitDate: '2026-05-24', age: 35 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'recall' },
      softTissue: { lips: 'wnl' },
      toothChart: {}, dentitionType: 'permanent', perio: {}, occlusion: {},
      radiographs: { none: true, taken: [] },
      treatmentRendered: [{ cdtCode: 'D0150', description: 'Comprehensive oral evaluation', teeth: [], surfaces: [] }],
      diagnoses: [], treatmentPlan: [], patientEducation: [], signedConsents: []
    }
  },
  {
    name: 'seed: posterior composite D2392 (necessity + consent + closing block)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'comprehensive', visitDate: '2026-05-24', age: 41 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'pain', location: 'LR quadrant', severity: 4, character: ['sharp'] },
      softTissue: { lips: 'wnl' },
      toothChart: { 19: { conditions: ['caries'], surfaces: ['M', 'O'] } },
      dentitionType: 'permanent', perio: {}, occlusion: {},
      radiographs: { none: false, taken: [{ type: 'BWX (2 films)', reason: 'High caries risk', panoIndications: [] }], findings: ['Interproximal caries'] },
      treatmentRendered: [{ cdtCode: 'D2392', description: 'Composite - two surfaces, posterior', teeth: ['19'], surfaces: ['M', 'O'] }],
      diagnoses: ['K02.52 — Caries pit/fissure → dentin'],
      treatmentPlan: [], patientEducation: ['Brushing'], signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed: crown D2740 (closing block: occlusion+risks+prognosis)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'comprehensive', visitDate: '2026-05-24', age: 55 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'followup', location: 'UR' },
      softTissue: { lips: 'wnl' },
      toothChart: { 3: { conditions: ['fractured cusp'], surfaces: ['MOD'] } },
      dentitionType: 'permanent', perio: {}, occlusion: {},
      radiographs: { none: true, taken: [] },
      treatmentRendered: [{ cdtCode: 'D2740', description: 'Crown - porcelain/ceramic', teeth: ['3'], surfaces: [] }],
      diagnoses: ['K03.81 — Cracked tooth'],
      treatmentPlan: [], patientEducation: [], signedConsents: ['general', 'crown', 'local_anesthesia']
    }
  },
  {
    name: 'seed: extraction D7140 (post-op, no closing block)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'comprehensive', visitDate: '2026-05-24', age: 40 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'pain', location: 'UL', severity: 6, character: ['sharp'] },
      softTissue: { lips: 'wnl' },
      toothChart: { 14: { conditions: ['non-restorable caries'], surfaces: [] } },
      dentitionType: 'permanent', perio: {}, occlusion: {},
      radiographs: { none: false, taken: [{ type: 'Periapical', reason: 'Pre-extraction evaluation', panoIndications: [] }] },
      treatmentRendered: [{ cdtCode: 'D7140', description: 'Extraction, erupted tooth', teeth: ['14'], surfaces: [] }],
      diagnoses: ['K02.9 — Dental caries'],
      treatmentPlan: [], patientEducation: [], signedConsents: ['general', 'extraction', 'local_anesthesia']
    }
  },
  {
    name: 'seed: EPSDT child age 7 (pediatric visual perio + caries risk)',
    chart: {
      visitSetup: { patientType: 'epsdt', visitType: 'comprehensive', visitDate: '2026-05-24', age: 7 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'recall' },
      epsdtScreening: {
        developmentWNL: true, waterSource: 'Fluoridated Municipal', supplementalFluoride: ['Fluoride toothpaste'],
        cariesRisk: 'moderate',
        riskFactors: ['White spot lesions / early demineralization', 'Frequent snacking between meals', 'Good oral hygiene'],
        counselingTopics: ['Brushing technique', 'Diet/sugar reduction'], referralsNeeded: []
      },
      softTissue: { lips: 'wnl' },
      toothChart: {}, dentitionType: 'mixed',
      perio: { pediatricVisualExam: true, periodontiumType: 'Periodontally Healthy', ohStatus: 'Good' },
      occlusion: {}, radiographs: { none: true, taken: [] },
      treatmentRendered: [{ cdtCode: 'D0150', description: 'Comprehensive oral evaluation', teeth: [], surfaces: [] }],
      diagnoses: [], treatmentPlan: [],
      patientEducation: ['Toothbrushing technique (caregiver-assisted if young)', 'Dietary counseling', 'Low pH + sugar effects of drinks explained'],
      signedConsents: []
    }
  },
  {
    name: 'seed: pediatric pano ALARA catch-all',
    chart: {
      visitSetup: { patientType: 'epsdt', visitType: 'comprehensive', visitDate: '2026-05-24', age: 4 },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      chiefComplaint: { type: 'recall' },
      epsdtScreening: { developmentWNL: true, cariesRisk: 'high', counselingTopics: ['Brushing technique'] },
      softTissue: { lips: 'wnl' }, toothChart: {}, dentitionType: 'primary',
      perio: { pediatricVisualExam: true, periodontiumType: 'Periodontally Healthy', ohStatus: 'Fair' },
      occlusion: {},
      radiographs: { none: false, taken: [{ type: 'Panoramic', reason: 'behavior', panoIndications: ['alara-retake'], alaraCatchAllReason: 'evaluate developing dentition and rule out pathology' }], findings: [] },
      treatmentRendered: [{ cdtCode: 'D0150', description: 'Comprehensive oral evaluation', teeth: [], surfaces: [] }, { cdtCode: 'D1206', description: 'Fluoride varnish', teeth: [], surfaces: [] }],
      diagnoses: [], treatmentPlan: [], patientEducation: ['Early childhood caries prevention'], signedConsents: ['general']
    }
  },
  {
    name: 'seed: scheduled filling visit (interim med-hx change + post-op)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-24', age: 62, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: true, changesDetail: 'started apixaban 5 mg BID 2 weeks ago for new atrial fibrillation' },
      scheduledTreatment: {
        procedures: [{
          id: 'p1', type: 'filling', tooth: '30', material: 'Composite', surfaces: ['O'],
          decayDepth: 'Moderate (into dentin)', anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
          anestheticCarpules: 1, anestheticTechnique: 'Infiltration', isolation: 'Cotton rolls and dryangle',
          prepMethod: 'Carbide bur', etchType: '37% phosphoric acid', etchTimeEnamel: 15, etchTimeDentin: 30,
          bondingAgent: 'Peak Universal Bond (Ultradent)', msdsReviewed: true, cureTimeSec: 20,
          compositeProduct: 'Omnichroma packable', base: 'Flowable composite liner', occlusionAdjusted: true, additionalNotes: ''
        }]
      },
      signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed: SRP D4341 (necessity, perio findings)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'comprehensive', visitDate: '2026-05-24', age: 58 },
      medicalHistory: { changesSinceLastVisit: false, conditions: ['Diabetes'], allergies: ['NKA'] },
      chiefComplaint: { type: 'recall' },
      softTissue: { gingiva: 'Generalized erythema' },
      toothChart: {}, dentitionType: 'permanent',
      perio: { periodontiumType: 'Periodontitis Stage II', bop: 'Generalized (≥30%)', pocketDepthRange: '4–5 mm', calculus: 'Subgingival present', ohStatus: 'Fair', fullChartDone: true },
      occlusion: {},
      radiographs: { none: false, taken: [{ type: 'BWX (4 films)', reason: 'Periodontal evaluation', panoIndications: [] }], findings: ['Horizontal bone loss', 'Calculus deposits'] },
      treatmentRendered: [{ cdtCode: 'D4341', description: 'SRP - 4+ teeth per quadrant', teeth: ['UR'], surfaces: [] }],
      diagnoses: ['K05.321 — Chronic periodontitis generalized slight'],
      treatmentPlan: [{ cdtCode: 'D4910', description: 'Periodontal maintenance', priority: 'soon' }],
      patientEducation: ['Flossing/interdental cleaning'], signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed: scheduled MO composite (interproximal contact + matrix + VALO)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-24', age: 44, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      scheduledTreatment: {
        procedures: [{
          id: 'p1', type: 'filling', tooth: '19', material: 'Composite', surfaces: ['M', 'O'],
          decayDepth: 'Moderate (into dentin)', anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
          anestheticCarpules: 1, anestheticTechnique: 'Infiltration',
          isolation: 'Isolite', prepCleaning: 'Consepsis Scrub', prepMethod: 'Carbide bur',
          etchType: '37% phosphoric acid', etchTimeEnamel: 30, etchTimeDentin: 15,
          bondingAgent: 'Peak Universal Bond (Ultradent)', msdsReviewed: true,
          matrixSystem: 'V-ring + plastic wedge', hemostaticAgent: 'None',
          cureTimeSec: 20, valoPowerCures: true, compositeProduct: 'Omnichroma packable',
          base: 'Flowable composite liner', fieldIsolatedDry: true, occlusionAdjusted: true, additionalNotes: ''
        }]
      },
      signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed: scheduled molar endo + build-up (isolation, working length, obturation, matrix)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-24', age: 52, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['NKA'] },
      scheduledTreatment: {
        procedures: [{
          id: 'e1', type: 'endo', tooth: '30', toothType: 'Molar', isolation: 'Rubber dam',
          anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi', anestheticCarpules: 2, anestheticTechnique: 'Inferior alveolar nerve block',
          canals: 'MB, ML, DB, DL (4)', workingLength: 'Apex locator confirmed with periapical radiograph',
          irrigation: 'NaOCl + EDTA', obturation: 'Single-cone with bioceramic sealer',
          buildupPlaced: true, buildupMaterial: 'Composite core', matrixSystem: 'V-ring + plastic wedge',
          cureTimeSec: 20, valoPowerCures: false, fieldIsolatedDry: true, occlusionAdjusted: true, additionalNotes: ''
        }]
      },
      signedConsents: ['general', 'endo', 'local_anesthesia']
    }
  }
]
