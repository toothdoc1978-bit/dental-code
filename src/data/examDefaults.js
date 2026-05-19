export const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Cardiovascular Disease',
  'Bleeding Disorder',
  'Thyroid Disorder',
  'Asthma/COPD',
  'Liver Disease',
  'Kidney Disease',
  'Immunocompromised',
  'Pregnancy',
  'Cancer/Chemotherapy',
  'Seizure Disorder',
  'Psychiatric Disorder',
  'HIV/AIDS',
  'Hepatitis',
  'Bisphosphonates/Osteoporosis'
]

export const ALLERGY_OPTIONS = [
  'Penicillin',
  'Amoxicillin',
  'Cephalosporins',
  'NSAIDs',
  'Aspirin',
  'Latex',
  'Local Anesthetic',
  'Codeine/Opioids',
  'Sulfa'
]

export const CC_TYPES = [
  { value: 'recall', label: 'Routine Recall/Preventive' },
  { value: 'pain', label: 'Pain/Discomfort' },
  { value: 'followup', label: 'Follow-up from Previous Treatment' },
  { value: 'emergency', label: 'Emergency Visit' },
  { value: 'cosmetic', label: 'Cosmetic Concern' },
  { value: 'other', label: 'Other' }
]

export const PAIN_CHARACTER = [
  'Sharp',
  'Dull/Aching',
  'Throbbing',
  'Pressure',
  'Cold sensitivity',
  'Heat sensitivity',
  'Spontaneous',
  'Lingers',
  'Provoked by chewing'
]

export const SOFT_TISSUE_AREAS = [
  { key: 'lips', label: 'Lips', findings: ['Cheilitis', 'Herpes labialis', 'Swelling', 'Ulceration'] },
  { key: 'buccalMucosa', label: 'Buccal Mucosa', findings: ['Linea alba (normal variant)', 'Ulceration', 'Leukoplakia', 'Erythema'] },
  { key: 'hardPalate', label: 'Hard Palate', findings: ['Torus palatinus', 'Ulceration', 'Petechiae'] },
  { key: 'softPalate', label: 'Soft Palate', findings: ['Erythema', 'Petechiae', 'Asymmetry'] },
  { key: 'tongue', label: 'Tongue', findings: ['Coated', 'Geographic tongue', 'Fissured', 'Ulceration', 'Macroglossia'] },
  { key: 'floorOfMouth', label: 'Floor of Mouth', findings: ['Ranula', 'Ulceration', 'Varicosities'] },
  { key: 'gingiva', label: 'Gingiva', findings: ['Generalized erythema', 'Localized erythema', 'Swelling/edema', 'Recession', 'Hyperplasia'] },
  { key: 'oropharynx', label: 'Oropharynx', findings: ['Erythema', 'Tonsillar enlargement', 'Exudate'] },
  { key: 'lymphNodes', label: 'Lymph Nodes', findings: ['Palpable cervical', 'Palpable submandibular', 'Tender on palpation'] },
  { key: 'tmj', label: 'TMJ', findings: ['Clicking', 'Crepitus', 'Limited opening', 'Tenderness on palpation', 'Deviation on opening'] }
]

export const TOOTH_CONDITIONS = [
  'Caries',
  'Existing amalgam',
  'Existing composite',
  'Crown',
  'Missing',
  'Implant',
  'Sealant present',
  'Fracture',
  'Root canal treated',
  'Periapical pathology',
  'Mobility',
  'Unerupted/partially erupted',
  'Watch/monitor'
]

export const TOOTH_SURFACES = ['M', 'O/I', 'D', 'B/F', 'L/P']

export const PERIO_CLASSIFICATION = [
  'Periodontally Healthy',
  'Gingivitis - Plaque Induced',
  'Periodontitis Stage I',
  'Periodontitis Stage II',
  'Periodontitis Stage III',
  'Periodontitis Stage IV'
]

