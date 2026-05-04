// =============================================================================
// Clinical Sidecar — MCNA Medicaid Payer Rules
// Frequency limitations, age restrictions, mutual exclusions,
// EPSDT requirements, documentation red flags, and attachment rules
// =============================================================================

// ---------------------------------------------------------------------------
// Frequency Limitations
// ---------------------------------------------------------------------------

export interface FrequencyRule {
  cdtCode: string;
  description: string;
  interval: FrequencyInterval;
  ageMin?: number;
  ageMax?: number;
  notes: string;
}

export interface FrequencyInterval {
  quantity: number;
  unit: 'days' | 'months' | 'years' | 'per_lifetime' | 'per_benefit_year';
  perArch?: boolean;
  perQuadrant?: boolean;
  perTooth?: boolean;
}

export const FREQUENCY_RULES: FrequencyRule[] = [
  // Fluoride
  {
    cdtCode: 'D1206',
    description: 'Topical fluoride varnish',
    interval: { quantity: 6, unit: 'months' },
    ageMax: 20,
    notes: 'Two applications per benefit year for patients under 21. Must document caries risk assessment.',
  },
  {
    cdtCode: 'D1208',
    description: 'Topical fluoride (excluding varnish)',
    interval: { quantity: 6, unit: 'months' },
    ageMax: 20,
    notes: 'Two applications per benefit year for patients under 21. Not billable same day as D1206.',
  },

  // Bitewings
  {
    cdtCode: 'D0272',
    description: 'Bitewings — two images',
    interval: { quantity: 12, unit: 'months' },
    notes: 'Once per 12 months. Medical necessity override available for high caries risk with documentation.',
  },
  {
    cdtCode: 'D0274',
    description: 'Bitewings — four images',
    interval: { quantity: 12, unit: 'months' },
    notes: 'Once per 12 months. Cannot bill same day as D0272. Medical necessity override for high caries risk.',
  },
  {
    cdtCode: 'D0277',
    description: 'Vertical bitewings — 7 to 8 images',
    interval: { quantity: 12, unit: 'months' },
    notes: 'Once per 12 months. Requires periodontal diagnosis justification. Cannot bill with D0272 or D0274.',
  },

  // Complete series / panoramic
  {
    cdtCode: 'D0210',
    description: 'Complete series of radiographic images',
    interval: { quantity: 3, unit: 'years' },
    notes: 'Once per 3 years. Cannot bill same day as panoramic (D0330). Medical necessity can override.',
  },
  {
    cdtCode: 'D0330',
    description: 'Panoramic radiographic image',
    interval: { quantity: 3, unit: 'years' },
    notes: 'Once per 3 years. Cannot bill same day as complete series (D0210).',
  },

  // Sealants
  {
    cdtCode: 'D1351',
    description: 'Sealant — per tooth',
    interval: { quantity: 3, unit: 'years', perTooth: true },
    ageMin: 6,
    ageMax: 15,
    notes: 'Permanent molars and premolars only. Tooth must be caries-free and unrestored. Ages 6-15.',
  },
  {
    cdtCode: 'D1353',
    description: 'Sealant repair — per tooth',
    interval: { quantity: 12, unit: 'months', perTooth: true },
    ageMin: 6,
    ageMax: 15,
    notes: 'Once per tooth per 12 months. Must have prior sealant on record.',
  },

  // Prophylaxis
  {
    cdtCode: 'D1110',
    description: 'Prophylaxis — adult',
    interval: { quantity: 6, unit: 'months' },
    ageMin: 14,
    notes: 'Two per benefit year. Not billable same day as D4910 or D4346.',
  },
  {
    cdtCode: 'D1120',
    description: 'Prophylaxis — child',
    interval: { quantity: 6, unit: 'months' },
    ageMax: 13,
    notes: 'Two per benefit year. Not billable same day as D4910 or D4346.',
  },

  // SRP
  {
    cdtCode: 'D4341',
    description: 'SRP — four or more teeth per quadrant',
    interval: { quantity: 24, unit: 'months', perQuadrant: true },
    notes: 'Once per quadrant per 24 months. Requires full perio charting with 4mm+ pockets and bone loss documentation.',
  },
  {
    cdtCode: 'D4342',
    description: 'SRP — one to three teeth per quadrant',
    interval: { quantity: 24, unit: 'months', perQuadrant: true },
    notes: 'Once per quadrant per 24 months. Cannot be billed same quadrant same day as D4341.',
  },

  // Periodontal maintenance
  {
    cdtCode: 'D4910',
    description: 'Periodontal maintenance',
    interval: { quantity: 3, unit: 'months' },
    notes: 'Up to four per benefit year. Must have prior history of active periodontal therapy (D4341/D4342). Not billable same day as D1110 or D1120.',
  },

  // Full mouth debridement
  {
    cdtCode: 'D4355',
    description: 'Full mouth debridement',
    interval: { quantity: 1, unit: 'per_lifetime' },
    notes: 'Once per lifetime. Must document inability to perform comprehensive evaluation due to calculus. Comprehensive eval must follow.',
  },

  // Scaling in presence of inflammation
  {
    cdtCode: 'D4346',
    description: 'Scaling in presence of generalized moderate or severe gingival inflammation',
    interval: { quantity: 12, unit: 'months' },
    notes: 'Once per 12 months. Not billable same day as D1110, D1120, D4341, or D4342.',
  },

  // Evaluations
  {
    cdtCode: 'D0120',
    description: 'Periodic oral evaluation',
    interval: { quantity: 6, unit: 'months' },
    notes: 'Two per benefit year. Not billable same day as D0150 or D0180.',
  },
  {
    cdtCode: 'D0150',
    description: 'Comprehensive oral evaluation',
    interval: { quantity: 3, unit: 'years' },
    notes: 'Once per 3 years for established patients. New patient: once per provider. Not billable same day as D0120 or D0180.',
  },
  {
    cdtCode: 'D0180',
    description: 'Comprehensive periodontal evaluation',
    interval: { quantity: 3, unit: 'years' },
    notes: 'Once per 3 years. Must document periodontal findings. Not billable same day as D0120 or D0150.',
  },

  // Crowns
  {
    cdtCode: 'D2740',
    description: 'Crown — porcelain/ceramic',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization. Must document why restoration is not sufficient.',
  },
  {
    cdtCode: 'D2750',
    description: 'Crown — porcelain fused to high noble metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D2751',
    description: 'Crown — porcelain fused to predominantly base metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D2752',
    description: 'Crown — porcelain fused to noble metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D2790',
    description: 'Crown — full cast high noble metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D2791',
    description: 'Crown — full cast predominantly base metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D2792',
    description: 'Crown — full cast noble metal',
    interval: { quantity: 5, unit: 'years', perTooth: true },
    notes: 'Once per tooth per 5 years. Requires pre-authorization.',
  },

  // Dentures
  {
    cdtCode: 'D5110',
    description: 'Complete denture — maxillary',
    interval: { quantity: 5, unit: 'years', perArch: true },
    notes: 'Once per arch per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D5120',
    description: 'Complete denture — mandibular',
    interval: { quantity: 5, unit: 'years', perArch: true },
    notes: 'Once per arch per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D5211',
    description: 'Maxillary partial denture — resin base',
    interval: { quantity: 5, unit: 'years', perArch: true },
    notes: 'Once per arch per 5 years. Requires pre-authorization.',
  },
  {
    cdtCode: 'D5212',
    description: 'Mandibular partial denture — resin base',
    interval: { quantity: 5, unit: 'years', perArch: true },
    notes: 'Once per arch per 5 years. Requires pre-authorization.',
  },

  // Endodontics
  {
    cdtCode: 'D3310',
    description: 'Root canal — anterior',
    interval: { quantity: 1, unit: 'per_lifetime', perTooth: true },
    notes: 'Once per tooth per lifetime. Retreatment codes (D3346) must be used for re-treatment.',
  },
  {
    cdtCode: 'D3320',
    description: 'Root canal — premolar',
    interval: { quantity: 1, unit: 'per_lifetime', perTooth: true },
    notes: 'Once per tooth per lifetime. Retreatment codes (D3347) must be used for re-treatment.',
  },
  {
    cdtCode: 'D3330',
    description: 'Root canal — molar',
    interval: { quantity: 1, unit: 'per_lifetime', perTooth: true },
    notes: 'Once per tooth per lifetime. Retreatment codes (D3348) must be used for re-treatment.',
  },

  // Nitrous oxide
  {
    cdtCode: 'D9230',
    description: 'Nitrous oxide / anxiolysis',
    interval: { quantity: 1, unit: 'days' },
    notes: 'Once per date of service. Must document start/stop times, patient response, and ASA classification.',
  },
];

