export const EPSDT_FAVORITES = [
  { code: 'D0150', desc: 'Comprehensive oral evaluation - new or established patient', category: 'Diagnostic' },
  { code: 'D0120', desc: 'Periodic oral evaluation - established patient', category: 'Diagnostic' },
  { code: 'D0140', desc: 'Limited oral evaluation - problem focused', category: 'Diagnostic' },
  { code: 'D0210', desc: 'Radiographic survey of whole mouth (FMX)', category: 'Diagnostic' },
  { code: 'D0220', desc: 'Periapical radiographic image - first image', category: 'Diagnostic', toothRequired: true },
  { code: 'D0230', desc: 'Periapical radiographic image - each additional', category: 'Diagnostic', toothRequired: true },
  { code: 'D0272', desc: 'Bitewing radiographic images - two images', category: 'Diagnostic' },
  { code: 'D0274', desc: 'Bitewing radiographic images - four images', category: 'Diagnostic' },
  { code: 'D1110', desc: 'Prophylaxis - adult', category: 'Preventive' },
  { code: 'D1120', desc: 'Prophylaxis - child (under 14)', category: 'Preventive' },
  { code: 'D1206', desc: 'Topical application of fluoride varnish', category: 'Preventive' },
  { code: 'D1351', desc: 'Sealant - per tooth', category: 'Preventive', toothRequired: true },
  { code: 'D1352', desc: 'Preventive resin restoration (PRR)', category: 'Preventive', toothRequired: true },
  { code: 'D1510', desc: 'Space maintainer - fixed, unilateral, per quadrant', category: 'Preventive' },
  { code: 'D2140', desc: 'Amalgam - one surface', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2150', desc: 'Amalgam - two surfaces', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2160', desc: 'Amalgam - three surfaces', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2330', desc: 'Composite - one surface, anterior', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2331', desc: 'Composite - two surfaces, anterior', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2391', desc: 'Composite - one surface, posterior', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2392', desc: 'Composite - two surfaces, posterior', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2393', desc: 'Composite - three surfaces, posterior', category: 'Restorative', toothRequired: true, surfaceRequired: true },
  { code: 'D2930', desc: 'Prefabricated stainless steel crown - primary tooth', category: 'Restorative', toothRequired: true },
  { code: 'D2931', desc: 'Prefabricated stainless steel crown - permanent tooth', category: 'Restorative', toothRequired: true },
  { code: 'D3220', desc: 'Pulpotomy - primary tooth (excluding final restoration)', category: 'Endodontic', toothRequired: true },
  { code: 'D7140', desc: 'Extraction, erupted tooth or exposed root', category: 'Oral Surgery', toothRequired: true },
  { code: 'D7210', desc: 'Surgical extraction, erupted tooth requiring bone removal/sectioning', category: 'Oral Surgery', toothRequired: true }
]

export const CDT_BY_CATEGORY = {
  Diagnostic: [
    { code: 'D0120', desc: 'Periodic oral evaluation' },
    { code: 'D0140', desc: 'Limited oral evaluation' },
    { code: 'D0150', desc: 'Comprehensive oral evaluation' },
    { code: 'D0160', desc: 'Detailed and extensive oral evaluation' },
    { code: 'D0180', desc: 'Comprehensive periodontal evaluation' },
    { code: 'D0210', desc: 'FMX radiographic survey' },
    { code: 'D0220', desc: 'Periapical - first image', toothRequired: true },
    { code: 'D0230', desc: 'Periapical - each additional', toothRequired: true },
    { code: 'D0272', desc: 'Bitewing - 2 images' },
    { code: 'D0274', desc: 'Bitewing - 4 images' },
    { code: 'D0330', desc: 'Panoramic radiographic image' },
    { code: 'D0350', desc: 'Oral/facial photographic images' },
    { code: 'D0470', desc: 'Diagnostic casts' }
  ],
  Preventive: [
    { code: 'D1110', desc: 'Prophylaxis - adult' },
    { code: 'D1120', desc: 'Prophylaxis - child' },
    { code: 'D1206', desc: 'Topical fluoride varnish' },
    { code: 'D1208', desc: 'Topical application of fluoride - excluding varnish' },
    { code: 'D1310', desc: 'Nutritional counseling for caries control' },
    { code: 'D1320', desc: 'Tobacco counseling' },
    { code: 'D1330', desc: 'Oral hygiene instructions' },
    { code: 'D1351', desc: 'Sealant - per tooth', toothRequired: true },
    { code: 'D1352', desc: 'Preventive resin restoration', toothRequired: true },
    { code: 'D1510', desc: 'Space maintainer - fixed unilateral' },
    { code: 'D1516', desc: 'Space maintainer - fixed bilateral, maxillary' },
    { code: 'D1517', desc: 'Space maintainer - fixed bilateral, mandibular' }
  ],
  Restorative: [
    { code: 'D2140', desc: 'Amalgam - 1 surface', toothRequired: true, surfaceRequired: true },
    { code: 'D2150', desc: 'Amalgam - 2 surfaces', toothRequired: true, surfaceRequired: true },
    { code: 'D2160', desc: 'Amalgam - 3 surfaces', toothRequired: true, surfaceRequired: true },
    { code: 'D2161', desc: 'Amalgam - 4+ surfaces', toothRequired: true, surfaceRequired: true },
    { code: 'D2330', desc: 'Composite - 1 surface, anterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2331', desc: 'Composite - 2 surfaces, anterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2332', desc: 'Composite - 3 surfaces, anterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2335', desc: 'Composite - 4+ surfaces, anterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2391', desc: 'Composite - 1 surface, posterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2392', desc: 'Composite - 2 surfaces, posterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2393', desc: 'Composite - 3 surfaces, posterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2394', desc: 'Composite - 4+ surfaces, posterior', toothRequired: true, surfaceRequired: true },
    { code: 'D2740', desc: 'Crown - porcelain/ceramic', toothRequired: true },
    { code: 'D2750', desc: 'Crown - porcelain fused to high noble', toothRequired: true },
    { code: 'D2930', desc: 'SSC - primary tooth', toothRequired: true },
    { code: 'D2931', desc: 'SSC - permanent tooth', toothRequired: true },
    { code: 'D2940', desc: 'Sedative filling', toothRequired: true }
  ],
  Endodontic: [
    { code: 'D3110', desc: 'Pulp cap - direct', toothRequired: true },
    { code: 'D3120', desc: 'Pulp cap - indirect', toothRequired: true },
    { code: 'D3220', desc: 'Pulpotomy - primary', toothRequired: true },
    { code: 'D3221', desc: 'Pulpal debridement', toothRequired: true },
    { code: 'D3310', desc: 'RCT - anterior', toothRequired: true },
    { code: 'D3320', desc: 'RCT - premolar', toothRequired: true },
    { code: 'D3330', desc: 'RCT - molar', toothRequired: true }
  ],
  Periodontic: [
    { code: 'D4341', desc: 'Periodontal scaling/root planing - 4+ teeth per quad' },
    { code: 'D4342', desc: 'Periodontal scaling/root planing - 1-3 teeth per quad' },
    { code: 'D4346', desc: 'Scaling in presence of generalized moderate/severe gingival inflammation' },
    { code: 'D4355', desc: 'Full mouth debridement' },
    { code: 'D4910', desc: 'Periodontal maintenance' }
  ],
  'Oral Surgery': [
    { code: 'D7140', desc: 'Extraction - erupted tooth', toothRequired: true },
    { code: 'D7210', desc: 'Surgical extraction - erupted', toothRequired: true },
    { code: 'D7220', desc: 'Soft tissue impaction', toothRequired: true },
    { code: 'D7230', desc: 'Partial bony impaction', toothRequired: true },
    { code: 'D7240', desc: 'Complete bony impaction', toothRequired: true },
    { code: 'D7250', desc: 'Surgical removal of residual roots', toothRequired: true }
  ],
  Adjunctive: [
    { code: 'D9110', desc: 'Palliative treatment - emergency' },
    { code: 'D9215', desc: 'Local anesthesia in conjunction with operative/surgical' },
    { code: 'D9230', desc: 'Inhalation of nitrous oxide/analgesia, anxiolysis' },
    { code: 'D9430', desc: 'Office visit for observation' },
    { code: 'D9450', desc: 'Case presentation' },
    { code: 'D9930', desc: 'Treatment of complications (post-surgical)' }
  ]
}

export const CDT_CATEGORIES = Object.keys(CDT_BY_CATEGORY)

export function lookupCdt(code) {
  for (const cat of CDT_CATEGORIES) {
    const found = CDT_BY_CATEGORY[cat].find((c) => c.code === code)
    if (found) return { ...found, category: cat }
  }
  return EPSDT_FAVORITES.find((c) => c.code === code) || null
}