export const OCCLUSION_HABITS = [
  'Bruxism/clenching',
  'Thumb/digit sucking',
  'Pacifier use',
  'Lip/cheek biting',
  'Mouth breathing',
  'Tongue thrust',
  'Nail biting'
]

export const RADIOGRAPH_TYPES = [
  'BWX (2 films)',
  'BWX (4 films)',
  'Periapical',
  'Panoramic',
  'Full Mouth Series',
  'CBCT',
  'Occlusal'
]

export const RADIOGRAPH_COMMON_REASONS = [
  'High caries risk profile',
  'Recall bitewing schedule (≥6 mo since last)',
  'Pain in upper-right quadrant',
  'Pain in upper-left quadrant',
  'Pain in lower-right quadrant',
  'Pain in lower-left quadrant',
  'Localized swelling — evaluate suspected odontogenic source',
  'Trauma evaluation',
  'Follow-up post-treatment',
  'New patient comprehensive evaluation',
  'Suspected interproximal caries (clinical exam inconclusive)',
  'Pre-extraction evaluation',
  'Endodontic working-length confirmation',
  'Post-endo / post-restoration verification',
  'Evaluate developing dentition / eruption pattern'
]

export const PEDIATRIC_PANO_INDICATIONS = [
  {
    category: 'Standard Diagnostic & Clinical Indications',
    items: [
      {
        id: 'trauma',
        label: 'Dental trauma (intrusion/avulsion/jaw fracture/displaced primary)',
        documentation:
          'Panoramic radiograph indicated due to facial/dental trauma with concern for displaced primary teeth, developing permanent tooth buds, and possible mandibular involvement.'
      },
      {
        id: 'pathology',
        label: 'Suspected pathology / lesion / cyst / unexplained asymmetry',
        documentation:
          'Pano indicated to evaluate suspected odontogenic pathology/swelling not localized clinically.'
      },
      {
        id: 'delayed-eruption',
        label: 'Delayed or asymmetric eruption',
        documentation:
          'Panoramic imaging indicated to assess delayed eruption and evaluate presence/position of developing dentition.'
      },
      {
        id: 'supernumerary',
        label: 'Suspected supernumerary / mesiodens / ectopic developing teeth',
        documentation:
          'Pano indicated to evaluate possible supernumerary dentition affecting eruption trajectory.'
      },
      {
        id: 'congenital-anomalies',
        label: 'Congenital absence / hypodontia / ectodermal dysplasia / craniofacial anomaly',
        documentation:
          'Panoramic survey required to assess developing dentition and suspected developmental anomalies.'
      },
      {
        id: 'severe-ecc',
        label: 'Extensive ECC — full-mouth treatment planning under behavior limitations',
        documentation:
          'Panoramic radiograph obtained to assist comprehensive treatment planning for generalized severe early childhood caries under behavior limitations.'
      },
      {
        id: 'preop-or',
        label: 'Preoperative evaluation for hospital dentistry / OR rehabilitation',
        documentation:
          'Pano indicated for comprehensive surgical/restorative treatment planning prior to hospital-based dental rehabilitation.'
      },
      {
        id: 'multi-tooth-infection',
        label: 'Suspected infection extending beyond a single tooth (cellulitis, multiple abscesses)',
        documentation:
          'Panoramic imaging indicated to evaluate extent of odontogenic infection and identify involved teeth.'
      },
      {
        id: 'facial-swelling',
        label: 'Facial swelling of unknown origin / unilateral swelling / lymphadenopathy',
        documentation:
          'Pano indicated to evaluate possible odontogenic source of facial swelling.'
      },
      {
        id: 'permanent-after-trauma',
        label: 'Evaluation of developing permanent dentition after primary-tooth trauma',
        documentation:
          'Panoramic radiograph obtained to assess impact of primary tooth trauma on developing permanent successors.'
      },
      {
        id: 'ankylosis',
        label: 'Suspected ankylosis / submerged primary molar / ectopic eruption',
        documentation:
          'Pano indicated to assess eruption disturbance/possible ankylosis affecting arch development.'
      },
      {
        id: 'tmj-asymmetry',
        label: 'TMJ evaluation or mandibular asymmetry with clinical signs',
        documentation:
          'Panoramic imaging indicated to evaluate mandibular asymmetry and condylar development.'
      },
      {
        id: 'airway-syndromic',
        label: 'Airway / craniofacial assessment in syndromic conditions (cleft, craniofacial disorder)',
        documentation:
          'Panoramic survey indicated due to craniofacial developmental concerns affecting dentofacial growth.'
      },
      {
        id: 'interceptive-ortho',
        label: 'Baseline before interceptive ortho referral (with genuine findings: crossbite/crowding/skeletal discrepancy)',
        documentation:
          'Panoramic imaging indicated to evaluate developing dentition and eruption pattern associated with early skeletal/occlusal abnormalities.'
      }
    ]
  },
  {
    category: 'Physiological / Neurodivergent / Behavioral Barriers',
    items: [
      {
        id: 'behavior-limitation',
        label: 'Behavior management — unable to tolerate intraoral sensors despite attempts',
        documentation:
          'Due to age and inability to tolerate intraoral imaging, panoramic radiograph selected as lower-distress alternative to obtain necessary diagnostic information.'
      },
      {
        id: 'gag-reflex',
        label: 'Severe hyperactive gag reflex (precludes intraoral sensor placement)',
        documentation:
          "Extraoral panoramic imaging utilized in lieu of intraoral radiographs due to the patient's severe hyperactive gag reflex, which physically precluded the diagnostic placement of intraoral sensors without inducing emesis."
      },
      {
        id: 'spd-asd',
        label: 'Sensory processing disorder / ASD — intraoral sensor edges not tolerated',
        documentation:
          'Due to documented sensory processing challenges/ASD, intraoral sensor placement was poorly tolerated. Extraoral panoramic imaging was selected as a non-invasive, low-distress alternative to obtain necessary diagnostic information safely.'
      },
      {
        id: 'trismus',
        label: 'Trismus / restricted oral opening (infection, spasm, trauma)',
        documentation:
          'Panoramic radiograph indicated to evaluate dentition and jaws due to severe trismus/restricted opening (limited maximal incisal opening), physically preventing the insertion of intraoral image receptors.'
      },
      {
        id: 'neuromuscular',
        label: 'Involuntary movement / neuromuscular disorder (e.g., CP) — biting/choking hazard',
        documentation:
          "Due to patient's neuromuscular condition and involuntary movements, intraoral sensors present a safety/choking hazard. Fast-acquisition extraoral imaging utilized for patient safety and diagnostic yield."
      }
    ]
  },
  {
    category: 'Systemic / Medical / Genetic Presentations',
    items: [
      {
        id: 'preop-oncology',
        label: 'Medical clearance prior to chemotherapy / transplant / immunosuppression',
        documentation:
          'Comprehensive panoramic survey indicated for rapid, full-mouth dental clearance to rule out occult infection/pathology prior to the initiation of chemotherapy/organ transplant.'
      },
      {
        id: 'premature-exfoliation',
        label: 'Unexplained premature exfoliation / mobility of primary teeth (r/o hypophosphatasia, neutropenia)',
        documentation:
          'Panoramic imaging indicated to evaluate generalized alveolar bone architecture and root structures following the unexplained premature mobility/exfoliation of primary teeth, to rule out underlying systemic disease.'
      },
      {
        id: 'bleeding-fragility',
        label: 'Severe bleeding disorder / mucosal fragility (hemophilia, EB)',
        documentation:
          'Extraoral imaging selected to eliminate the risk of mucosal trauma and hemorrhage from rigid intraoral sensors in a patient with a documented severe coagulopathy/tissue fragility disorder.'
      },
      {
        id: 'structural-anomalies',
        label: 'Generalized structural dental anomalies (AI / DI) — root morphology evaluation',
        documentation:
          'Panoramic radiograph indicated to assess root morphology, pulp anatomy, and developing permanent dentition due to clinical presentation of generalized hereditary structural anomalies.'
      }
    ]
  },
  {
    category: 'Acute Diagnostic & Procedural Needs',
    items: [
      {
        id: 'diffuse-pain',
        label: 'Unlocalized, diffuse oral pain in a pre-communicative child',
        documentation:
          'Panoramic imaging indicated as a screening modality to investigate diffuse, unlocalized facial/oral pain in a distressed, pre-communicative patient where targeted intraoral localization was not clinically feasible.'
      },
      {
        id: 'pre-extraction-pa-fail',
        label: 'Pre-extraction evaluation when PAs cannot be obtained',
        documentation:
          'Panoramic radiograph obtained to evaluate primary root morphology and proximity to developing permanent tooth buds prior to indicated surgical extraction, as patient could not tolerate targeted periapical imaging.'
      },
      {
        id: 'distal-shoe',
        label: 'Space-maintenance planning (distal shoe / crypt of unerupted first molar)',
        documentation:
          'Pano indicated to evaluate the position, depth, and developmental stage of the un-erupted permanent first molar crypt prior to the fabrication and placement of a distal shoe space maintainer.'
      },
      {
        id: 'foreign-body',
        label: 'Suspected radiopaque foreign body in maxillofacial region',
        documentation:
          'Panoramic imaging indicated as a low-stress modality to screen for, localize, and evaluate a suspected radiopaque foreign body in the maxillofacial region following a reported incident.'
      },
      {
        id: 'osa-screening',
        label: 'Pediatric sleep-disordered breathing / OSA — craniofacial + airway screening',
        documentation:
          'Panoramic radiograph indicated to assess craniofacial development, jaw relationship, and gross upper airway anatomy in a patient with clinical signs of sleep-disordered breathing.'
      },
      {
        id: 'non-accidental-trauma',
        label: 'Suspected non-accidental trauma — medical-legal skeletal survey',
        documentation:
          'Maxillofacial panoramic survey indicated as part of a comprehensive evaluation to rule out occult or healing mandibular/maxillary fractures associated with suspected non-accidental trauma.'
      }
    ]
  },
  {
    category: 'Digital Technology ALARA Defenses',
    items: [
      {
        id: 'eobw',
        label: 'Extraoral bitewing (EOBW) program used in lieu of intraoral BWX',
        documentation:
          'Patient anatomy/sensory profile prevented successful placement of intraoral bitewings. Collimated digital extraoral bitewing program utilized via panoramic unit to evaluate interproximal surfaces for caries in strict accordance with ALARA.'
      },
      {
        id: 'alara-retake',
        label: 'ALARA retake defense — fast extraoral over repeated failed intraoral attempts',
        documentation:
          'Attempted intraoral radiographs, but patient age, oral anatomy, and behavioral tolerance precluded successful placement. To prevent unwarranted cumulative radiation exposure from non-diagnostic retakes (ALARA), a fast-capture digital extraoral scan utilizing pediatric dose-reduction/collimation settings was successfully utilized.'
      }
    ]
  }
]

