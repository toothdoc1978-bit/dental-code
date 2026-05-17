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
  { value: 'emergency', label: 'Emergency' }
]

export const PATIENT_TYPES = [
  { value: 'epsdt', label: 'EPSDT Child (Medicaid/MCNA)', desc: 'Adds EPSDT screening step' },
  { value: 'child', label: 'General Child', desc: 'Pediatric, non-EPSDT' },
  { value: 'adult', label: 'General Adult', desc: 'Adult patient' }
]