// ---------------------------------------------------------------------------
// Age Restrictions
// ---------------------------------------------------------------------------

export interface AgeRestriction {
  cdtCode: string;
  description: string;
  minAge?: number;
  maxAge?: number;
  epsdtOverride: boolean;
  notes: string;
}

export const AGE_RESTRICTIONS: AgeRestriction[] = [
  {
    cdtCode: 'D1120',
    description: 'Prophylaxis — child',
    maxAge: 13,
    epsdtOverride: false,
    notes: 'Patients 13 and under. Use D1110 for patients 14 and older.',
  },
  {
    cdtCode: 'D1110',
    description: 'Prophylaxis — adult',
    minAge: 14,
    epsdtOverride: false,
    notes: 'Patients 14 and older. Use D1120 for patients 13 and under.',
  },
  {
    cdtCode: 'D1351',
    description: 'Sealant — per tooth',
    minAge: 6,
    maxAge: 15,
    epsdtOverride: true,
    notes: 'Standard coverage ages 6-15 for permanent molars/premolars. EPSDT may extend to age 20.',
  },
  {
    cdtCode: 'D1353',
    description: 'Sealant repair — per tooth',
    minAge: 6,
    maxAge: 15,
    epsdtOverride: true,
    notes: 'Standard coverage ages 6-15. EPSDT may extend to age 20.',
  },
  {
    cdtCode: 'D1206',
    description: 'Topical fluoride varnish',
    maxAge: 20,
    epsdtOverride: true,
    notes: 'Covered for patients under 21. Adults may be covered under medical necessity with EPSDT exception.',
  },
  {
    cdtCode: 'D1208',
    description: 'Topical fluoride (excluding varnish)',
    maxAge: 20,
    epsdtOverride: true,
    notes: 'Covered for patients under 21.',
  },
  {
    cdtCode: 'D3230',
    description: 'Pulpal therapy — anterior, primary tooth',
    maxAge: 12,
    epsdtOverride: false,
    notes: 'Primary teeth only. Generally not applicable beyond age 12.',
  },
  {
    cdtCode: 'D3240',
    description: 'Pulpal therapy — posterior, primary tooth',
    maxAge: 12,
    epsdtOverride: false,
    notes: 'Primary teeth only. Generally not applicable beyond age 12.',
  },
  {
    cdtCode: 'D3222',
    description: 'Partial pulpotomy for apexogenesis',
    minAge: 6,
    maxAge: 18,
    epsdtOverride: false,
    notes: 'Permanent teeth with incomplete root development. Typically ages 6-18.',
  },
  {
    cdtCode: 'D9239',
    description: 'IV moderate (conscious) sedation — first 15 min',
    minAge: 2,
    epsdtOverride: false,
    notes: 'Minimum age 2 years. Must have appropriate monitoring equipment and trained personnel.',
  },
];