export const PEDIATRIC_PANO_ALARA_FOOTER =
  'Radiographic selection based on clinical findings, patient age, behavior limitations, and diagnostic necessity in accordance with ALARA principles. Panoramic imaging selected as the lowest-burden modality capable of answering the clinical question.'

export const RADIOGRAPH_FINDINGS = [
  'No significant findings',
  'Interproximal caries',
  'Periapical pathology',
  'Horizontal bone loss',
  'Vertical bone defects',
  'Calculus deposits',
  'Impacted teeth',
  'Developmental anomaly',
  'Root resorption'
]

export const EPSDT_RISK_FACTORS = [
  'Active caries present',
  'Visible plaque',
  'High cariogenic diet',
  'Inadequate fluoride exposure',
  'Xerostomia',
  'Special healthcare needs',
  'Fluoride varnish applied',
  'Dental sealants present',
  'Good oral hygiene',
  'Regular dental care',
  'Fluoridated water source'
]

export const EPSDT_COUNSELING_TOPICS = [
  'Brushing technique',
  'Flossing',
  'Fluoride use',
  'Diet/sugar reduction',
  'Sippy cup/bottle use',
  'Pacifier/digit habit',
  'Sealant recommendation',
  'Fluoride varnish',
  'Sports mouthguard',
  'Injury prevention'
]

