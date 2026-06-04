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

// Drug–allergy conflict detection. Deliberately conservative: only high-confidence
// same-drug or same-class matches are encoded, so the note flags a genuine
// contraindication (e.g. penicillin allergy + amoxicillin, or lidocaine allergy +
// lidocaine administered) without crying wolf on low-cross-reactivity pairings
// (e.g. a lidocaine allergy does NOT flag articaine — different amide, commonly
// chosen for exactly that reason; a penicillin allergy does NOT flag cephalosporins).
// Used by both the note generator (to build the alert block) and the eval rubric.
const ALLERGY_CONFLICT_RULES = [
  {
    allergen: /\b(penicillin|pcn|pen[ -]?vk?)\b/i,
    conflicts: /\b(penicillin|pcn|pen[ -]?vk?|amoxicillin|amoxil|augmentin|amoxicillin[- ]clavulanate|ampicillin|dicloxacillin|nafcillin|oxacillin|piperacillin)\b/i,
    drugClass: 'penicillin-class antibiotic',
    severity: 'contraindication'
  },
  {
    allergen: /\bamoxicillin\b|\bamoxil\b/i,
    conflicts: /\b(amoxicillin|amoxil|augmentin|amoxicillin[- ]clavulanate|penicillin|ampicillin)\b/i,
    drugClass: 'penicillin-class antibiotic',
    severity: 'contraindication'
  },
  {
    allergen: /\b(sulfa|sulfonamide)s?\b/i,
    conflicts: /\b(sulfamethoxazole|bactrim|septra|tmp[- ]?smx|trimethoprim[- ]sulfamethoxazole|sulfasalazine|sulfadiazine)\b/i,
    drugClass: 'sulfonamide antibiotic',
    severity: 'contraindication'
  },
  {
    allergen: /\b(aspirin|asa|acetylsalicylic)\b/i,
    conflicts: /\b(aspirin|acetylsalicylic|asa)\b/i,
    drugClass: 'salicylate',
    severity: 'contraindication'
  },
  {
    allergen: /\bnsaids?\b/i,
    conflicts: /\b(ibuprofen|naproxen|ketorolac|toradol|diclofenac|celecoxib|aleve|advil|motrin|meloxicam)\b/i,
    drugClass: 'NSAID',
    severity: 'contraindication'
  },
  {
    allergen: /\b(codeine|opioids?)\b/i,
    conflicts: /\b(codeine|hydrocodone|oxycodone|tramadol|morphine|norco|vicodin|percocet)\b/i,
    drugClass: 'opioid analgesic',
    severity: 'contraindication'
  },
  {
    allergen: /\b(lidocaine|xylocaine)\b/i,
    conflicts: /\b(lidocaine|xylocaine)\b/i,
    drugClass: 'lidocaine (amide local anesthetic)',
    severity: 'contraindication'
  },
  {
    allergen: /\b(articaine|septocaine)\b/i,
    conflicts: /\b(articaine|septocaine)\b/i,
    drugClass: 'articaine (amide local anesthetic)',
    severity: 'contraindication'
  },
  {
    allergen: /\b(mepivacaine|carbocaine|polocaine)\b/i,
    conflicts: /\b(mepivacaine|carbocaine|polocaine)\b/i,
    drugClass: 'mepivacaine (amide local anesthetic)',
    severity: 'contraindication'
  },
  {
    // Generic ester-anesthetic allergy cross-reacts within the ester class.
    allergen: /\b(benzocaine|procaine|tetracaine|ester anesthetic)\b/i,
    conflicts: /\b(benzocaine|procaine|tetracaine|cetacaine)\b/i,
    drugClass: 'ester local anesthetic',
    severity: 'contraindication'
  },
  {
    // Vague "local anesthetic" allergy — flag any -caine for verification (lower certainty).
    allergen: /\blocal anesthetic\b/i,
    conflicts: /\b(lidocaine|articaine|septocaine|mepivacaine|prilocaine|bupivacaine|benzocaine|procaine|tetracaine)\b/i,
    drugClass: 'local anesthetic',
    severity: 'caution'
  }
]

const NO_ALLERGY = /\b(nka|nkda|no known (drug )?allerg|none|denies)\b/i

// Returns an array of detected conflicts: { allergen, drug, drugClass, severity, source }.
// `allergen` is the original chart allergy string; `drug` is the matched drug token.
export function detectDrugAllergyConflicts(data) {
  const mh = data?.medicalHistory || {}
  const allergies = (Array.isArray(mh.allergies) ? mh.allergies : []).filter(
    (a) => typeof a === 'string' && a.trim() && !NO_ALLERGY.test(a)
  )
  if (!allergies.length) return []

  // Collect every drug string recorded for this visit, tagged by source.
  const drugSources = []
  if (mh.medications && typeof mh.medications === 'string') {
    drugSources.push({ text: mh.medications, source: 'current/prescribed medications' })
  }
  for (const p of data?.scheduledTreatment?.procedures || []) {
    if (p?.anestheticDrug) drugSources.push({ text: p.anestheticDrug, source: 'anesthetic administered' })
    if (p?.additionalNotes) drugSources.push({ text: p.additionalNotes, source: 'procedure notes' })
  }

  const conflicts = []
  const seen = new Set()
  for (const allergyStr of allergies) {
    for (const rule of ALLERGY_CONFLICT_RULES) {
      if (!rule.allergen.test(allergyStr)) continue
      for (const ds of drugSources) {
        const match = ds.text.match(rule.conflicts)
        if (!match) continue
        const key = `${allergyStr}|${rule.drugClass}|${match[0].toLowerCase()}|${ds.source}`
        if (seen.has(key)) continue
        seen.add(key)
        conflicts.push({
          allergen: allergyStr.trim(),
          drug: match[0],
          drugClass: rule.drugClass,
          severity: rule.severity,
          source: ds.source
        })
      }
    }
  }
  return conflicts
}


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