// ---------------------------------------------------------------------------
// Mutually Exclusive Code Pairs
// ---------------------------------------------------------------------------

export interface MutualExclusion {
  code1: string;
  code2: string;
  scope: 'same_day' | 'same_quadrant_same_day' | 'same_tooth_same_day' | 'same_arch_same_day';
  description: string;
}

export const MUTUAL_EXCLUSIONS: MutualExclusion[] = [
  {
    code1: 'D1110',
    code2: 'D1120',
    scope: 'same_day',
    description: 'Adult and child prophylaxis cannot be billed on the same date of service.',
  },
  {
    code1: 'D1110',
    code2: 'D4910',
    scope: 'same_day',
    description: 'Prophylaxis and periodontal maintenance are mutually exclusive on the same date.',
  },
  {
    code1: 'D1120',
    code2: 'D4910',
    scope: 'same_day',
    description: 'Child prophylaxis and periodontal maintenance are mutually exclusive on the same date.',
  },
  {
    code1: 'D1110',
    code2: 'D4346',
    scope: 'same_day',
    description: 'Prophylaxis and scaling in presence of inflammation are mutually exclusive on the same date.',
  },
  {
    code1: 'D1120',
    code2: 'D4346',
    scope: 'same_day',
    description: 'Child prophylaxis and scaling in presence of inflammation are mutually exclusive on the same date.',
  },
  {
    code1: 'D4341',
    code2: 'D4346',
    scope: 'same_day',
    description: 'SRP and scaling in presence of inflammation are mutually exclusive on the same date.',
  },
  {
    code1: 'D4342',
    code2: 'D4346',
    scope: 'same_day',
    description: 'SRP (1-3 teeth) and scaling in presence of inflammation are mutually exclusive on the same date.',
  },
  {
    code1: 'D4341',
    code2: 'D4342',
    scope: 'same_quadrant_same_day',
    description: 'D4341 and D4342 cannot be billed in the same quadrant on the same date.',
  },
  {
    code1: 'D4910',
    code2: 'D4346',
    scope: 'same_day',
    description: 'Periodontal maintenance and scaling in presence of inflammation are mutually exclusive.',
  },
  {
    code1: 'D0210',
    code2: 'D0330',
    scope: 'same_day',
    description: 'Complete series and panoramic cannot be billed on the same date.',
  },
  {
    code1: 'D0272',
    code2: 'D0274',
    scope: 'same_day',
    description: 'Two-film bitewings and four-film bitewings cannot be billed on the same date.',
  },
  {
    code1: 'D0272',
    code2: 'D0277',
    scope: 'same_day',
    description: 'Two-film bitewings and vertical bitewings cannot be billed on the same date.',
  },
  {
    code1: 'D0274',
    code2: 'D0277',
    scope: 'same_day',
    description: 'Four-film bitewings and vertical bitewings cannot be billed on the same date.',
  },
  {
    code1: 'D0120',
    code2: 'D0150',
    scope: 'same_day',
    description: 'Periodic eval and comprehensive eval cannot be billed on the same date.',
  },
  {
    code1: 'D0120',
    code2: 'D0180',
    scope: 'same_day',
    description: 'Periodic eval and comprehensive periodontal eval cannot be billed on the same date.',
  },
  {
    code1: 'D0150',
    code2: 'D0180',
    scope: 'same_day',
    description: 'Comprehensive eval and comprehensive periodontal eval cannot be billed on the same date.',
  },
  {
    code1: 'D1206',
    code2: 'D1208',
    scope: 'same_day',
    description: 'Fluoride varnish and other fluoride application cannot be billed on the same date.',
  },
  {
    code1: 'D2335',
    code2: 'D2390',
    scope: 'same_tooth_same_day',
    description: '4+ surface anterior composite and composite crown cannot be billed on the same tooth same date.',
  },
  {
    code1: 'D4355',
    code2: 'D1110',
    scope: 'same_day',
    description: 'Full mouth debridement and prophylaxis cannot be billed on the same date.',
  },
  {
    code1: 'D4355',
    code2: 'D1120',
    scope: 'same_day',
    description: 'Full mouth debridement and child prophylaxis cannot be billed on the same date.',
  },
  {
    code1: 'D4355',
    code2: 'D4341',
    scope: 'same_day',
    description: 'Full mouth debridement and SRP cannot be billed on the same date.',
  },
  {
    code1: 'D4355',
    code2: 'D4342',
    scope: 'same_day',
    description: 'Full mouth debridement and SRP (1-3 teeth) cannot be billed on the same date.',
  },
  {
    code1: 'D7140',
    code2: 'D7210',
    scope: 'same_tooth_same_day',
    description: 'Simple extraction and surgical extraction cannot be billed on the same tooth same date.',
  },
];

// ---------------------------------------------------------------------------
// EPSDT (Early and Periodic Screening, Diagnostic, and Treatment) Requirements
// ---------------------------------------------------------------------------

export interface EPSDTRequirement {
  ageMax: number;
  description: string;
  coverageExtensions: string[];
  documentationRequirements: string[];
  screeningSchedule: EPSDTScreeningInterval[];
}

export interface EPSDTScreeningInterval {
  ageRange: string;
  frequency: string;
  services: string[];
}

