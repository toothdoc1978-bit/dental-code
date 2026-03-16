// =============================================================================
// Clinical Sidecar — ICD-10 Code Reference Data
// Common dental diagnosis codes with CDT procedure mappings
// =============================================================================

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  commonProcedures: string[]; // CDT codes this diagnosis commonly maps to
}

export const ICD10_CODES: ICD10Code[] = [
  // ===========================================================================
  // DENTAL CARIES (K02.x)
  // ===========================================================================
  {
    code: 'K02.3',
    description: 'Arrested dental caries',
    category: 'Dental Caries',
    commonProcedures: ['D1354', 'D0120', 'D0150'],
  },
  {
    code: 'K02.51',
    description: 'Dental caries on pit and fissure surface limited to enamel',
    category: 'Dental Caries',
    commonProcedures: ['D1351', 'D1352', 'D2391', 'D2140'],
  },
  {
    code: 'K02.52',
    description: 'Dental caries on pit and fissure surface penetrating into dentin',
    category: 'Dental Caries',
    commonProcedures: ['D2391', 'D2392', 'D2393', 'D2394', 'D2140', 'D2150', 'D2160', 'D2161'],
  },
  {
    code: 'K02.53',
    description: 'Dental caries on pit and fissure surface penetrating into pulp',
    category: 'Dental Caries',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3220', 'D2740', 'D2750'],
  },
  {
    code: 'K02.61',
    description: 'Dental caries on smooth surface limited to enamel',
    category: 'Dental Caries',
    commonProcedures: ['D2330', 'D2391', 'D1352'],
  },
  {
    code: 'K02.62',
    description: 'Dental caries on smooth surface penetrating into dentin',
    category: 'Dental Caries',
    commonProcedures: ['D2330', 'D2331', 'D2332', 'D2391', 'D2392'],
  },
  {
    code: 'K02.63',
    description: 'Dental caries on smooth surface penetrating into pulp',
    category: 'Dental Caries',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3220', 'D2740', 'D2750'],
  },
  {
    code: 'K02.7',
    description: 'Dental root caries',
    category: 'Dental Caries',
    commonProcedures: ['D2330', 'D2331', 'D2391', 'D2392', 'D7140'],
  },
  {
    code: 'K02.9',
    description: 'Dental caries, unspecified',
    category: 'Dental Caries',
    commonProcedures: ['D2391', 'D2392', 'D2330', 'D2331'],
  },

  // ===========================================================================
  // PERIODONTAL DISEASE (K05.x)
  // ===========================================================================
  {
    code: 'K05.00',
    description: 'Acute gingivitis, plaque induced',
    category: 'Periodontal',
    commonProcedures: ['D1110', 'D1120', 'D4346'],
  },
  {
    code: 'K05.01',
    description: 'Acute gingivitis, non-plaque induced',
    category: 'Periodontal',
    commonProcedures: ['D1110', 'D1120', 'D4346'],
  },
  {
    code: 'K05.10',
    description: 'Chronic gingivitis, plaque induced',
    category: 'Periodontal',
    commonProcedures: ['D1110', 'D1120', 'D4346', 'D1330'],
  },
  {
    code: 'K05.11',
    description: 'Chronic gingivitis, non-plaque induced',
    category: 'Periodontal',
    commonProcedures: ['D1110', 'D1120', 'D4346'],
  },
  {
    code: 'K05.20',
    description: 'Aggressive periodontitis, unspecified',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910', 'D4381'],
  },
  {
    code: 'K05.211',
    description: 'Aggressive periodontitis, localized, slight',
    category: 'Periodontal',
    commonProcedures: ['D4342', 'D4910'],
  },
  {
    code: 'K05.212',
    description: 'Aggressive periodontitis, localized, moderate',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },
  {
    code: 'K05.213',
    description: 'Aggressive periodontitis, localized, severe',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381'],
  },
  {
    code: 'K05.221',
    description: 'Aggressive periodontitis, generalized, slight',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },
  {
    code: 'K05.222',
    description: 'Aggressive periodontitis, generalized, moderate',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381'],
  },
  {
    code: 'K05.223',
    description: 'Aggressive periodontitis, generalized, severe',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381'],
  },
  {
    code: 'K05.30',
    description: 'Chronic periodontitis, unspecified',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },
  {
    code: 'K05.311',
    description: 'Chronic periodontitis, localized, slight',
    category: 'Periodontal',
    commonProcedures: ['D4342', 'D4910'],
  },
  {
    code: 'K05.312',
    description: 'Chronic periodontitis, localized, moderate',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },
  {
    code: 'K05.313',
    description: 'Chronic periodontitis, localized, severe',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381'],
  },
  {
    code: 'K05.321',
    description: 'Chronic periodontitis, generalized, slight',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910'],
  },
  {
    code: 'K05.322',
    description: 'Chronic periodontitis, generalized, moderate',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381'],
  },
  {
    code: 'K05.323',
    description: 'Chronic periodontitis, generalized, severe',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910', 'D4381', 'D7140'],
  },
  {
    code: 'K05.4',
    description: 'Periodontosis (juvenile periodontitis)',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },
  {
    code: 'K05.5',
    description: 'Other periodontal diseases',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910', 'D4346'],
  },
  {
    code: 'K05.6',
    description: 'Periodontal disease, unspecified',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342', 'D4910'],
  },

  // ===========================================================================
  // PULPAL & PERIAPICAL (K04.x)
  // ===========================================================================
  {
    code: 'K04.0',
    description: 'Pulpitis',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3220', 'D3221'],
  },
  {
    code: 'K04.01',
    description: 'Reversible pulpitis',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D2391', 'D2392', 'D2330', 'D2331', 'D3220'],
  },
  {
    code: 'K04.02',
    description: 'Irreversible pulpitis',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3221'],
  },
  {
    code: 'K04.1',
    description: 'Necrosis of pulp',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D7140'],
  },
  {
    code: 'K04.2',
    description: 'Pulp degeneration',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330'],
  },
  {
    code: 'K04.3',
    description: 'Abnormal hard tissue formation in pulp',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330'],
  },
  {
    code: 'K04.4',
    description: 'Acute apical periodontitis of pulpal origin',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3221'],
  },
  {
    code: 'K04.5',
    description: 'Chronic apical periodontitis',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3346', 'D3347', 'D3348'],
  },
  {
    code: 'K04.6',
    description: 'Periapical abscess with sinus',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3221', 'D7140'],
  },
  {
    code: 'K04.7',
    description: 'Periapical abscess without sinus',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D3221', 'D7140'],
  },
  {
    code: 'K04.8',
    description: 'Radicular cyst',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330', 'D7140'],
  },
  {
    code: 'K04.99',
    description: 'Other and unspecified diseases of pulp and periapical tissues',
    category: 'Pulpal/Periapical',
    commonProcedures: ['D3310', 'D3320', 'D3330'],
  },

  // ===========================================================================
  // TOOTH FRACTURE (K03.81, S02.5x)
  // ===========================================================================
  {
    code: 'K03.81',
    description: 'Cracked tooth',
    category: 'Tooth Fracture',
    commonProcedures: ['D2740', 'D2750', 'D2391', 'D2392', 'D3310', 'D3320', 'D3330', 'D7140'],
  },
  {
    code: 'S02.5XXA',
    description: 'Fracture of tooth (traumatic), initial encounter',
    category: 'Tooth Fracture',
    commonProcedures: ['D2330', 'D2331', 'D2335', 'D2390', 'D2740', 'D3310', 'D3320', 'D7140'],
  },
  {
    code: 'S02.5XXD',
    description: 'Fracture of tooth (traumatic), subsequent encounter',
    category: 'Tooth Fracture',
    commonProcedures: ['D2740', 'D2750', 'D3310', 'D3320', 'D3330'],
  },
  {
    code: 'S02.5XXS',
    description: 'Fracture of tooth (traumatic), sequela',
    category: 'Tooth Fracture',
    commonProcedures: ['D2740', 'D2750', 'D3346', 'D3347', 'D3348'],
  },

  // ===========================================================================
  // TMJ DISORDERS (M26.6x)
  // ===========================================================================
  {
    code: 'M26.60',
    description: 'Temporomandibular joint disorder, unspecified',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.601',
    description: 'Right temporomandibular joint disorder, unspecified',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.602',
    description: 'Left temporomandibular joint disorder, unspecified',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.603',
    description: 'Bilateral temporomandibular joint disorder, unspecified',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.62',
    description: 'Arthralgia of temporomandibular joint',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.63',
    description: 'Articular disc disorder of temporomandibular joint',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },
  {
    code: 'M26.69',
    description: 'Other specified disorders of temporomandibular joint',
    category: 'TMJ',
    commonProcedures: ['D0140', 'D0330'],
  },

  // ===========================================================================
  // EXAMINATION / ENCOUNTER (Z01.2x)
  // ===========================================================================
  {
    code: 'Z01.20',
    description: 'Encounter for dental examination and cleaning without abnormal findings',
    category: 'Examination',
    commonProcedures: ['D0120', 'D0150', 'D1110', 'D1120', 'D0210', 'D0272', 'D0274'],
  },
  {
    code: 'Z01.21',
    description: 'Encounter for dental examination and cleaning with abnormal findings',
    category: 'Examination',
    commonProcedures: ['D0120', 'D0150', 'D1110', 'D1120', 'D0210', 'D0272', 'D0274'],
  },

  // ===========================================================================
  // OTHER COMMON DENTAL DIAGNOSES
  // ===========================================================================
  {
    code: 'K08.101',
    description: 'Complete loss of teeth, unspecified cause, class I',
    category: 'Tooth Loss',
    commonProcedures: ['D5110', 'D5120', 'D6010'],
  },
  {
    code: 'K08.109',
    description: 'Complete loss of teeth, unspecified cause, unspecified class',
    category: 'Tooth Loss',
    commonProcedures: ['D5110', 'D5120'],
  },
  {
    code: 'K08.401',
    description: 'Partial loss of teeth, unspecified cause, class I',
    category: 'Tooth Loss',
    commonProcedures: ['D5211', 'D5212', 'D5213', 'D5214', 'D6010'],
  },
  {
    code: 'K08.409',
    description: 'Partial loss of teeth, unspecified cause, unspecified class',
    category: 'Tooth Loss',
    commonProcedures: ['D5211', 'D5212', 'D5213', 'D5214'],
  },
  {
    code: 'K08.419',
    description: 'Partial loss of teeth due to trauma, unspecified class',
    category: 'Tooth Loss',
    commonProcedures: ['D5211', 'D5212', 'D5213', 'D5214', 'D6010'],
  },
  {
    code: 'K08.429',
    description: 'Partial loss of teeth due to periodontal diseases, unspecified class',
    category: 'Tooth Loss',
    commonProcedures: ['D5211', 'D5212', 'D5213', 'D5214'],
  },
  {
    code: 'K08.439',
    description: 'Partial loss of teeth due to caries, unspecified class',
    category: 'Tooth Loss',
    commonProcedures: ['D5211', 'D5212', 'D5213', 'D5214'],
  },
  {
    code: 'K00.6',
    description: 'Disturbances in tooth eruption',
    category: 'Developmental',
    commonProcedures: ['D7140', 'D7220', 'D7230', 'D7240', 'D0330'],
  },
  {
    code: 'K01.0',
    description: 'Embedded teeth',
    category: 'Developmental',
    commonProcedures: ['D7240', 'D7241', 'D0330'],
  },
  {
    code: 'K01.1',
    description: 'Impacted teeth',
    category: 'Developmental',
    commonProcedures: ['D7220', 'D7230', 'D7240', 'D7241', 'D0330'],
  },
  {
    code: 'K03.0',
    description: 'Excessive attrition of teeth',
    category: 'Tooth Wear',
    commonProcedures: ['D2391', 'D2392', 'D2740', 'D2750'],
  },
  {
    code: 'K03.1',
    description: 'Abrasion of teeth',
    category: 'Tooth Wear',
    commonProcedures: ['D2330', 'D2331', 'D2391', 'D2392'],
  },
  {
    code: 'K03.2',
    description: 'Erosion of teeth',
    category: 'Tooth Wear',
    commonProcedures: ['D2330', 'D2331', 'D2391', 'D2392', 'D2740'],
  },
  {
    code: 'K06.010',
    description: 'Localized gingival recession, unspecified',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4342'],
  },
  {
    code: 'K06.020',
    description: 'Generalized gingival recession, unspecified',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4910'],
  },
  {
    code: 'K06.1',
    description: 'Gingival enlargement',
    category: 'Periodontal',
    commonProcedures: ['D4341', 'D4346', 'D0140'],
  },
  {
    code: 'K12.0',
    description: 'Recurrent oral aphthae (canker sores)',
    category: 'Oral Mucosal',
    commonProcedures: ['D0140'],
  },
  {
    code: 'K12.1',
    description: 'Other forms of stomatitis',
    category: 'Oral Mucosal',
    commonProcedures: ['D0140', 'D0170'],
  },
  {
    code: 'K13.0',
    description: 'Diseases of lips',
    category: 'Oral Mucosal',
    commonProcedures: ['D0140'],
  },
  {
    code: 'K13.70',
    description: 'Unspecified lesions of oral mucosa',
    category: 'Oral Mucosal',
    commonProcedures: ['D0140', 'D0170'],
  },
  {
    code: 'R68.84',
    description: 'Jaw pain',
    category: 'Symptoms',
    commonProcedures: ['D0140', 'D0170', 'D0330'],
  },
  {
    code: 'K08.89',
    description: 'Other specified disorders of teeth and supporting structures',
    category: 'Other',
    commonProcedures: ['D0140', 'D0170'],
  },
  {
    code: 'K09.0',
    description: 'Developmental odontogenic cysts',
    category: 'Developmental',
    commonProcedures: ['D0140', 'D0330', 'D7140'],
  },
  {
    code: 'M27.2',
    description: 'Inflammatory conditions of jaws',
    category: 'Other',
    commonProcedures: ['D0140', 'D0330', 'D7140'],
  },
  {
    code: 'M27.3',
    description: 'Alveolitis of jaws (dry socket)',
    category: 'Other',
    commonProcedures: ['D0170'],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Map of code -> ICD10Code for O(1) lookups */
export const ICD10_CODE_MAP: Record<string, ICD10Code> = Object.fromEntries(
  ICD10_CODES.map((c) => [c.code, c]),
);

/** Return all codes in a given category */
export function getICD10CodesByCategory(category: string): ICD10Code[] {
  return ICD10_CODES.filter((c) => c.category === category);
}

/** Find ICD-10 codes that commonly map to a given CDT procedure code */
export function getICD10CodesForProcedure(cdtCode: string): ICD10Code[] {
  return ICD10_CODES.filter((c) => c.commonProcedures.includes(cdtCode));
}

/** All unique categories */
export const ICD10_CATEGORIES = [
  'Dental Caries',
  'Periodontal',
  'Pulpal/Periapical',
  'Tooth Fracture',
  'TMJ',
  'Examination',
  'Tooth Loss',
  'Developmental',
  'Tooth Wear',
  'Oral Mucosal',
  'Symptoms',
  'Other',
] as const;

export type ICD10Category = (typeof ICD10_CATEGORIES)[number];
