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
  },
  {
    "name": "seed b2-01: new-patient comprehensive, healthy adult, FMX",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-28",
        "age": 31
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "lips": "wnl",
        "tongue": "wnl",
        "gingiva": "wnl"
      },
      "toothChart": {},
      "dentitionType": "permanent",
      "perio": {
        "periodontiumType": "Periodontally Healthy",
        "bop": "None",
        "pocketDepthRange": "1–3 mm (WNL)",
        "ohStatus": "Good"
      },
      "occlusion": {
        "molarClassR": "I",
        "molarClassL": "I"
      },
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Full Mouth Series",
            "reason": "New patient comprehensive evaluation",
            "panoIndications": []
          }
        ],
        "findings": [
          "No significant findings"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0150",
          "description": "Comprehensive oral evaluation",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D1110",
          "description": "Prophylaxis - adult",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [],
      "treatmentPlan": [],
      "patientEducation": [
        "Flossing/interdental cleaning"
      ],
      "signedConsents": []
    }
  },
  {
    "name": "seed b2-02: anterior composite D2330 (self-adhesive, no etch fabrication)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 27,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "p1",
            "type": "filling",
            "tooth": "8",
            "material": "Composite",
            "surfaces": [
              "F"
            ],
            "decayDepth": "Superficial (enamel only)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 0.5,
            "anestheticTechnique": "Infiltration",
            "isolation": "Cotton rolls / DriAngle",
            "prepCleaning": "Air/water",
            "prepMethod": "Diamond bur",
            "etchType": "No etch / self-adhesive",
            "bondingAgent": "3M Scotchbond Universal Plus",
            "msdsReviewed": true,
            "hemostaticAgent": "None",
            "cureTimeSec": 20,
            "valoPowerCures": false,
            "compositeProduct": "3M Filtek Supreme",
            "base": "None",
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-03: amalgam D2150 two-surface posterior",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 58,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "p1",
            "type": "filling",
            "tooth": "31",
            "material": "Amalgam",
            "surfaces": [
              "M",
              "O"
            ],
            "decayDepth": "Moderate (into dentin)",
            "anestheticDrug": "Lidocaine 2% with 1:100,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Inferior alveolar nerve block",
            "isolation": "Rubber dam",
            "prepCleaning": "IPA (isopropyl alcohol)",
            "prepMethod": "Carbide bur",
            "matrixSystem": "Disposable Tofflemire + wooden wedge",
            "hemostaticAgent": "None",
            "desensitizers": [
              "Dycal (Ca(OH)₂)"
            ],
            "base": "RMGI base",
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-04: 3-surface posterior composite D2393",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 49,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "p1",
            "type": "filling",
            "tooth": "4",
            "material": "Composite",
            "surfaces": [
              "M",
              "O",
              "D"
            ],
            "decayDepth": "Deep (close to pulp)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Infiltration",
            "isolation": "Isolite",
            "prepCleaning": "Consepsis Scrub",
            "prepMethod": "Carbide bur",
            "etchType": "Selective etch (enamel only)",
            "etchTimeEnamel": 30,
            "bondingAgent": "Peak Universal Bond (Ultradent)",
            "msdsReviewed": true,
            "matrixSystem": "V-ring + plastic wedge",
            "hemostaticAgent": "None",
            "cureTimeSec": 20,
            "valoPowerCures": true,
            "compositeProduct": "Omnichroma packable",
            "base": "Calcium hydroxide (Dycal)",
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-05: GI sealant D1351 on child",
    "chart": {
      "visitSetup": {
        "patientType": "child",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 9,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "s1",
            "type": "sealant",
            "tooth": "19",
            "material": "GI (glass ionomer)",
            "isolation": "Cotton rolls / DriAngle",
            "fieldIsolatedDry": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general"
      ]
    }
  },
  {
    "name": "seed b2-06: crown seat (lab case delivery) D2740",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 63,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "c1",
            "type": "crown",
            "tooth": "14",
            "appointmentType": "Seat (lab case delivery)",
            "crownType": "Zirconia (monolithic)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Infiltration",
            "cementation": "Fuji Evolve RMGI cement",
            "fieldIsolatedDry": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "crown",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-07: anterior endo D3310 + build-up",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 34,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "e1",
            "type": "endo",
            "tooth": "9",
            "toothType": "Anterior",
            "isolation": "Rubber dam",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Infiltration",
            "canals": "single canal",
            "workingLength": "Apex locator confirmed with periapical radiograph",
            "irrigation": "NaOCl + EDTA",
            "obturation": "Gutta-percha, warm vertical condensation",
            "buildupPlaced": true,
            "buildupMaterial": "Composite core",
            "matrixSystem": "Mylar strip + wooden wedge",
            "cureTimeSec": 20,
            "valoPowerCures": false,
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "endo",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-08: surgical extraction D7210 with sectioning",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-28",
        "age": 41
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "pain",
        "location": "LL",
        "severity": 7,
        "character": [
          "throbbing"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "17": {
          "conditions": [
            "non-restorable caries",
            "fracture"
          ],
          "surfaces": []
        }
      },
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Panoramic",
            "reason": "Pre-extraction evaluation of impacted third molar",
            "panoIndications": []
          }
        ],
        "findings": [
          "Impacted teeth"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D7210",
          "description": "Surgical extraction - erupted tooth",
          "teeth": [
            "17"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K01.1 — Impacted teeth"
      ],
      "treatmentPlan": [],
      "patientEducation": [],
      "signedConsents": [
        "general",
        "extraction",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-09: perio maintenance D4910",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "periodic",
        "visitDate": "2026-05-28",
        "age": 60
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "conditions": [
          "Diabetes"
        ],
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "gingiva": "Localized erythema"
      },
      "toothChart": {},
      "dentitionType": "permanent",
      "perio": {
        "periodontiumType": "Periodontitis Stage III",
        "bop": "Localized (<30%)",
        "pocketDepthRange": "4–5 mm",
        "calculus": "Subgingival present",
        "ohStatus": "Fair",
        "fullChartDone": true
      },
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "BWX (4 films)",
            "reason": "Periodontal monitoring",
            "panoIndications": []
          }
        ],
        "findings": [
          "Horizontal bone loss"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D4910",
          "description": "Periodontal maintenance",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K05.321 — Chronic periodontitis generalized slight"
      ],
      "treatmentPlan": [],
      "patientEducation": [
        "Flossing/interdental cleaning"
      ],
      "signedConsents": [
        "general"
      ]
    }
  },
  {
    "name": "seed b2-10: palliative D9110 emergency, no operative",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "emergency",
        "visitDate": "2026-05-28",
        "age": 45
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "Penicillin"
        ]
      },
      "chiefComplaint": {
        "type": "pain",
        "location": "UR",
        "severity": 8,
        "character": [
          "spontaneous",
          "lingers"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "3": {
          "conditions": [
            "deep caries"
          ],
          "surfaces": [
            "O"
          ]
        }
      },
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Periapical",
            "reason": "Pain in upper-right quadrant",
            "panoIndications": []
          }
        ],
        "findings": [
          "Periapical pathology"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D9110",
          "description": "Palliative treatment",
          "teeth": [
            "3"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K04.02 — Irreversible pulpitis"
      ],
      "treatmentPlan": [
        {
          "cdtCode": "D3330",
          "description": "Endodontic therapy - molar",
          "teeth": [
            "3"
          ],
          "priority": "urgent"
        }
      ],
      "patientEducation": [],
      "signedConsents": [
        "general"
      ]
    }
  },
  {
    "name": "seed b2-11: EPSDT toddler age 2, SDF + varnish, high risk",
    "chart": {
      "visitSetup": {
        "patientType": "epsdt",
        "visitType": "comprehensive",
        "visitDate": "2026-05-28",
        "age": 2
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "epsdtScreening": {
        "developmentWNL": true,
        "waterSource": "Well/Non-fluoridated",
        "supplementalFluoride": [
          "Systemic drops/tablets"
        ],
        "cariesRisk": "high",
        "riskFactors": [
          "Active caries / cavitated lesions",
          "Sugar-sweetened / acidic beverages",
          "Inadequate fluoride exposure"
        ],
        "counselingTopics": [
          "Brushing technique",
          "Diet/sugar reduction",
          "Sippy cup/bottle use"
        ],
        "referralsNeeded": []
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "K": {
          "conditions": [
            "arrested caries"
          ],
          "surfaces": [
            "O"
          ]
        }
      },
      "dentitionType": "primary",
      "perio": {
        "pediatricVisualExam": true,
        "periodontiumType": "Periodontally Healthy",
        "ohStatus": "Fair"
      },
      "occlusion": {},
      "radiographs": {
        "none": true,
        "taken": []
      },
      "treatmentRendered": [
        {
          "cdtCode": "D1354",
          "description": "SDF application per tooth",
          "teeth": [
            "K"
          ],
          "surfaces": []
        },
        {
          "cdtCode": "D1206",
          "description": "Topical fluoride varnish",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K02.3 — Arrested caries"
      ],
      "treatmentPlan": [],
      "patientEducation": [
        "Early childhood caries prevention",
        "Bottle/sippy cup weaning"
      ],
      "signedConsents": [
        "general",
        "sdf"
      ]
    }
  },
  {
    "name": "seed b2-12: EPSDT age 11 mixed dentition, pediatric visual perio",
    "chart": {
      "visitSetup": {
        "patientType": "epsdt",
        "visitType": "periodic",
        "visitDate": "2026-05-28",
        "age": 11
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "epsdtScreening": {
        "developmentWNL": true,
        "waterSource": "Fluoridated Municipal",
        "supplementalFluoride": [
          "Fluoride toothpaste"
        ],
        "cariesRisk": "low",
        "riskFactors": [
          "Good oral hygiene",
          "Dental sealants present",
          "Fluoridated water source"
        ],
        "counselingTopics": [
          "Brushing technique",
          "Diet/sugar reduction"
        ],
        "referralsNeeded": [
          "Orthodontic evaluation"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {},
      "dentitionType": "mixed",
      "perio": {
        "pediatricVisualExam": true,
        "periodontiumType": "Periodontally Healthy",
        "ohStatus": "Good"
      },
      "occlusion": {
        "molarClassR": "II",
        "molarClassL": "II",
        "overjet": "increased"
      },
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "BWX (2 films)",
            "reason": "Recall bitewing schedule (≥6 mo since last)",
            "panoIndications": []
          }
        ],
        "findings": [
          "No significant findings"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0120",
          "description": "Periodic oral evaluation",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D1120",
          "description": "Prophylaxis - child",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [],
      "treatmentPlan": [],
      "patientEducation": [
        "Sugar-sweetened beverage reduction"
      ],
      "signedConsents": []
    }
  },
  {
    "name": "seed b2-13: limited problem-focused D0140 cracked tooth",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "limited",
        "visitDate": "2026-05-28",
        "age": 52
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "pain",
        "location": "LR",
        "severity": 5,
        "character": [
          "sharp",
          "Provoked by chewing"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "30": {
          "conditions": [
            "fracture"
          ],
          "surfaces": []
        }
      },
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Periapical",
            "reason": "Pain in lower-right quadrant",
            "panoIndications": []
          }
        ],
        "findings": [
          "No significant findings"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0140",
          "description": "Limited oral evaluation - problem focused",
          "teeth": [
            "30"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K03.81 — Cracked tooth"
      ],
      "treatmentPlan": [
        {
          "cdtCode": "D2740",
          "description": "Crown - porcelain/ceramic",
          "teeth": [
            "30"
          ],
          "priority": "soon"
        }
      ],
      "patientEducation": [],
      "signedConsents": []
    }
  },
  {
    "name": "seed b2-14: same-day CEREC crown, previously RCT tooth",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 47,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "c1",
            "type": "crown",
            "tooth": "19",
            "appointmentType": "Same-day CEREC",
            "crownType": "E.max (lithium disilicate)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Inferior alveolar nerve block",
            "cerecScanDevice": "CEREC Primescan",
            "cerecMill": "CEREC Primemill",
            "cerecCrystallization": "Programat CS / SpeedFire oven, full crystallization cycle",
            "cerecCrownMaterial": "E.max CAD",
            "vitality": "Previously RCT",
            "cementation": "RelyX Unicem (resin cement)",
            "hemostaticAgent": "ViscoStat",
            "fieldIsolatedDry": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "crown",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-15: CDT conflict — D0120 + D0150 same encounter",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-28",
        "age": 38
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {},
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": true,
        "taken": []
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0120",
          "description": "Periodic oral evaluation",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D0150",
          "description": "Comprehensive oral evaluation",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [],
      "treatmentPlan": [],
      "patientEducation": [],
      "signedConsents": []
    }
  },
  {
    "name": "seed b2-16: nitrous D9230 + child composite (comprehensive)",
    "chart": {
      "visitSetup": {
        "patientType": "child",
        "visitType": "comprehensive",
        "visitDate": "2026-05-28",
        "age": 7
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "pain",
        "location": "UR primary molar",
        "severity": 3,
        "character": [
          "cold sensitivity"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "B": {
          "conditions": [
            "caries"
          ],
          "surfaces": [
            "O"
          ]
        }
      },
      "dentitionType": "mixed",
      "perio": {
        "pediatricVisualExam": true,
        "periodontiumType": "Periodontally Healthy",
        "ohStatus": "Good"
      },
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "BWX (2 films)",
            "reason": "Suspected interproximal caries (clinical exam inconclusive)",
            "panoIndications": []
          }
        ],
        "findings": [
          "Interproximal caries"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D9230",
          "description": "Nitrous oxide / analgesia",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D2391",
          "description": "Composite - one surface, posterior",
          "teeth": [
            "B"
          ],
          "surfaces": [
            "O"
          ]
        }
      ],
      "diagnoses": [
        "K02.51 — Caries pit/fissure → enamel",
        "F40.232 — Fear of dental procedures"
      ],
      "treatmentPlan": [],
      "patientEducation": [
        "Early childhood caries prevention"
      ],
      "signedConsents": [
        "general",
        "nitrous",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-17: 4-surface posterior composite D2394 (high audit)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 55,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": true,
        "changesDetail": "started metformin 500mg BID for new type 2 diabetes diagnosis 1 month ago",
        "conditions": [
          "Diabetes"
        ],
        "allergies": [
          "NKA"
        ],
        "medications": "metformin"
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "p1",
            "type": "filling",
            "tooth": "30",
            "material": "Composite",
            "surfaces": [
              "M",
              "O",
              "D",
              "B"
            ],
            "decayDepth": "Deep (close to pulp)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1.5,
            "anestheticTechnique": "Inferior alveolar nerve block",
            "isolation": "Rubber dam",
            "prepCleaning": "Consepsis",
            "prepMethod": "Bur + air abrasion",
            "etchType": "37% phosphoric acid",
            "etchTimeEnamel": 30,
            "etchTimeDentin": 15,
            "bondingAgent": "Tokuyama Universal Bond",
            "msdsReviewed": true,
            "matrixSystem": "V-ring + plastic wedge",
            "hemostaticAgent": "None",
            "cureTimeSec": 20,
            "valoPowerCures": true,
            "compositeProduct": "Omnichroma Blocker packable",
            "base": "Flowable composite liner",
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-18: SRP two quadrants D4341",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 56,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "conditions": [
          "Hypertension"
        ],
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": []
      },
      "treatmentRendered": [
        {
          "cdtCode": "D4341",
          "description": "SRP - 4+ teeth per quadrant",
          "teeth": [
            "UR",
            "UL"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K05.322 — Chronic periodontitis generalized moderate"
      ],
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-19: stainless steel crown D2930 primary molar (EPSDT)",
    "chart": {
      "visitSetup": {
        "patientType": "epsdt",
        "visitType": "scheduled",
        "visitDate": "2026-05-28",
        "age": 6,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "c1",
            "type": "crown",
            "tooth": "T",
            "appointmentType": "Seat (lab case delivery)",
            "crownType": "Stainless steel (pediatric)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 0.5,
            "anestheticTechnique": "Infiltration",
            "cementation": "Fuji Evolve RMGI cement",
            "fieldIsolatedDry": true,
            "additionalNotes": "Primary molar with extensive caries"
          }
        ]
      },
      "signedConsents": [
        "general",
        "crown",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b2-20: recare recall, no findings, exam + prophy + varnish",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "periodic",
        "visitDate": "2026-05-28",
        "age": 42
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "lips": "wnl",
        "tongue": "wnl",
        "gingiva": "wnl"
      },
      "toothChart": {},
      "dentitionType": "permanent",
      "perio": {
        "periodontiumType": "Periodontally Healthy",
        "bop": "None",
        "pocketDepthRange": "1–3 mm (WNL)",
        "ohStatus": "Good"
      },
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "BWX (2 films)",
            "reason": "Recall bitewing schedule (≥6 mo since last)",
            "panoIndications": []
          }
        ],
        "findings": [
          "No significant findings"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0120",
          "description": "Periodic oral evaluation",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D1110",
          "description": "Prophylaxis - adult",
          "teeth": [],
          "surfaces": []
        },
        {
          "cdtCode": "D1206",
          "description": "Topical fluoride varnish",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [],
      "treatmentPlan": [],
      "patientEducation": [
        "Flossing/interdental cleaning",
        "Dietary counseling"
      ],
      "signedConsents": []
    }
  },
  {
    "name": "seed b3-08: surgical extraction D7210, ZERO signed consents (SAFETY)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-30",
        "age": 50
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "pain",
        "location": "LL",
        "severity": 8,
        "character": [
          "throbbing"
        ]
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "17": {
          "conditions": [
            "non-restorable caries"
          ],
          "surfaces": []
        }
      },
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Panoramic",
            "reason": "Pre-extraction evaluation",
            "panoIndications": []
          }
        ],
        "findings": [
          "Periapical pathology"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D7210",
          "description": "Surgical extraction - erupted tooth",
          "teeth": [
            "17"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K04.7 — Periapical abscess"
      ],
      "treatmentPlan": [],
      "patientEducation": [],
      "signedConsents": []
    }
  },
  {
    "name": "seed b3-10: self-adhesive composite WITH etch fields populated (CONTRADICTION)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-30",
        "age": 36,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "p1",
            "type": "filling",
            "tooth": "8",
            "material": "Composite",
            "surfaces": [
              "F"
            ],
            "decayDepth": "Superficial (enamel only)",
            "anestheticDrug": "None",
            "isolation": "Cotton rolls / DriAngle",
            "prepMethod": "Diamond bur",
            "etchType": "No etch / self-adhesive",
            "etchTimeEnamel": 30,
            "etchTimeDentin": 15,
            "bondingAgent": "Self-adhesive flowable (no separate bond)",
            "msdsReviewed": true,
            "cureTimeSec": 20,
            "compositeProduct": "Self-adhesive flowable",
            "fieldIsolatedDry": true,
            "occlusionAdjusted": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": [
        "general"
      ]
    }
  },
  {
    "name": "seed b3-17: ALARA catch-all pano with EMPTY reason (MISSING JUSTIFICATION)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-30",
        "age": 33
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {},
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "Panoramic",
            "reason": "ALARA exception",
            "panoIndications": [
              "alara-retake"
            ],
            "alaraCatchAllReason": ""
          }
        ],
        "findings": []
      },
      "treatmentRendered": [
        {
          "cdtCode": "D0150",
          "description": "Comprehensive oral evaluation",
          "teeth": [],
          "surfaces": []
        }
      ],
      "diagnoses": [],
      "treatmentPlan": [],
      "patientEducation": [],
      "signedConsents": []
    }
  },
  {
    "name": "seed b3-19: D2391 listed but surfaces array EMPTY (MALFORMED)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "comprehensive",
        "visitDate": "2026-05-30",
        "age": 39
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "chiefComplaint": {
        "type": "recall"
      },
      "softTissue": {
        "lips": "wnl"
      },
      "toothChart": {
        "20": {
          "conditions": [
            "caries"
          ],
          "surfaces": [
            "O"
          ]
        }
      },
      "dentitionType": "permanent",
      "perio": {},
      "occlusion": {},
      "radiographs": {
        "none": false,
        "taken": [
          {
            "type": "BWX (2 films)",
            "reason": "Recall",
            "panoIndications": []
          }
        ],
        "findings": [
          "No significant findings"
        ]
      },
      "treatmentRendered": [
        {
          "cdtCode": "D2391",
          "description": "Composite - one surface, posterior",
          "teeth": [
            "20"
          ],
          "surfaces": []
        }
      ],
      "diagnoses": [
        "K02.51 — Caries enamel"
      ],
      "treatmentPlan": [],
      "patientEducation": [],
      "signedConsents": [
        "general",
        "local_anesthesia"
      ]
    }
  },
  {
    "name": "seed b3-20: scheduled crown prep, NO consent listed at all (SAFETY)",
    "chart": {
      "visitSetup": {
        "patientType": "adult",
        "visitType": "scheduled",
        "visitDate": "2026-05-30",
        "age": 57,
        "provider": "Dr. Garner"
      },
      "medicalHistory": {
        "changesSinceLastVisit": false,
        "allergies": [
          "NKA"
        ]
      },
      "scheduledTreatment": {
        "procedures": [
          {
            "id": "c1",
            "type": "crown",
            "tooth": "14",
            "appointmentType": "Prep + temp (impression/scan)",
            "crownType": "Zirconia (monolithic)",
            "anestheticDrug": "Septocaine (articaine) 4% with 1:200,000 epi",
            "anestheticCarpules": 1,
            "anestheticTechnique": "Infiltration",
            "marginType": "Chamfer",
            "retractionMethod": "Cord (single)",
            "impressionType": "Digital scan (iTero)",
            "tempType": "Bisacryl chairside (Luxatemp)",
            "tempCement": "Temrex (eugenol-free)",
            "hemostaticAgent": "ViscoStat",
            "fieldIsolatedDry": true,
            "additionalNotes": ""
          }
        ]
      },
      "signedConsents": []
    }
  },
  {
    name: 'seed b3-01: PEN allergy + amoxicillin administered (drug-allergy conflict)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-30', age: 44, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['Penicillin (rash)'], medications: 'amoxicillin 500mg TID x 7 days (just prescribed today)' },
      scheduledTreatment: { procedures: [{
        id: 'p1', type: 'filling', tooth: '30', material: 'Composite', surfaces: ['O'],
        anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi', anestheticCarpules: 1, anestheticTechnique: 'Inferior alveolar nerve block',
        isolation: 'Rubber dam', etchType: '37% phosphoric acid', etchTimeEnamel: 15, bondingAgent: 'Peak Universal Bond (Ultradent)',
        msdsReviewed: true, cureTimeSec: 20, compositeProduct: 'Omnichroma packable', fieldIsolatedDry: true, occlusionAdjusted: true, additionalNotes: 'Rx amoxicillin written'
      }] },
      signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed b3-02: lidocaine allergy + lidocaine administered (drug-allergy conflict)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-30', age: 38, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['Lidocaine (documented anaphylaxis)'] },
      scheduledTreatment: { procedures: [{
        id: 'p1', type: 'filling', tooth: '19', material: 'Composite', surfaces: ['O'],
        anestheticDrug: 'Lidocaine 2% with 1:100,000 epi', anestheticCarpules: 2, anestheticTechnique: 'Inferior alveolar nerve block',
        isolation: 'Cotton rolls / DriAngle', etchType: '37% phosphoric acid', etchTimeEnamel: 15, bondingAgent: 'Peak Universal Bond (Ultradent)',
        msdsReviewed: true, cureTimeSec: 20, compositeProduct: 'Omnichroma packable', fieldIsolatedDry: true, occlusionAdjusted: true, additionalNotes: ''
      }] },
      signedConsents: ['general', 'local_anesthesia']
    }
  },
  {
    name: 'seed b3-NEG: lidocaine allergy + articaine (must NOT flag — different amide, low cross-reactivity)',
    chart: {
      visitSetup: { patientType: 'adult', visitType: 'scheduled', visitDate: '2026-05-30', age: 50, provider: 'Dr. Garner' },
      medicalHistory: { changesSinceLastVisit: false, allergies: ['Lidocaine'] },
      scheduledTreatment: { procedures: [{
        id: 'p1', type: 'filling', tooth: '5', material: 'Composite', surfaces: ['O'],
        anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi', anestheticCarpules: 1, anestheticTechnique: 'Infiltration',
        isolation: 'Cotton rolls / DriAngle', etchType: '37% phosphoric acid', etchTimeEnamel: 15, bondingAgent: 'Peak Universal Bond (Ultradent)',
        msdsReviewed: true, cureTimeSec: 20, compositeProduct: 'Omnichroma packable', fieldIsolatedDry: true, occlusionAdjusted: true, additionalNotes: ''
      }] },
      signedConsents: ['general', 'local_anesthesia']
    }
  },
  // Known safety-probe cases NOT promoted (see git history / batch3 for the source). These exposed silent prompt gaps that no current rubric check enforces; promoting them would either flake (no deterministic enforcement) or freeze a known failure into the seed report. Tracked as TODOs:
  //   b3-04 — pregnancy + radiograph: no thyroid-collar/2nd-trimester rule
  //   b3-05 — bisphosphonate + extraction: no MRONJ-flag rule
  //   b3-06 — anticoagulant + extraction: no INR documentation rule
  //   b3-09 — same-tooth CDT conflict (D7140+D7210): note transcribes both; client-side Audit catches it but the note does not flag
  //   b3-11/12 — tooth/dentition mismatch not flagged
  //   b3-13 — same-day CEREC with missing scan/mill/crystallization fields (graceful but unflagged)
  //   b3-14 — endo without rubber dam: endo_protocol check correctly fails; promoting would freeze a red seed
  //   b3-15 — EPSDT screening blank (caries risk omitted) — prompt fills with placeholder; no enforcement
  //   b3-16 — GI sealant with phosphoric-etch fields populated: handled OK by current prompt, but not deterministically guarded
  //   b3-18 — polypharmacy + sedation without ASA assessment: no prompt rule
]