export const EPSDT_REQUIREMENTS: EPSDTRequirement = {
  ageMax: 20,
  description:
    'EPSDT (Early and Periodic Screening, Diagnostic, and Treatment) provides comprehensive preventive health care services for Medicaid-eligible children under age 21. Dental services must be provided at intervals meeting reasonable standards of dental practice and at other intervals as medically necessary.',
  coverageExtensions: [
    'Sealants may be extended beyond standard age limits when medically necessary',
    'Fluoride treatments may be provided more frequently for high caries risk patients',
    'Orthodontic coverage when handicapping malocclusion is documented',
    'Sedation services when behavioral management alone is insufficient',
    'Additional restorative services beyond standard frequency when medically necessary',
    'Prior authorization requirements may be waived for medically necessary services',
  ],
  documentationRequirements: [
    'Document EPSDT screening was performed',
    'Document all findings from the screening',
    'Document referrals made as a result of the screening',
    'Document medical necessity for any services exceeding standard frequency limits',
    'Maintain separate EPSDT screening form in the patient record',
    'Document guardian/parent presence and consent',
  ],
  screeningSchedule: [
    {
      ageRange: '6-12 months',
      frequency: 'First dental visit by age 1',
      services: ['D0145', 'D1206', 'D1310'],
    },
    {
      ageRange: '1-3 years',
      frequency: 'Every 6 months',
      services: ['D0120', 'D1120', 'D1206', 'D0220'],
    },
    {
      ageRange: '3-6 years',
      frequency: 'Every 6 months',
      services: ['D0120', 'D1120', 'D1206', 'D0272'],
    },
    {
      ageRange: '6-12 years',
      frequency: 'Every 6 months',
      services: ['D0120', 'D1120', 'D1206', 'D0272', 'D1351'],
    },
    {
      ageRange: '12-20 years',
      frequency: 'Every 6 months',
      services: ['D0120', 'D1110', 'D1206', 'D0274', 'D1351'],
    },
  ],
};

// ---------------------------------------------------------------------------
// Documentation Red Flags / Auto-Deny Triggers
// ---------------------------------------------------------------------------

export interface DocumentationRedFlag {
  id: string;
  category: 'missing_documentation' | 'pattern_anomaly' | 'coding_error' | 'frequency_violation' | 'medical_necessity';
  severity: 'warning' | 'auto_deny' | 'audit_trigger';
  description: string;
  affectedCodes: string[];
  resolution: string;
}