export const EPSDT_REFERRALS = [
  'Speech therapy',
  'Orthodontic evaluation',
  'Pediatric dental specialist',
  'Primary care physician',
  'Early intervention services'
]

export const EDUCATION_TOPICS_EPSDT = [
  'Toothbrushing technique (caregiver-assisted if young)',
  'Fluoride toothpaste — pea-sized amount',
  'Fluoride varnish benefits',
  'Bottle/sippy cup weaning',
  'Sugar-sweetened beverage reduction',
  'Snacking frequency',
  'Sealant recommendation',
  'Pacifier/digit habit cessation',
  'Teething/eruption timeline',
  'Early childhood caries prevention',
  'Importance of regular dental visits',
  'Mouthguard for sports'
]

export const EDUCATION_TOPICS = [
  'Toothbrushing technique',
  'Flossing/interdental cleaning',
  'Fluoride toothpaste use',
  'Fluoride varnish benefits',
  'Dietary counseling',
  'Snacking frequency',
  'Sugar-sweetened beverages',
  'Sealant education',
  'Mouthguard/sports protection',
  'Tobacco/vaping cessation',
  'Dry mouth management',
  'Denture/prosthesis care',
  'Importance of regular visits',
  'Bottle/sippy cup habits',
  'Oral cancer self-exam',
  'Teething/eruption timeline',
  'Early childhood caries prevention'
]

