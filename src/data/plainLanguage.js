// Plain-language vocabulary for the patient visit summary.
// Single source of truth for BOTH the server prompt (server/noteGenerator.js
// builds its instructions from these tables) and the client-side badge check
// in NoteOutput.jsx — keep them from drifting by editing only this file.

export const JARGON_SUBSTITUTIONS = {
  'periapical': 'around the root',
  'caries': 'cavity',
  'carious': 'decayed',
  'restoration': 'filling',
  'prophylaxis': 'cleaning',
  'scaling and root planing': 'deep cleaning',
  'extraction': 'removing the tooth',
  'occlusal': 'chewing surface',
  'interproximal': 'between the teeth',
  'buccal': 'cheek side',
  'lingual': 'tongue side',
  'pulp': 'nerve inside the tooth',
  'pulpitis': 'inflamed nerve inside the tooth',
  'gingiva': 'gums',
  'gingivitis': 'gum inflammation',
  'calculus': 'hardened plaque (tartar)',
  'radiograph': 'x-ray',
  'silver diamine fluoride': 'cavity-stopping liquid medicine',
  'stainless steel crown': 'silver cap',
  'pulpotomy': 'baby-tooth nerve treatment'
}

// Abbreviations that must never appear in a patient-facing summary.
export const FORBIDDEN_ABBREVIATIONS = ['BOP', 'SRP', 'FMX', 'BWX', 'PAs', 'RCT', 'MOD', 'MODL', 'SSC', 'SDF', 'EPSDT', 'WNL', 'ASA']

export const FORBIDDEN_PATTERNS = [
  { label: 'CDT code', regex: /\bD\d{4}\b/g },
  ...FORBIDDEN_ABBREVIATIONS.map((a) => ({ label: a, regex: new RegExp(`\\b${a}\\b`, 'g') })),
  ...Object.keys(JARGON_SUBSTITUTIONS).map((term) => ({
    label: term,
    regex: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
  }))
]

// Returns the distinct offending terms found in patient-facing text.
export function findJargon(text) {
  if (!text || typeof text !== 'string') return []
  const hits = new Set()
  for (const { label, regex } of FORBIDDEN_PATTERNS) {
    regex.lastIndex = 0
    const m = text.match(regex)
    if (m) hits.add(label === 'CDT code' ? m[0] : label)
  }
  return Array.from(hits)
}