export const DOCUMENTATION_RED_FLAGS: DocumentationRedFlag[] = [
  // Missing Documentation
  {
    id: 'RF001',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'SRP billed without full-mouth periodontal charting on file',
    affectedCodes: ['D4341', 'D4342'],
    resolution: 'Ensure complete periodontal charting with probing depths, BOP, and CAL is documented before or on the date of SRP.',
  },
  {
    id: 'RF002',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'Crown billed without pre-operative radiograph',
    affectedCodes: ['D2740', 'D2750', 'D2751', 'D2752', 'D2780', 'D2781', 'D2783', 'D2790', 'D2791', 'D2792'],
    resolution: 'Attach pre-operative radiograph clearly showing the tooth requiring the crown.',
  },
  {
    id: 'RF003',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'Root canal billed without pre-operative and post-operative radiographs',
    affectedCodes: ['D3310', 'D3320', 'D3330', 'D3346', 'D3347', 'D3348'],
    resolution: 'Attach pre-operative radiograph showing pathology and post-operative radiograph confirming obturation.',
  },
  {
    id: 'RF004',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'Surgical extraction billed without documentation of surgical necessity (bone removal or sectioning)',
    affectedCodes: ['D7210'],
    resolution: 'Document specifically what made the extraction surgical: bone removal, tooth sectioning, or flap elevation.',
  },
  {
    id: 'RF005',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'Impacted tooth removal billed without radiographic confirmation of impaction',
    affectedCodes: ['D7220', 'D7230', 'D7240', 'D7241'],
    resolution: 'Attach panoramic or periapical radiograph clearly showing impaction classification.',
  },
  {
    id: 'RF006',
    category: 'missing_documentation',
    severity: 'auto_deny',
    description: 'Sedation billed without time documentation, monitoring records, or ASA classification',
    affectedCodes: ['D9230', 'D9239', 'D9243'],
    resolution: 'Document start time, end time, vital signs monitoring, ASA classification, and recovery/discharge criteria.',
  },
  {
    id: 'RF007',
    category: 'missing_documentation',
    severity: 'warning',
    description: 'Periodontal maintenance (D4910) billed without prior SRP history on file',
    affectedCodes: ['D4910'],
    resolution: 'Ensure prior D4341 or D4342 treatment is documented in the patient record before billing D4910.',
  },

  // Pattern Anomalies
  {
    id: 'RF008',
    category: 'pattern_anomaly',
    severity: 'audit_trigger',
    description: 'Multiple four-surface restorations on the same date of service (3+ per visit)',
    affectedCodes: ['D2161', 'D2335', 'D2394'],
    resolution: 'Document individual clinical justification for each four-surface restoration. Consider whether crowns are more appropriate.',
  },
  {
    id: 'RF009',
    category: 'pattern_anomaly',
    severity: 'audit_trigger',
    description: 'Full-mouth SRP (all four quadrants) completed on same date of service',
    affectedCodes: ['D4341', 'D4342'],
    resolution: 'While not prohibited, full-mouth SRP in one visit is an audit trigger. Document medical necessity if all quadrants are treated same day.',
  },
  {
    id: 'RF010',
    category: 'pattern_anomaly',
    severity: 'audit_trigger',
    description: 'Crown placed on same tooth within 6 months of large restoration',
    affectedCodes: ['D2740', 'D2750', 'D2751', 'D2752', 'D2790', 'D2791', 'D2792'],
    resolution: 'Document why the restoration failed or was insufficient, and why a crown is now necessary.',
  },
  {
    id: 'RF011',
    category: 'pattern_anomaly',
    severity: 'audit_trigger',
    description: 'High volume of extractions on a single date of service (5+ teeth)',
    affectedCodes: ['D7140', 'D7210', 'D7220', 'D7230', 'D7240', 'D7241'],
    resolution: 'Document individual justification for each extraction. Consider whether full-mouth extraction warrants general anesthesia referral.',
  },
  {
    id: 'RF012',
    category: 'pattern_anomaly',
    severity: 'audit_trigger',
    description: 'Nitrous oxide billed for routine prophylaxis without documented behavioral or medical justification',
    affectedCodes: ['D9230'],
    resolution: 'Document specific behavioral, medical, or anxiety-related reasons necessitating nitrous oxide for routine procedures.',
  },

  // Coding Errors
  {
    id: 'RF013',
    category: 'coding_error',
    severity: 'auto_deny',
    description: 'Adult prophylaxis (D1110) billed for patient under age 14',
    affectedCodes: ['D1110'],
    resolution: 'Use D1120 (child prophylaxis) for patients under age 14.',
  },
  {
    id: 'RF014',
    category: 'coding_error',
    severity: 'auto_deny',
    description: 'Child prophylaxis (D1120) billed for patient age 14 or older',
    affectedCodes: ['D1120'],
    resolution: 'Use D1110 (adult prophylaxis) for patients age 14 and older.',
  },
  {
    id: 'RF015',
    category: 'coding_error',
    severity: 'auto_deny',
    description: 'Sealant billed on a tooth with an existing restoration',
    affectedCodes: ['D1351'],
    resolution: 'Sealants are only covered on caries-free, unrestored teeth. If the tooth has an existing restoration, the sealant will be denied.',
  },
  {
    id: 'RF016',
    category: 'coding_error',
    severity: 'auto_deny',
    description: 'D4910 billed without prior active periodontal therapy in claim history',
    affectedCodes: ['D4910'],
    resolution: 'D4910 requires a documented history of active periodontal therapy (D4341/D4342). Cannot be used as a substitute for D1110.',
  },
  {
    id: 'RF017',
    category: 'coding_error',
    severity: 'warning',
    description: 'D2335 (4+ surface anterior) billed when D2390 (composite crown) may be more appropriate',
    affectedCodes: ['D2335'],
    resolution: 'Review whether the extent of tooth structure loss warrants billing as a composite crown (D2390) rather than a multi-surface restoration.',
  },
  {
    id: 'RF018',
    category: 'coding_error',
    severity: 'warning',
    description: 'Root canal billed on primary tooth — should use pulpotomy/pulpal therapy codes',
    affectedCodes: ['D3310', 'D3320', 'D3330'],
    resolution: 'For primary teeth, use D3220 (pulpotomy), D3230 (pulpal therapy anterior), or D3240 (pulpal therapy posterior).',
  },

  // Frequency Violations
  {
    id: 'RF019',
    category: 'frequency_violation',
    severity: 'auto_deny',
    description: 'Prophylaxis billed within 5 months of prior prophylaxis',
    affectedCodes: ['D1110', 'D1120'],
    resolution: 'Prophylaxis is covered once per 6-month interval. If more frequent cleaning is needed, document medical necessity.',
  },
  {
    id: 'RF020',
    category: 'frequency_violation',
    severity: 'auto_deny',
    description: 'Bitewings billed within 11 months of prior bitewings',
    affectedCodes: ['D0272', 'D0274', 'D0277'],
    resolution: 'Bitewings are covered once per 12-month interval. Document medical necessity if more frequent imaging is clinically required.',
  },
  {
    id: 'RF021',
    category: 'frequency_violation',
    severity: 'auto_deny',
    description: 'Complete series or panoramic billed within 2 years of prior complete series or panoramic',
    affectedCodes: ['D0210', 'D0330'],
    resolution: 'Complete series and panoramic images are covered once per 3 years. Document medical necessity for earlier imaging.',
  },
  {
    id: 'RF022',
    category: 'frequency_violation',
    severity: 'auto_deny',
    description: 'SRP billed in same quadrant within 23 months of prior SRP',
    affectedCodes: ['D4341', 'D4342'],
    resolution: 'SRP is covered once per quadrant per 24 months. Document medical necessity if earlier retreatment is required.',
  },
  {
    id: 'RF023',
    category: 'frequency_violation',
    severity: 'auto_deny',
    description: 'Crown replacement billed within 4 years of prior crown on same tooth',
    affectedCodes: ['D2740', 'D2750', 'D2751', 'D2752', 'D2790', 'D2791', 'D2792'],
    resolution: 'Crowns are covered once per tooth per 5 years. Document medical necessity with narrative and radiographic evidence if earlier replacement is needed.',
  },

  // Medical Necessity
  {
    id: 'RF024',
    category: 'medical_necessity',
    severity: 'warning',
    description: 'ICD-10 code does not support the billed CDT procedure',
    affectedCodes: [],
    resolution: 'Ensure the ICD-10 diagnosis code supports medical necessity for the procedure. Use the most specific code available.',
  },
  {
    id: 'RF025',
    category: 'medical_necessity',
    severity: 'warning',
    description: 'Caries diagnosis (K02.x) used for periodontal procedure',
    affectedCodes: ['D4341', 'D4342', 'D4346', 'D4910'],
    resolution: 'Periodontal procedures require a periodontal diagnosis (K05.x). Caries codes are not appropriate for SRP or perio maintenance.',
  },
  {
    id: 'RF026',
    category: 'medical_necessity',
    severity: 'warning',
    description: 'Gingivitis diagnosis (K05.0x, K05.1x) used with SRP codes instead of D4346',
    affectedCodes: ['D4341', 'D4342'],
    resolution: 'SRP requires periodontitis diagnosis (K05.2x, K05.3x) with documented bone loss. Gingivitis alone supports D4346 or D1110, not SRP.',
  },
  {
    id: 'RF027',
    category: 'medical_necessity',
    severity: 'auto_deny',
    description: 'Extraction billed without supporting diagnosis or documented reason',
    affectedCodes: ['D7140', 'D7210', 'D7220', 'D7230', 'D7240', 'D7241', 'D7250'],
    resolution: 'Document the specific reason for extraction: non-restorable caries, periodontal disease, fracture, impaction, orthodontic necessity, etc.',
  },
];