// Caries-risk assessment. Risk-increasing (negative) factors are grouped first
// so the protective (positive) factors are the LAST buttons clickable.
export const EPSDT_RISK_FACTORS_RISK = [
  'Active caries / cavitated lesions',
  'White spot lesions / early demineralization',
  'Recent caries within past 24 months',
  'Visible plaque accumulation',
  'Deep pits and fissures',
  'Enamel hypoplasia / developmental defects',
  'High cariogenic / sugary diet',
  'Frequent snacking between meals',
  'Sugar-sweetened / acidic beverages',
  'Inadequate fluoride exposure',
  'Xerostomia / reduced salivary flow',
  'Orthodontic appliances present',
  'Caregiver with active/recent caries',
  'Special healthcare needs'
]

export const EPSDT_RISK_FACTORS_PROTECTIVE = [
  'Fluoride varnish applied',
  'Dental sealants present',
  'Good oral hygiene',
  'Regular dental care',
  'Fluoridated water source'
]

export const EPSDT_RISK_FACTORS = [...EPSDT_RISK_FACTORS_RISK, ...EPSDT_RISK_FACTORS_PROTECTIVE]

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

// Pre-checked on every EPSDT exam encounter (documents OHI + dietary counseling).
export const EPSDT_DEFAULT_COUNSELING = ['Brushing technique', 'Diet/sugar reduction']

export const EPSDT_REFERRALS = [
  'Speech therapy',
  'Orthodontic evaluation',
  'Pediatric dental specialist',
  'Primary care physician',
  'Early intervention services'
]

export const EDUCATION_TOPICS_EPSDT = [
  'Toothbrushing technique (caregiver-assisted if young)',
  'Early childhood caries prevention',
  'Sugar-sweetened beverage reduction',
  'Snacking frequency',
  'Dietary counseling',
  'Low pH + sugar effects of drinks explained',
  'Avoidance of energy drinks',
  'Marketing of drinks as healthy (misleading)',
  'Fluoride toothpaste — pea-sized amount',
  'Fluoride varnish benefits',
  'Bottle/sippy cup weaning',
  'Sealant recommendation',
  'Pacifier/digit habit cessation',
  'Teething/eruption timeline',
  'Importance of regular dental visits',
  'Mouthguard for sports'
]

// Pre-checked on every EPSDT exam encounter (priority MCNA documentation topics).
export const EPSDT_DEFAULT_EDUCATION = [
  'Toothbrushing technique (caregiver-assisted if young)',
  'Early childhood caries prevention',
  'Sugar-sweetened beverage reduction',
  'Snacking frequency',
  'Dietary counseling',
  'Low pH + sugar effects of drinks explained'
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
  { value: 'sealant', label: 'Sealant' },
  { value: 'crown', label: 'Crown' },
  { value: 'endo', label: 'Endodontic / Build-up' },
  { value: 'extraction', label: 'Extraction' }
]

export const TOOTH_SURFACES_ALL = ['M', 'O', 'D', 'B', 'L', 'I']

export const ANESTHESIA_OPTIONS = {
  drug: [
    'Septocaine (articaine) 4% with 1:200,000 epi',
    'Septocaine (articaine) 4% with 1:100,000 epi',
    'Lidocaine 2% with 1:100,000 epi'
  ],
  technique: [
    'Infiltration',
    'Inferior alveolar nerve block',
    'PSA block',
    'Mental/incisive block',
    'Greater palatine block',
    'Nasopalatine block',
    'Buccal infiltration only',
    'Infiltration + IAN block'
  ]
}

// Shared protocol option lists used across restorative/endo/sealant procedures.
export const ISOLATION_OPTIONS = ['Isolite', 'Cotton rolls / DriAngle', 'Rubber dam']

export const PREP_CLEANING_OPTIONS = [
  'Air/water',
  'IPA (isopropyl alcohol)',
  'Consepsis Scrub',
  'Consepsis',
  'Clean & Boost'
]

export const ETCH_TYPES = [
  '37% phosphoric acid',
  'Selective etch (enamel only)',
  'No etch / self-adhesive'
]

export const MATRIX_SYSTEMS = [
  'V-ring + plastic wedge',
  'Mylar strip + wooden wedge',
  'Disposable Tofflemire + wooden wedge',
  'Plastic wedge with built-in matrix'
]

export const HEMOSTATIC_AGENTS = [
  'None',
  'ViscoStat',
  'Hemodent',
  'Lidocaine 1:50k epi',
  'EpiPellets',
  'BlueMousse + Traxodent'
]

export const CURING_LIGHT = 'Ultradent VALO'