export const DIAGNOSIS_QUICK_PICKS = [
  'Dental caries - primary dentition',
  'Dental caries - permanent dentition',
  'Plaque-induced gingivitis',
  'Periodontitis',
  'Reversible pulpitis',
  'Irreversible pulpitis',
  'Pulp necrosis',
  'Acute periapical abscess',
  'Chronic periapical abscess',
  'Dental fracture',
  'Malocclusion',
  'Crowding',
  'Spacing',
  'Edentulous area',
  'Hypoplastic enamel',
  'Healthy dentition - no significant findings'
]

export const VISIT_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Exam' },
  { value: 'periodic', label: 'Periodic Exam' },
  { value: 'limited', label: 'Limited/Problem-Focused' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'scheduled', label: 'Scheduled Treatment' }
]

export const PATIENT_TYPES = [
  { value: 'epsdt', label: 'EPSDT Child (Medicaid/MCNA)', desc: 'Adds EPSDT screening step' },
  { value: 'child', label: 'General Child', desc: 'Pediatric, non-EPSDT' },
  { value: 'adult', label: 'General Adult', desc: 'Adult patient' }
]

export const PROVIDERS = ['Dr. Garner']

export const PROCEDURE_TYPES = [
  { value: 'filling', label: 'Filling' },
  { value: 'crown', label: 'Crown' },
  { value: 'extraction', label: 'Extraction' }
]

export const TOOTH_SURFACES_ALL = ['M', 'O', 'D', 'B', 'L', 'I']

export const FILLING_DEFAULTS = {
  tooth: '',
  surfaces: [],
  material: 'Composite',
  decayDepth: 'Moderate (into dentin)',
  anesthesia: '2% Lidocaine 1:100,000 epi, 1 carpule, infiltration',
  isolation: 'Cotton rolls and dryangle',
  prepMethod: 'Carbide bur',
  etchType: '37% phosphoric acid',
  etchTimeEnamel: 15,
  etchTimeDentin: 30,
  bondingAgent: 'Peak Universal Bond',
  msdsReviewed: true,
  cureTimeSec: 20,
  base: 'Flowable composite liner',
  occlusionAdjusted: true,
  additionalNotes: ''
}