// ---------------------------------------------------------------------------
// Attachment Recommendations Per Procedure Type
// ---------------------------------------------------------------------------

export interface AttachmentRecommendation {
  category: string;
  cdtCodes: string[];
  requiredAttachments: AttachmentSpec[];
  optionalAttachments: AttachmentSpec[];
  narrativeRequired: boolean;
  narrativeGuidelines: string[];
}

export interface AttachmentSpec {
  type: string;
  description: string;
  format: string;
  timingRequirement: string;
}

export const ATTACHMENT_RECOMMENDATIONS: AttachmentRecommendation[] = [
  {
    category: 'Restorations (Composites/Amalgam)',
    cdtCodes: ['D2140', 'D2150', 'D2160', 'D2161', 'D2330', 'D2331', 'D2332', 'D2335', 'D2390', 'D2391', 'D2392', 'D2393', 'D2394'],
    requiredAttachments: [
      {
        type: 'pre_op_radiograph',
        description: 'Pre-operative radiograph showing carious lesion',
        format: 'Digital radiograph (DICOM or high-resolution image)',
        timingRequirement: 'Taken within 6 months prior to or on date of service',
      },
    ],
    optionalAttachments: [
      {
        type: 'pre_op_photo',
        description: 'Intraoral photograph showing the lesion before treatment',
        format: 'High-resolution digital photograph',
        timingRequirement: 'Taken on date of service, before treatment',
      },
      {
        type: 'post_op_photo',
        description: 'Intraoral photograph showing completed restoration',
        format: 'High-resolution digital photograph',
        timingRequirement: 'Taken on date of service, after treatment',
      },
    ],
    narrativeRequired: false,
    narrativeGuidelines: [
      'Narrative recommended for 4+ surface restorations',
      'Document caries depth (enamel, dentin, near pulp)',
      'For D2335/D2394: explain why crown was not indicated',
    ],
  },
  {
    category: 'Crowns',
    cdtCodes: ['D2740', 'D2750', 'D2751', 'D2752', 'D2780', 'D2781', 'D2783', 'D2790', 'D2791', 'D2792', 'D2794'],
    requiredAttachments: [
      {
        type: 'pre_op_radiograph',
        description: 'Pre-operative radiograph showing tooth condition',
        format: 'Digital radiograph (DICOM or high-resolution image)',
        timingRequirement: 'Taken within 6 months prior to or on date of service',
      },
      {
        type: 'pre_op_photo',
        description: 'Intraoral photograph showing the tooth requiring the crown',
        format: 'High-resolution digital photograph',
        timingRequirement: 'Taken on date of service, before preparation',
      },
    ],
    optionalAttachments: [
      {
        type: 'post_op_photo',
        description: 'Intraoral photograph showing seated crown',
        format: 'High-resolution digital photograph',
        timingRequirement: 'Taken on date of delivery',
      },
      {
        type: 'post_op_radiograph',
        description: 'Post-cementation radiograph showing crown margins',
        format: 'Digital radiograph',
        timingRequirement: 'Taken on date of delivery',
      },
    ],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Describe the existing condition of the tooth (fracture, extensive decay, failed restoration)',
      'Document why a direct restoration is not adequate',
      'List alternative treatments considered and why they were not selected',
      'Include history of previous restorations on the tooth',
      'Note the percentage of remaining tooth structure',
    ],
  },
  {
    category: 'SRP / Periodontics',
    cdtCodes: ['D4341', 'D4342', 'D4346', 'D4910'],
    requiredAttachments: [
      {
        type: 'perio_charting',
        description: 'Full-mouth periodontal charting with probing depths, BOP, and recession',
        format: 'Periodontal chart (digital or scanned)',
        timingRequirement: 'Completed within 30 days prior to or on date of SRP',
      },
      {
        type: 'full_mouth_radiographs',
        description: 'Full-mouth radiographs or panoramic showing bone levels',
        format: 'Digital radiograph series or panoramic',
        timingRequirement: 'Taken within 12 months prior to or on date of service',
      },
    ],
    optionalAttachments: [
      {
        type: 'comparison_charting',
        description: 'Prior periodontal charting for comparison (for D4910)',
        format: 'Periodontal chart',
        timingRequirement: 'Previous charting from prior SRP or perio maintenance visit',
      },
    ],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Document specific probing depths per quadrant (must show 4mm+ pockets for D4341/D4342)',
      'Note percentage of bleeding on probing sites',
      'Describe radiographic bone loss pattern and severity',
      'For D4910: reference prior SRP dates and compare current vs. baseline probing depths',
      'For D4346: explain why D1110 or D4341 was not appropriate',
      'Identify specific teeth with deepest pockets',
    ],
  },
  {
    category: 'Extractions',
    cdtCodes: ['D7140', 'D7210', 'D7220', 'D7230', 'D7240', 'D7241', 'D7250'],
    requiredAttachments: [
      {
        type: 'pre_op_radiograph',
        description: 'Pre-operative radiograph showing the tooth to be extracted',
        format: 'Digital radiograph (periapical or panoramic)',
        timingRequirement: 'Taken within 6 months prior to or on date of service',
      },
    ],
    optionalAttachments: [
      {
        type: 'post_op_radiograph',
        description: 'Post-operative radiograph confirming complete removal',
        format: 'Digital radiograph',
        timingRequirement: 'Taken on date of service',
      },
      {
        type: 'panoramic_radiograph',
        description: 'Panoramic radiograph showing impaction (for impacted teeth)',
        format: 'Digital panoramic',
        timingRequirement: 'Taken within 6 months prior to or on date of service',
      },
    ],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Document the specific reason for extraction (non-restorable, periodontal, orthodontic, etc.)',
      'For D7210: describe bone removal or tooth sectioning performed',
      'For D7220-D7241: document impaction classification (soft tissue, partial bony, complete bony)',
      'For D7241: describe the unusual surgical complications encountered',
      'For D7250: explain why residual roots are present and the surgical approach used',
    ],
  },
  {
    category: 'Endodontics',
    cdtCodes: ['D3310', 'D3320', 'D3330', 'D3346', 'D3347', 'D3348', 'D3220', 'D3221', 'D3222'],
    requiredAttachments: [
      {
        type: 'pre_op_radiograph',
        description: 'Pre-operative radiograph showing pulpal/periapical pathology',
        format: 'Digital radiograph (periapical)',
        timingRequirement: 'Taken on or within 30 days prior to date of service',
      },
      {
        type: 'working_length_radiograph',
        description: 'Working length determination radiograph (for RCT)',
        format: 'Digital radiograph (periapical)',
        timingRequirement: 'Taken during the procedure',
      },
      {
        type: 'post_op_radiograph',
        description: 'Post-obturation radiograph confirming fill',
        format: 'Digital radiograph (periapical)',
        timingRequirement: 'Taken immediately after obturation',
      },
    ],
    optionalAttachments: [],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Document vitality testing results (cold test, EPT, percussion, palpation)',
      'Describe symptoms and duration',
      'Note number of canals treated',
      'Document working length and obturation technique',
      'For retreatment (D3346-D3348): explain reason for retreatment and prior treatment date',
    ],
  },
  {
    category: 'Sedation',
    cdtCodes: ['D9230', 'D9239', 'D9243'],
    requiredAttachments: [
      {
        type: 'signed_consent_form',
        description: 'Signed informed consent for sedation',
        format: 'Scanned document',
        timingRequirement: 'Signed prior to sedation on date of service',
      },
      {
        type: 'monitoring_record',
        description: 'Vital signs monitoring record with timestamps',
        format: 'Monitoring form or printout',
        timingRequirement: 'Completed during and after sedation',
      },
    ],
    optionalAttachments: [
      {
        type: 'anesthesia_record',
        description: 'Complete anesthesia record (for IV sedation)',
        format: 'Anesthesia form',
        timingRequirement: 'Completed on date of service',
      },
    ],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Document ASA classification',
      'Record start and end times of sedation',
      'For D9230: note O2/N2O flow rates and percentages',
      'For D9239/D9243: list all medications, routes, and dosages',
      'Document patient response and recovery',
      'Note discharge criteria met before release',
      'Justify medical necessity for sedation (behavioral, medical, anxiety)',
    ],
  },
  {
    category: 'Radiographs',
    cdtCodes: ['D0210', 'D0220', 'D0230', 'D0240', 'D0270', 'D0272', 'D0274', 'D0277', 'D0330'],
    requiredAttachments: [
      {
        type: 'radiographic_images',
        description: 'The actual radiographic images taken',
        format: 'Digital radiograph (DICOM or high-resolution image)',
        timingRequirement: 'Taken on date of service',
      },
    ],
    optionalAttachments: [],
    narrativeRequired: false,
    narrativeGuidelines: [
      'Document clinical indication for radiographs',
      'Note ALARA compliance',
      'For D0277 (vertical bitewings): document periodontal justification',
      'For D0210 (complete series): note the number of images',
    ],
  },
  {
    category: 'Prosthetics',
    cdtCodes: ['D5110', 'D5120', 'D5130', 'D5140', 'D5211', 'D5212', 'D5213', 'D5214', 'D6010', 'D6058', 'D6059', 'D6065'],
    requiredAttachments: [
      {
        type: 'panoramic_radiograph',
        description: 'Panoramic radiograph showing edentulous areas and remaining teeth',
        format: 'Digital panoramic',
        timingRequirement: 'Taken within 6 months prior to or on date of service',
      },
    ],
    optionalAttachments: [
      {
        type: 'pre_treatment_photo',
        description: 'Intraoral photograph showing current condition',
        format: 'High-resolution digital photograph',
        timingRequirement: 'Taken prior to or on date of treatment',
      },
      {
        type: 'diagnostic_casts',
        description: 'Diagnostic casts or digital scans',
        format: 'Digital scan or photograph of casts',
        timingRequirement: 'Completed during treatment planning',
      },
    ],
    narrativeRequired: true,
    narrativeGuidelines: [
      'Document missing teeth and their cause of loss',
      'Describe functional impairment (mastication, speech, aesthetics)',
      'For implants (D6010): document bone quality assessment and surgical plan',
      'For partial dentures: note condition of abutment teeth',
      'For immediate dentures: explain why immediate placement is necessary',
    ],
  },
];

