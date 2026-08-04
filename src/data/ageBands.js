// Central home for age- and visit-type-based UI gating.
//
// Three older age systems predate this module and are NOT rewired here
// (future consolidation targets):
//   - dentition eruption ages: examDefaults.js PERMANENT_MIN_ERUPTION_AGE / PRIMARY_RETAINED_FLAG_AGE
//   - pediatric visual perio:  PerioAssessment.jsx (age < 12)
//   - pediatric radiographs:   Radiographs.jsx (age < 6)

export const FOCUSED_VISIT_TYPES = ['limited', 'emergency']

export const isFocusedVisit = (visitType) => FOCUSED_VISIT_TYPES.includes(visitType)

// Unknown age must never hide anything — hiding is a convenience, not a gate.
export const ageKnown = (age) => typeof age === 'number' && Number.isFinite(age)

export const AGE_BANDS = {
  TOBACCO_MIN_AGE: 10,
  PREGNANCY_MIN_AGE: 10,
  ADULT_TOPIC_MIN_AGE: 13,
  BOTTLE_TOPIC_MAX_AGE: 5,
  ERUPTION_TOPIC_MAX_AGE: 12,
  HABIT_APPLIANCE_MAX_AGE: 12
}

// Topics seeded by EPSDT defaults (EPSDT_DEFAULT_EDUCATION / EPSDT_DEFAULT_COUNSELING)
// deliberately carry no age rule: they are seeded into state before age may be
// entered, and a seeded-but-hidden chip would be impossible to uncheck.
const EDUCATION_AGE_RULES = {
  'Tobacco/vaping cessation': { minAge: AGE_BANDS.TOBACCO_MIN_AGE },
  'Oral cancer self-exam': { minAge: AGE_BANDS.ADULT_TOPIC_MIN_AGE },
  'Dry mouth management': { minAge: AGE_BANDS.ADULT_TOPIC_MIN_AGE },
  'Denture/prosthesis care': { minAge: AGE_BANDS.ADULT_TOPIC_MIN_AGE },
  'Bottle/sippy cup habits': { maxAge: AGE_BANDS.BOTTLE_TOPIC_MAX_AGE },
  'Bottle/sippy cup weaning': { maxAge: AGE_BANDS.BOTTLE_TOPIC_MAX_AGE },
  'Sippy cup/bottle use': { maxAge: AGE_BANDS.BOTTLE_TOPIC_MAX_AGE },
  'Teething/eruption timeline': { maxAge: AGE_BANDS.ERUPTION_TOPIC_MAX_AGE },
  'Pacifier/digit habit cessation': { maxAge: AGE_BANDS.HABIT_APPLIANCE_MAX_AGE },
  'Pacifier/digit habit': { maxAge: AGE_BANDS.HABIT_APPLIANCE_MAX_AGE }
}

const OCCLUSION_HABIT_AGE_RULES = {
  'Pacifier use': { maxAge: AGE_BANDS.HABIT_APPLIANCE_MAX_AGE },
  'Thumb/digit sucking': { maxAge: AGE_BANDS.HABIT_APPLIANCE_MAX_AGE }
}

const MEDICAL_CONDITION_AGE_RULES = {
  Pregnancy: { minAge: AGE_BANDS.PREGNANCY_MIN_AGE }
}

const CDT_AGE_RULES = {
  D1320: { minAge: AGE_BANDS.TOBACCO_MIN_AGE }
}

function allowedAtAge(rule, age) {
  if (!rule || !ageKnown(age)) return true
  if (rule.minAge !== undefined && age < rule.minAge) return false
  if (rule.maxAge !== undefined && age > rule.maxAge) return false
  return true
}

function filterByAge(list, age, rules, keyOf = (item) => item) {
  if (!ageKnown(age)) return list
  return list.filter((item) => allowedAtAge(rules[keyOf(item)], age))
}

export const filterEducationTopics = (topics, age) => filterByAge(topics, age, EDUCATION_AGE_RULES)

export const filterOcclusionHabits = (habits, age) => filterByAge(habits, age, OCCLUSION_HABIT_AGE_RULES)

export const filterMedicalConditions = (conditions, age) => filterByAge(conditions, age, MEDICAL_CONDITION_AGE_RULES)

export const filterCdtCodes = (codes, age) => filterByAge(codes, age, CDT_AGE_RULES, (c) => c.code)