export const FILLING_OPTIONS = {
  material: ['Composite', 'Amalgam', 'Glass ionomer (GIC)', 'Resin-modified glass ionomer (RMGI)'],
  decayDepth: [
    'Superficial (enamel only)',
    'Moderate (into dentin)',
    'Deep (close to pulp)',
    'Near pulp exposure (indirect pulp cap placed)'
  ],
  prepMethod: ['Carbide bur', 'Air abrasion', 'Bur + air abrasion', 'Diamond bur'],
  etchType: ['37% phosphoric acid', 'Self-etch (no separate acid)'],
  bondingAgent: ['Peak Universal Bond', 'Scotchbond Universal', 'OptiBond', 'Other (specify in notes)'],
  base: ['Flowable composite liner', 'RMGI base', 'Calcium hydroxide (Dycal)', 'None']
}

export const CROWN_DEFAULTS = {
  tooth: '',
  appointmentType: 'Prep',
  crownType: 'PFM',
  anesthesia: '2% Lidocaine 1:100,000 epi, 2 carpules',
  reduction: '1.5mm occlusal, 1mm axial',
  marginDesign: 'Chamfer',
  marginLocation: 'Supragingival',
  retractionCord: 'Single cord, size 000',
  impression: 'PVS, single-step',
  shade: 'A3',
  temporary: 'Bis-acryl with temporary cement',
  cementation: '',
  additionalNotes: ''
}

export const CROWN_OPTIONS = {
  appointmentType: ['Prep', 'Seat'],
  crownType: ['PFM', 'Zirconia (monolithic)', 'E.max (lithium disilicate)', 'Full gold', 'Stainless steel (pediatric)'],
  marginDesign: ['Chamfer', 'Shoulder', 'Shoulder with bevel', 'Knife-edge'],
  marginLocation: ['Supragingival', 'Equigingival', 'Subgingival'],
  retractionCord: ['Single cord, size 000', 'Single cord, size 00', 'Double cord (000 + 0)', 'No cord (laser troughing)'],
  impression: ['PVS, single-step', 'PVS, two-step', 'Digital scan (intraoral)', 'Polyether'],
  cementation: ['Glass ionomer (RelyX Luting Plus)', 'Resin cement (RelyX Unicem)', 'Zinc phosphate', 'Resin-modified glass ionomer']
}

export const EXTRACTION_DEFAULTS = {
  tooth: '',
  type: 'Simple',
  anesthesia: '2% Lidocaine 1:100,000 epi, 2 carpules, infiltration + block',
  technique: 'Forceps with elevator',
  complications: 'None',
  socketPreservation: false,
  graftMaterial: '',
  sutures: 'None',
  postOpInstructions: 'Standard written and verbal post-op instructions given; hemostasis achieved',
  additionalNotes: ''
}

export const EXTRACTION_OPTIONS = {
  type: ['Simple', 'Surgical (flap and/or sectioning)'],
  technique: [
    'Forceps with elevator',
    'Elevator only',
    'Forceps with luxator',
    'Surgical flap with sectioning',
    'Surgical flap, sectioning, and bone removal'
  ],
  complications: [
    'None',
    'Root tip retained (informed and documented)',
    'Root fracture',
    'Buccal plate fracture',
    'Sinus communication (Valsalva positive)',
    'Sinus communication (Valsalva negative)',
    'Other (specify in notes)'
  ],
  graftMaterial: ['Allograft (FDBA)', 'Xenograft (Bio-Oss)', 'Collagen plug only'],
  sutures: ['None', '3-0 chromic gut', '4-0 chromic gut', '4-0 Vicryl', '4-0 silk', '5-0 PTFE']
}