export const FILLING_DEFAULTS = {
  tooth: '',
  surfaces: [],
  material: 'Composite',
  decayDepth: 'Moderate (into dentin)',
  anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
  anestheticCarpules: 1,
  anestheticTechnique: 'Infiltration',
  isolation: 'Isolite',
  prepCleaning: 'Consepsis Scrub',
  prepMethod: 'Carbide bur',
  etchType: '37% phosphoric acid',
  etchTimeEnamel: 30,
  etchTimeDentin: 15,
  bondingAgent: 'Peak Universal Bond (Ultradent)',
  msdsReviewed: true,
  matrixSystem: 'V-ring + plastic wedge',
  hemostaticAgent: 'None',
  cureTimeSec: 20,
  valoPowerCures: false,
  compositeProduct: 'Omnichroma packable',
  desensitizers: ['None'],
  base: 'Flowable composite liner',
  fieldIsolatedDry: true,
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
  isolation: ISOLATION_OPTIONS,
  prepCleaning: PREP_CLEANING_OPTIONS,
  prepMethod: ['Carbide bur', 'Air abrasion', 'Bur + air abrasion', 'Diamond bur'],
  etchType: ETCH_TYPES,
  matrixSystem: MATRIX_SYSTEMS,
  hemostaticAgent: HEMOSTATIC_AGENTS,
  bondingAgent: [
    'Peak Universal Bond (Ultradent)',
    '3M Scotchbond Universal Plus',
    'Tokuyama Universal Bond'
  ],
  compositeProduct: [
    'Omnichroma packable',
    'Omnichroma flowable',
    'Omnichroma Blocker packable',
    'Omnichroma Blocker flowable',
    'Transcend (Ultradent)',
    '3M Filtek Supreme'
  ],
  desensitizer: [
    'Dycal (Ca(OH)₂)',
    'generic Ca(OH)₂',
    'IRM',
    'Riva Star',
    'GLUMA',
    'Vitrebond (RMGI liner)',
    'None'
  ],
  base: ['Flowable composite liner', 'RMGI base', 'Calcium hydroxide (Dycal)', 'None']
}

export const CEREC_OPTIONS = {
  scanDevice: ['CEREC Omnicam', 'CEREC Primescan', 'iTero', 'Other (specify in notes)'],
  mill: ['MCXL 4-motor', 'CEREC Primemill', 'Other (specify in notes)'],
  crystallization: [
    'Programat CS / SpeedFire oven, full crystallization cycle',
    'SpeedFire only (quick sinter)',
    'Programat CS only',
    'N/A (no crystallization required)'
  ],
  crownMaterial: ['Dentsply MTL Zirconia', 'E.max CAD', 'Zirlux', 'IPS Empress CAD'],
  vitality: ['Vital', 'Non-vital', 'Previously RCT']
}

export const CROWN_DEFAULTS = {
  tooth: '',
  appointmentType: 'Same-day CEREC',
  crownType: 'Zirconia (monolithic)',
  anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
  anestheticCarpules: 1.5,
  anestheticTechnique: 'Infiltration',
  reduction: '1.5mm occlusal, 1mm axial',
  marginDesign: 'Chamfer',
  marginLocation: 'Supragingival',
  retractionCord: 'Single cord, size 000',
  hemostaticAgent: 'ViscoStat',
  impression: 'PVS, single-step',
  shade: 'A3',
  temporary: 'Bis-acryl with temporary cement',
  fieldIsolatedDry: true,
  cementation: 'Fuji Evolve RMGI cement',
  cerecScanDevice: 'CEREC Omnicam',
  cerecMill: 'MCXL 4-motor',
  cerecCrystallization: 'Programat CS / SpeedFire oven, full crystallization cycle',
  cerecCrownMaterial: 'Dentsply MTL Zirconia',
  vitality: 'Vital',
  additionalNotes: ''
}

export const CROWN_OPTIONS = {
  appointmentType: ['Prep (lab case)', 'Same-day CEREC', 'Seat (lab case delivery)'],
  crownType: ['PFM', 'Zirconia (monolithic)', 'E.max (lithium disilicate)', 'Full gold', 'Stainless steel (pediatric)'],
  marginDesign: ['Chamfer', 'Shoulder', 'Shoulder with bevel', 'Knife-edge'],
  marginLocation: ['Supragingival', 'Equigingival', 'Subgingival'],
  retractionCord: ['Single cord, size 000', 'Single cord, size 00', 'Double cord (000 + 0)', 'No cord (laser troughing)'],
  hemostaticAgent: HEMOSTATIC_AGENTS,
  impression: ['PVS, single-step', 'PVS, two-step', 'Digital scan (intraoral)', 'Polyether'],
  cementation: [
    'Fuji Evolve RMGI cement',
    'RelyX Unicem (resin cement)',
    'RelyX Luting Plus (glass ionomer)',
    'Zinc phosphate',
    'Multilink'
  ]
}