// ---------------------------------------------------------------------------
// Prior Authorization Requirements
// ---------------------------------------------------------------------------

export interface PriorAuthRule {
  cdtCodes: string[];
  category: string;
  required: boolean;
  turnaroundDays: number;
  requiredDocuments: string[];
  notes: string;
}

export const PRIOR_AUTH_RULES: PriorAuthRule[] = [
  {
    cdtCodes: ['D2740', 'D2750', 'D2751', 'D2752', 'D2780', 'D2781', 'D2783', 'D2790', 'D2791', 'D2792', 'D2794'],
    category: 'Crowns',
    required: true,
    turnaroundDays: 14,
    requiredDocuments: ['pre_op_radiograph', 'narrative_justification', 'clinical_photograph'],
    notes: 'Prior authorization required for all crown procedures. Submit pre-op radiograph, intraoral photo, and detailed narrative.',
  },
  {
    cdtCodes: ['D5110', 'D5120', 'D5130', 'D5140', 'D5211', 'D5212', 'D5213', 'D5214'],
    category: 'Dentures',
    required: true,
    turnaroundDays: 14,
    requiredDocuments: ['panoramic_radiograph', 'narrative_justification'],
    notes: 'Prior authorization required for all denture and partial denture procedures.',
  },
  {
    cdtCodes: ['D6010', 'D6058', 'D6059', 'D6065'],
    category: 'Implants',
    required: true,
    turnaroundDays: 21,
    requiredDocuments: ['panoramic_radiograph', 'cbct_scan', 'narrative_justification', 'treatment_plan'],
    notes: 'Prior authorization required. Extended review period. Submit comprehensive documentation including CBCT if available.',
  },
  {
    cdtCodes: ['D7220', 'D7230', 'D7240', 'D7241'],
    category: 'Impacted Tooth Removal',
    required: true,
    turnaroundDays: 10,
    requiredDocuments: ['panoramic_radiograph', 'narrative_with_impaction_classification'],
    notes: 'Prior authorization required for impacted tooth removal. Document impaction classification.',
  },
  {
    cdtCodes: ['D9239', 'D9243'],
    category: 'IV Sedation',
    required: true,
    turnaroundDays: 10,
    requiredDocuments: ['treatment_plan', 'medical_necessity_narrative', 'asa_classification'],
    notes: 'Prior authorization required for IV sedation. Must document why sedation is medically necessary.',
  },
  {
    cdtCodes: ['D3346', 'D3347', 'D3348'],
    category: 'Endodontic Retreatment',
    required: true,
    turnaroundDays: 14,
    requiredDocuments: ['pre_op_radiograph', 'narrative_justification', 'prior_treatment_records'],
    notes: 'Prior authorization required for retreatment. Document reason original treatment failed.',
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Find frequency rule for a given CDT code */
export function getFrequencyRule(cdtCode: string): FrequencyRule | undefined {
  return FREQUENCY_RULES.find((r) => r.cdtCode === cdtCode);
}

/** Find age restrictions for a given CDT code */
export function getAgeRestriction(cdtCode: string): AgeRestriction | undefined {
  return AGE_RESTRICTIONS.find((r) => r.cdtCode === cdtCode);
}

/** Check if two codes are mutually exclusive */
export function areMutuallyExclusive(code1: string, code2: string): MutualExclusion | undefined {
  return MUTUAL_EXCLUSIONS.find(
    (e) =>
      (e.code1 === code1 && e.code2 === code2) ||
      (e.code1 === code2 && e.code2 === code1),
  );
}

/** Get all mutual exclusions involving a given code */
export function getMutualExclusionsForCode(cdtCode: string): MutualExclusion[] {
  return MUTUAL_EXCLUSIONS.filter((e) => e.code1 === cdtCode || e.code2 === cdtCode);
}

/** Get red flags applicable to a given CDT code */
export function getRedFlagsForCode(cdtCode: string): DocumentationRedFlag[] {
  return DOCUMENTATION_RED_FLAGS.filter(
    (rf) => rf.affectedCodes.length === 0 || rf.affectedCodes.includes(cdtCode),
  );
}

/** Get attachment recommendations for a given CDT code */
export function getAttachmentRecommendation(cdtCode: string): AttachmentRecommendation | undefined {
  return ATTACHMENT_RECOMMENDATIONS.find((ar) => ar.cdtCodes.includes(cdtCode));
}

/** Check if a procedure requires prior authorization */
export function getPriorAuthRule(cdtCode: string): PriorAuthRule | undefined {
  return PRIOR_AUTH_RULES.find((r) => r.cdtCodes.includes(cdtCode));
}

/** Validate patient age against code restrictions. Returns null if valid, or error message. */
export function validateAgeForCode(cdtCode: string, patientAge: number): string | null {
  const restriction = getAgeRestriction(cdtCode);
  if (!restriction) return null;

  if (restriction.minAge !== undefined && patientAge < restriction.minAge) {
    return `Patient age ${patientAge} is below minimum age ${restriction.minAge} for ${cdtCode}. ${restriction.notes}`;
  }
  if (restriction.maxAge !== undefined && patientAge > restriction.maxAge) {
    if (restriction.epsdtOverride && patientAge <= 20) {
      return null; // EPSDT override applies
    }
    return `Patient age ${patientAge} exceeds maximum age ${restriction.maxAge} for ${cdtCode}. ${restriction.notes}`;
  }
  return null;
}