export const EXTRACTION_DEFAULTS = {
  tooth: '',
  type: 'Simple',
  anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
  anestheticCarpules: 2,
  anestheticTechnique: 'Infiltration + IAN block',
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

export const SEALANT_OPTIONS = {
  material: [
    'Resin sealant (etch 30s + bonding agent + flowable composite)',
    'RMGI (resin-modified glass ionomer)',
    'GI (glass ionomer)'
  ],
  isolation: ISOLATION_OPTIONS
}

export const SEALANT_DEFAULTS = {
  tooth: '',
  material: 'Resin sealant (etch 30s + bonding agent + flowable composite)',
  isolation: 'Isolite',
  etchTimeEnamel: 30,
  bondingAgent: 'Peak Universal Bond (Ultradent)',
  flowableProduct: 'Omnichroma flowable',
  msdsReviewed: true,
  cureTimeSec: 20,
  valoPowerCures: false,
  fieldIsolatedDry: true,
  additionalNotes: ''
}

export const ENDO_OPTIONS = {
  toothType: ['Anterior', 'Premolar', 'Molar'],
  irrigation: [
    'Sodium hypochlorite (NaOCl)',
    'NaOCl + EDTA',
    'NaOCl + EDTA + CHX',
    'Chlorhexidine (CHX)'
  ],
  obturation: [
    'Single-cone with bioceramic sealer',
    'Gutta-percha, warm vertical condensation',
    'Gutta-percha, lateral condensation'
  ],
  buildupMaterial: ['Composite core', 'RMGI core', 'Amalgam core'],
  matrixSystem: MATRIX_SYSTEMS
}

export const ENDO_DEFAULTS = {
  tooth: '',
  toothType: 'Molar',
  isolation: 'Rubber dam',
  anestheticDrug: 'Septocaine (articaine) 4% with 1:200,000 epi',
  anestheticCarpules: 2,
  anestheticTechnique: 'Inferior alveolar nerve block',
  canals: '',
  workingLength: 'Apex locator confirmed with periapical radiograph',
  irrigation: 'NaOCl + EDTA',
  obturation: 'Single-cone with bioceramic sealer',
  buildupPlaced: true,
  buildupMaterial: 'Composite core',
  matrixSystem: 'V-ring + plastic wedge',
  cureTimeSec: 20,
  valoPowerCures: false,
  fieldIsolatedDry: true,
  occlusionAdjusted: true,
  additionalNotes: ''
}

// ---------------------------------------------------------------------------
// Path A — Coding & audit (ported from clinicalsidecarv7.2.html)
// ---------------------------------------------------------------------------

// CDT ↔ ICD-10 crosswalk. Each entry exposes:
//   code, desc, category (procedure category for consent derivation),
//   primary ICD + label, two alternate ICDs + labels,
//   docRequirements (audit doc), auditFlag (notable risk), consentCategory (pc).
// `consentCategory` connects each procedure to one or more entries in CONSENTS.
export const CDT_ICD10_CROSSWALK = [
  { code: 'D0120', desc: 'Periodic oral evaluation', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'Z01.20', label: 'Normal findings' }], docRequirements: 'Document disease present or absent.', auditFlag: 'Must document findings', consentCategory: null },
  { code: 'D0140', desc: 'Limited oral evaluation - problem focused', category: 'Diagnostic', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K04.01', label: 'Reversible pulpitis' }, { icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'SOAP required. Justify limited vs periodic.', auditFlag: 'Must justify limited vs periodic', consentCategory: 'palliative' },
  { code: 'D0150', desc: 'Comprehensive oral evaluation', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'Z01.20', label: 'Normal findings' }], docRequirements: 'Document disease present or absent.', auditFlag: 'Must document findings', consentCategory: null },
  { code: 'D0180', desc: 'Comprehensive periodontal evaluation', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'K05.311', label: 'Chronic perio loc slight' }, { icd: 'K05.321', label: 'Chronic perio gen slight' }], docRequirements: 'Perio charting required.', auditFlag: 'Must have charting', consentCategory: 'periodontic' },
  { code: 'D0210', desc: 'FMX radiographic survey', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'K02.9', label: 'Caries unspecified' }], docRequirements: 'Document indication.', auditFlag: 'Frequency limits', consentCategory: 'imaging' },
  { code: 'D0220', desc: 'Periapical - first image', category: 'Diagnostic', primary: { icd: 'K04.01', label: 'Reversible pulpitis' }, alts: [{ icd: 'K02.52', label: 'Caries → dentin' }, { icd: 'K04.4', label: 'Acute apical periodontitis' }], docRequirements: 'Document reason for PA.', auditFlag: null, consentCategory: 'imaging' },
  { code: 'D0272', desc: 'Bitewing - 2 images', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'K02.52', label: 'Caries → dentin' }, { icd: 'Z13.84', label: 'Screening dental disorders' }], docRequirements: 'Screening or diagnostic.', auditFlag: 'Frequency limits', consentCategory: 'imaging' },
  { code: 'D0274', desc: 'Bitewing - 4 images', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'K02.52', label: 'Caries → dentin' }, { icd: 'Z13.84', label: 'Screening dental disorders' }], docRequirements: 'Screening or diagnostic.', auditFlag: 'Frequency limits', consentCategory: 'imaging' },
  { code: 'D0330', desc: 'Panoramic radiographic image', category: 'Diagnostic', primary: { icd: 'Z01.21', label: 'Exam with abnormal findings' }, alts: [{ icd: 'K01.1', label: 'Impacted teeth' }], docRequirements: 'Document indication.', auditFlag: 'Justify pano vs FMX', consentCategory: 'imaging' },
  { code: 'D1110', desc: 'Prophylaxis - adult', category: 'Preventive', primary: { icd: 'Z41.8', label: 'Procedure not remedying health' }, alts: [{ icd: 'K05.10', label: 'Chronic gingivitis' }, { icd: 'K03.6', label: 'Deposits on teeth' }], docRequirements: 'If gingivitis present, use K05.10.', auditFlag: 'Not same day as D4341/D4910', consentCategory: 'preventive' },
  { code: 'D1120', desc: 'Prophylaxis - child', category: 'Preventive', primary: { icd: 'Z41.8', label: 'Procedure not remedying health' }, alts: [{ icd: 'K05.10', label: 'Chronic gingivitis' }, { icd: 'K03.6', label: 'Deposits on teeth' }], docRequirements: 'Add Z91.843 for MCNA EPSDT.', auditFlag: 'Not same day as D4341/D4910', consentCategory: 'preventive' },
  { code: 'D1206', desc: 'Topical application of fluoride varnish', category: 'Preventive', primary: { icd: 'Z29.3', label: 'Prophylactic fluoride' }, alts: [{ icd: 'K02.61', label: 'Caries smooth → enamel' }, { icd: 'K02.51', label: 'Caries pit → enamel' }], docRequirements: 'Add K02 for demineralization.', auditFlag: 'Not same day as D1354', consentCategory: 'preventive' },
  { code: 'D1354', desc: 'SDF (silver diamine fluoride) per tooth', category: 'Preventive', primary: { icd: 'K02.3', label: 'Arrested caries' }, alts: [{ icd: 'K02.52', label: 'Caries → dentin' }, { icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document teeth. SDF consent required (staining warning).', auditFlag: 'SDF consent required', consentCategory: 'sdf' },
  { code: 'D2140', desc: 'Amalgam - one surface', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document surfaces.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2150', desc: 'Amalgam - two surfaces', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document surfaces.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2330', desc: 'Composite - one surface, anterior', category: 'Restorative', primary: { icd: 'K02.62', label: 'Smooth → dentin' }, alts: [{ icd: 'K02.52', label: 'Pit/fissure → dentin' }, { icd: 'S02.5XXA', label: 'Tooth fracture' }], docRequirements: 'Anteriors typically K02.62.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2331', desc: 'Composite - two surfaces, anterior', category: 'Restorative', primary: { icd: 'K02.62', label: 'Smooth → dentin' }, alts: [{ icd: 'K02.52', label: 'Pit/fissure → dentin' }], docRequirements: 'Document surfaces.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2391', desc: 'Composite - one surface, posterior', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Posteriors typically K02.52.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2392', desc: 'Composite - two surfaces, posterior', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document surfaces.', auditFlag: null, consentCategory: 'restorative' },
  { code: 'D2393', desc: 'Composite - three surfaces, posterior', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document surfaces.', auditFlag: 'Multi-surface: justify', consentCategory: 'restorative' },
  { code: 'D2394', desc: 'Composite - four+ surfaces, posterior', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries pit/fissure → dentin' }, alts: [{ icd: 'K02.62', label: 'Smooth → dentin' }], docRequirements: 'Document surfaces.', auditFlag: 'High audit risk. Pre-op radiograph required.', consentCategory: 'restorative' },
  { code: 'D2740', desc: 'Crown - porcelain/ceramic', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries → dentin' }, alts: [{ icd: 'K03.81', label: 'Cracked tooth' }, { icd: 'K08.539', label: 'Fractured restorative' }], docRequirements: 'Document why crown vs direct restoration.', auditFlag: 'Pre-auth typically required. Narrative + radiograph.', consentCategory: 'crown' },
  { code: 'D2750', desc: 'Crown - PFM', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries → dentin' }, alts: [{ icd: 'K03.81', label: 'Cracked tooth' }, { icd: 'K08.539', label: 'Fractured restorative' }], docRequirements: 'Document reason for crown.', auditFlag: 'Pre-auth typically required.', consentCategory: 'crown' },
  { code: 'D2950', desc: 'Core buildup, including any pins', category: 'Restorative', primary: { icd: 'K02.52', label: 'Caries → dentin' }, alts: [{ icd: 'K03.81', label: 'Cracked tooth' }], docRequirements: 'Document structure loss.', auditFlag: 'Must bill with crown.', consentCategory: 'crown' },
  { code: 'D3220', desc: 'Pulpotomy - primary tooth', category: 'Endodontic', primary: { icd: 'K04.01', label: 'Reversible pulpitis' }, alts: [{ icd: 'K04.02', label: 'Irreversible pulpitis' }], docRequirements: 'Document pulpal diagnosis.', auditFlag: null, consentCategory: 'endodontic' },
  { code: 'D3310', desc: 'Endodontic - anterior', category: 'Endodontic', primary: { icd: 'K04.02', label: 'Irreversible pulpitis' }, alts: [{ icd: 'K04.1', label: 'Pulp necrosis' }, { icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'Pulpal diagnosis + vitality testing. PA required.', auditFlag: 'Pre-auth may be required.', consentCategory: 'endodontic' },
  { code: 'D3320', desc: 'Endodontic - premolar', category: 'Endodontic', primary: { icd: 'K04.02', label: 'Irreversible pulpitis' }, alts: [{ icd: 'K04.1', label: 'Pulp necrosis' }, { icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'Document pulpal diagnosis.', auditFlag: 'Pre-auth may be required.', consentCategory: 'endodontic' },
  { code: 'D3330', desc: 'Endodontic - molar', category: 'Endodontic', primary: { icd: 'K04.02', label: 'Irreversible pulpitis' }, alts: [{ icd: 'K04.1', label: 'Pulp necrosis' }, { icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'Pulpal diagnosis + vitality testing.', auditFlag: 'Pre-auth required. PA required.', consentCategory: 'endodontic' },
  { code: 'D4341', desc: 'SRP - 4+ teeth per quadrant', category: 'Periodontic', primary: { icd: 'K05.321', label: 'Chronic perio gen slight' }, alts: [{ icd: 'K05.322', label: 'Generalized moderate' }, { icd: 'K05.323', label: 'Generalized severe' }], docRequirements: 'Full perio charting required.', auditFlag: 'Not same day as prophy.', consentCategory: 'periodontic' },
  { code: 'D4342', desc: 'SRP - 1-3 teeth per quadrant', category: 'Periodontic', primary: { icd: 'K05.311', label: 'Chronic perio loc slight' }, alts: [{ icd: 'K05.312', label: 'Localized moderate' }, { icd: 'K05.313', label: 'Localized severe' }], docRequirements: 'Localized findings documented.', auditFlag: 'Perio charting required.', consentCategory: 'periodontic' },
  { code: 'D4910', desc: 'Periodontal maintenance', category: 'Periodontic', primary: { icd: 'K05.321', label: 'Chronic perio gen slight' }, alts: [{ icd: 'K05.322', label: 'Generalized moderate' }, { icd: 'K05.323', label: 'Generalized severe' }], docRequirements: 'Prior perio therapy required.', auditFlag: 'Must follow SRP.', consentCategory: 'periodontic' },
  { code: 'D7140', desc: 'Extraction - erupted tooth', category: 'Oral Surgery', primary: { icd: 'K02.53', label: 'Caries → pulp' }, alts: [{ icd: 'K04.7', label: 'Periapical abscess' }, { icd: 'K04.02', label: 'Irreversible pulpitis' }], docRequirements: 'Document caries into pulp / non-restorability.', auditFlag: 'Radiograph required.', consentCategory: 'extraction' },
  { code: 'D7210', desc: 'Surgical extraction - erupted tooth', category: 'Oral Surgery', primary: { icd: 'K02.53', label: 'Caries → pulp' }, alts: [{ icd: 'K04.7', label: 'Periapical abscess' }, { icd: 'K04.02', label: 'Irreversible pulpitis' }], docRequirements: 'MUST document bone removal / sectioning.', auditFlag: 'Must justify surgical vs simple.', consentCategory: 'extraction' },
  { code: 'D7220', desc: 'Removal of impacted tooth - soft tissue', category: 'Oral Surgery', primary: { icd: 'K01.1', label: 'Impacted teeth' }, alts: [{ icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'Document impaction.', auditFlag: 'Radiograph required.', consentCategory: 'extraction' },
  { code: 'D7250', desc: 'Removal of residual tooth roots', category: 'Oral Surgery', primary: { icd: 'K08.3', label: 'Retained root' }, alts: [{ icd: 'K04.7', label: 'Periapical abscess' }], docRequirements: 'Document retained root.', auditFlag: 'Radiograph required.', consentCategory: 'extraction' },
  { code: 'D9110', desc: 'Palliative treatment', category: 'Other', primary: { icd: 'K04.02', label: 'Irreversible pulpitis' }, alts: [{ icd: 'K04.7', label: 'Periapical abscess' }, { icd: 'K04.4', label: 'Acute apical periodontitis' }], docRequirements: 'Document definitive plan.', auditFlag: 'Document definitive plan.', consentCategory: 'palliative' },
  { code: 'D9230', desc: 'Nitrous oxide / analgesia', category: 'Other', primary: { icd: 'F93.8', label: 'Childhood dental anxiety' }, alts: [{ icd: 'F98.8', label: 'Behavioral disorder' }, { icd: 'F40.232', label: 'Fear of dental procedures' }], docRequirements: 'ADJUNCTIVE. Document behavior necessitating.', auditFlag: 'Must justify necessity.', consentCategory: 'nitrous' },
  { code: 'D9940', desc: 'Occlusal guard', category: 'Other', primary: { icd: 'G47.63', label: 'Sleep bruxism' }, alts: [{ icd: 'K03.0', label: 'Excessive attrition' }, { icd: 'M26.60', label: 'TMJ disorder' }], docRequirements: 'Document bruxism / TMD.', auditFlag: 'Medical necessity required.', consentCategory: null }
]

export function lookupCrosswalk(code) {
  if (!code) return null
  return CDT_ICD10_CROSSWALK.find((x) => x.code === code) || null
}

// 10 standardized consent forms, derived per procedure category.
// `triggers` lists which CDT consentCategory values require this consent.
export const CONSENTS = [
  { id: 'general', label: 'General Dental Treatment', triggers: ['restorative', 'preventive', 'palliative', 'endodontic', 'periodontic', 'crown', 'extraction', 'sdf', 'nitrous'] },
  { id: 'imaging', label: 'Diagnostic Imaging & ALARA', triggers: ['imaging'] },
  { id: 'cbct', label: 'CBCT / 3D Imaging', triggers: [] },
  { id: 'local_anesthesia', label: 'Local Anesthesia Consent', triggers: ['restorative', 'endodontic', 'crown', 'extraction', 'periodontic'] },
  { id: 'nitrous', label: 'Nitrous Oxide (N₂O) Consent', triggers: ['nitrous'] },
  { id: 'extraction', label: 'Extraction Consent', triggers: ['extraction'] },
  { id: 'endo', label: 'Root Canal Consent', triggers: ['endodontic'] },
  { id: 'crown', label: 'Crown Consent', triggers: ['crown'] },
  { id: 'sdf', label: 'SDF Consent (irreversible black staining)', triggers: ['sdf'] },
  { id: 'sedation', label: 'Oral / IV Sedation Consent', triggers: [] }
]

// Returns sorted array of consent ids that should be on the consent form for
// the given list of CDT codes (drawn from treatmentRendered + treatmentPlan).
export function derivedRequiredConsents(cdtCodes) {
  const categories = new Set(
    cdtCodes
      .map((c) => lookupCrosswalk(c)?.consentCategory)
      .filter(Boolean)
  )
  const ids = new Set()
  for (const c of CONSENTS) {
    for (const t of c.triggers) if (categories.has(t)) ids.add(c.id)
  }
  return Array.from(ids)
}

// Medical-necessity templates for the highest-audit-risk procedures. The
// template is filled with the user's tooth + surface + finding text so the
// boilerplate medical-legal language is deterministic (not LLM-invented).
export const MEDICAL_NECESSITY_TEMPLATES = {
  D2391: ({ tooth, surfaces, findings }) =>
    `Posterior composite restoration on tooth #${tooth || '[#]'}${surfaces ? `-${surfaces}` : ''} is necessary due to ${findings || 'diagnosed carious lesion confirmed clinically and radiographically'}. Preparation extended into dentin.`,
  D2392: ({ tooth, surfaces, findings }) =>
    `Two-surface posterior composite restoration on tooth #${tooth || '[#]'}${surfaces ? `-${surfaces}` : ''} is necessary due to ${findings || 'diagnosed carious lesion confirmed clinically and radiographically'}. Preparation extended into dentin per Medicaid criteria.`,
  D2393: ({ tooth, surfaces, findings }) =>
    `Three-surface posterior composite restoration on tooth #${tooth || '[#]'}${surfaces ? `-${surfaces}` : ''} is necessary due to ${findings || 'diagnosed carious lesion confirmed clinically and radiographically'}. Multi-surface restoration justified by extent of caries documented in chart and radiograph.`,
  D2740: ({ tooth, findings }) =>
    `Crown on tooth #${tooth || '[#]'} is necessary due to ${findings || 'extensive structural loss and/or cracked-tooth syndrome'}. Remaining tooth structure is insufficient for a direct restoration to achieve durable function.`,
  D2750: ({ tooth, findings }) =>
    `PFM crown on tooth #${tooth || '[#]'} is necessary due to ${findings || 'extensive structural loss and/or cracked-tooth syndrome'}. Remaining tooth structure is insufficient for a direct restoration.`,
  D3310: ({ tooth, findings }) =>
    `Anterior endodontic therapy on tooth #${tooth || '[#]'} is necessary — ${findings || 'pulpal vitality testing and periapical radiograph confirm pulpal pathology'}.`,
  D3320: ({ tooth, findings }) =>
    `Premolar endodontic therapy on tooth #${tooth || '[#]'} is necessary — ${findings || 'clinical testing and periapical radiograph confirm pulpal pathology'}.`,
  D3330: ({ tooth, findings }) =>
    `Molar endodontic therapy on tooth #${tooth || '[#]'} is necessary — ${findings || 'clinical testing and periapical radiograph confirm pulpal pathology'}.`,
  D4341: ({ findings }) =>
    `Scaling and root planing (4+ teeth per quadrant) is necessary — ${findings || 'periodontal charting demonstrates probing depths ≥4 mm with bleeding on probing and radiographic evidence of bone loss'}.`,
  D7140: ({ tooth, findings }) =>
    `Extraction of tooth #${tooth || '[#]'} is necessary — ${findings || 'tooth is non-restorable secondary to caries extending into the pulp; periapical radiograph confirms pathology'}.`,
  D7210: ({ tooth, findings }) =>
    `Surgical extraction of tooth #${tooth || '[#]'} is necessary — ${findings || 'sectioning and/or bone removal required for safe delivery; documented in operative note'}.`
}

// Returns a list of {code, sentence} medical-necessity statements for the
// given treatmentRendered array. Items without a template are silently skipped.
export function buildMedicalNecessitySentences(treatmentRendered) {
  if (!Array.isArray(treatmentRendered)) return []
  return treatmentRendered
    .map((item) => {
      const tmpl = MEDICAL_NECESSITY_TEMPLATES[item.cdtCode]
      if (!tmpl) return null
      return {
        code: item.cdtCode,
        sentence: tmpl({
          tooth: item.teeth?.[0] || '',
          surfaces: item.surfaces?.join('') || '',
          findings: ''
        })
      }
    })
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Coding-correctness & consistency validation (structured data, pre-generation)
// ---------------------------------------------------------------------------

// Surface-count and arch rules for surface-based restorative codes.
// `surfaces`: exact count (number) or { min } for "N+". `arch` (optional):
// the dental arch the code is restricted to.
export const CDT_CODING_RULES = {
  D2140: { surfaces: 1 },
  D2150: { surfaces: 2 },
  D2330: { surfaces: 1, arch: 'anterior' },
  D2331: { surfaces: 2, arch: 'anterior' },
  D2391: { surfaces: 1, arch: 'posterior' },
  D2392: { surfaces: 2, arch: 'posterior' },
  D2393: { surfaces: 3, arch: 'posterior' },
  D2394: { surfaces: { min: 4 }, arch: 'posterior' }
}

const ANTERIOR_TEETH = new Set([6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27])
const POSTERIOR_TEETH = new Set([1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 28, 29, 30, 31, 32])

// Returns 'anterior' | 'posterior' | null. null for non-numeric entries
// (e.g. quadrant labels like "UR") so arch checks are skipped on those.
export function toothArch(tooth) {
  const n = Number(tooth)
  if (!Number.isInteger(n)) return null
  if (ANTERIOR_TEETH.has(n)) return 'anterior'
  if (POSTERIOR_TEETH.has(n)) return 'posterior'
  return null
}

// Validates surface count, surface/tooth presence, and tooth arch against
// CDT_CODING_RULES. Returns [{ code, severity:'error', message }].
export function validateTreatmentCoding(treatmentRendered) {
  if (!Array.isArray(treatmentRendered)) return []
  const issues = []
  for (const item of treatmentRendered) {
    const rule = CDT_CODING_RULES[item.cdtCode]
    if (!rule) continue
    const surfaces = item.surfaces || []
    const teeth = item.teeth || []

    if (!teeth.length) {
      issues.push({ code: item.cdtCode, severity: 'error', message: `${item.cdtCode} requires a tooth number to be documented.` })
    }

    if (typeof rule.surfaces === 'number') {
      if (surfaces.length !== rule.surfaces) {
        const word = rule.surfaces === 1 ? 'one surface' : `${rule.surfaces} surfaces`
        issues.push({
          code: item.cdtCode,
          severity: 'error',
          message: `${item.cdtCode} requires exactly ${word} (found ${surfaces.length}${surfaces.length ? `: ${surfaces.join(', ')}` : ''}).`
        })
      }
    } else if (rule.surfaces?.min != null) {
      if (surfaces.length < rule.surfaces.min) {
        issues.push({
          code: item.cdtCode,
          severity: 'error',
          message: `${item.cdtCode} requires at least ${rule.surfaces.min} surfaces (found ${surfaces.length}).`
        })
      }
    }

    if (rule.arch) {
      for (const t of teeth) {
        const arch = toothArch(t)
        if (arch && arch !== rule.arch) {
          issues.push({
            code: item.cdtCode,
            severity: 'error',
            message: `${item.cdtCode} is a ${rule.arch} code but tooth #${t} is ${arch}.`
          })
        }
      }
    }
  }
  return issues
}

// Warn-level: for each rendered code with a crosswalk entry, check that the
// documented diagnoses reference one of the code's expected ICD-10 codes.
// Returns [{ code, severity:'warn', message }].
export function diagnosisIcdMismatch(treatmentRendered, diagnoses) {
  if (!Array.isArray(treatmentRendered)) return []
  const dxText = (diagnoses || []).join(' ')
  const issues = []
  for (const item of treatmentRendered) {
    const entry = lookupCrosswalk(item.cdtCode)
    if (!entry) continue
    const expected = [entry.primary?.icd, ...(entry.alts || []).map((a) => a.icd)].filter(Boolean)
    if (!expected.length) continue
    const matched = expected.some((icd) => dxText.includes(icd))
    if (!matched) {
      issues.push({
        code: item.cdtCode,
        severity: 'warn',
        message: `${item.cdtCode} (${entry.desc}) has no matching ICD-10 in the diagnoses — expected one of ${expected.join(', ')}.`
      })
    }
  }
  return issues
}

// CDT pairs that cannot be billed together on one encounter (hard), or that
// warrant a same-tooth/quadrant verification (caution).
export const CDT_CONFLICTS = {
  hard: [
    { pair: ['D0120', 'D0150'], message: 'D0120 (periodic exam) and D0150 (comprehensive exam) cannot both be billed on the same encounter.' },
    { pair: ['D1110', 'D1120'], message: 'D1110 (adult prophylaxis) and D1120 (child prophylaxis) cannot both be billed for the same patient.' }
  ],
  caution: [
    { pair: ['D7140', 'D7210'], message: 'D7140 (simple) and D7210 (surgical) extraction on one encounter — confirm they are for different teeth.' },
    { pair: ['D1110', 'D4341'], message: 'Prophylaxis (D1110) and SRP (D4341) same day — confirm different quadrants; same-quadrant is commonly denied.' },
    { pair: ['D1120', 'D4341'], message: 'Prophylaxis (D1120) and SRP (D4341) same day — confirm different quadrants.' },
    { pair: ['D1110', 'D4342'], message: 'Prophylaxis (D1110) and SRP (D4342) same day — confirm different quadrants.' },
    { pair: ['D1120', 'D4342'], message: 'Prophylaxis (D1120) and SRP (D4342) same day — confirm different quadrants.' },
    { pair: ['D1110', 'D4910'], message: 'Prophylaxis (D1110) and periodontal maintenance (D4910) are generally not billable together.' },
    { pair: ['D1120', 'D4910'], message: 'Prophylaxis (D1120) and periodontal maintenance (D4910) are generally not billable together.' }
  ]
}

// Scans a list of CDT codes (order-independent) for conflicting pairs.
// Returns [{ severity: 'error'|'warn', codes: [a, b], message }].
export function detectCdtConflicts(codes) {
  const present = new Set((codes || []).filter(Boolean).map((c) => c.toUpperCase()))
  const out = []
  const scan = (list, severity) => {
    for (const { pair, message } of list) {
      if (present.has(pair[0]) && present.has(pair[1])) out.push({ severity, codes: pair, message })
    }
  }
  scan(CDT_CONFLICTS.hard, 'error')
  scan(CDT_CONFLICTS.caution, 'warn')
  return out
}

// Advisory documentation reminders for high-audit-risk codes when present.
const CATEGORY_DOC_REMINDERS = {
  D9230: 'Nitrous oxide (D9230): document indication, monitoring, duration, and return to baseline.',
  D7210: 'Surgical extraction (D7210): document surgical complexity — flap, bone removal, and/or sectioning.'
}

export function categoryDocReminders(codes) {
  const present = new Set((codes || []).filter(Boolean).map((c) => c.toUpperCase()))
  return Object.entries(CATEGORY_DOC_REMINDERS)
    .filter(([code]) => present.has(code))
    .map(([code, message]) => ({ code, message }))
}
