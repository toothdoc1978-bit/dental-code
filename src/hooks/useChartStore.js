import { useReducer, useEffect, useCallback } from 'react'
import { EPSDT_DEFAULT_COUNSELING, EPSDT_DEFAULT_EDUCATION } from '../data/examDefaults.js'

const STORAGE_KEY = 'dental-chart-state-v1'

const union = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]))

const PHI_KEYS = ['patientName', 'name', 'dob', 'medicaidId', 'ssn', 'address', 'phone']

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isEmptyScalar = (v) => v === null || v === undefined || v === ''

function hasPhi(value) {
  if (value === null || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasPhi)
  for (const k of Object.keys(value)) {
    if (PHI_KEYS.includes(k)) return true
    if (hasPhi(value[k])) return true
  }
  return false
}

function mergeFragment(existing, incoming) {
  if (Array.isArray(existing) && Array.isArray(incoming)) {
    return union(existing, incoming)
  }
  if (isPlainObject(existing) && isPlainObject(incoming)) {
    const out = { ...existing }
    for (const k of Object.keys(incoming)) {
      if (!(k in existing)) continue
      out[k] = mergeFragment(existing[k], incoming[k])
    }
    return out
  }
  return isEmptyScalar(existing) ? incoming : existing
}

export const initialState = {
  visitSetup: {
    patientType: null,
    visitType: null,
    visitDate: new Date().toISOString().slice(0, 10),
    provider: null,
    age: null,
    extraSections: []
  },
  scheduledTreatment: {
    procedures: []
  },
  medicalHistory: {
    changesSinceLastVisit: null,
    changesDetail: '',
    conditions: [],
    allergies: [],
    medications: '',
    asaClass: null
  },
  chiefComplaint: {
    type: null,
    location: '',
    duration: null,
    severity: null,
    character: []
  },
  epsdtScreening: {
    developmentWNL: null,
    waterSource: null,
    supplementalFluoride: [],
    cariesRisk: null,
    riskFactors: [],
    counselingTopics: [],
    referralsNeeded: []
  },
  softTissue: {
    lips: 'wnl',
    buccalMucosa: 'wnl',
    hardPalate: 'wnl',
    softPalate: 'wnl',
    tongue: 'wnl',
    floorOfMouth: 'wnl',
    gingiva: 'wnl',
    oropharynx: 'wnl',
    lymphNodes: 'wnl',
    tmj: 'wnl'
  },
  toothChart: {},
  dentitionType: 'permanent',
  perio: {
    periodontiumType: null,
    bop: null,
    pocketDepthRange: null,
    furcation: null,
    calculus: null,
    mobility: null,
    ohStatus: null,
    fullChartDone: false,
    pediatricVisualExam: false
  },
  occlusion: {
    molarClassR: null,
    molarClassL: null,
    canineClassR: null,
    canineClassL: null,
    overjet: null,
    overbite: null,
    midline: null,
    crossbite: null,
    habits: []
  },
  radiographs: {
    none: false,
    taken: [],
    findings: [],
    additionalNotes: ''
  },
  treatmentRendered: [],
  diagnoses: [],
  treatmentPlan: [],
  patientEducation: [],
  signedConsents: [],
  epsdtDefaultsApplied: false,
  // false = soft-tissue exam never performed this visit. Distinct from the
  // all-'wnl' softTissue defaults, which only mean "no abnormal findings
  // entered" — the note generator must never claim a full negative exam
  // unless the step was actually opened.
  softTissueExamined: false,
  generatedNote: '',
  patientSummary: '',
  currentStep: 0
}

function setPath(obj, path, value) {
  const keys = path.split('.')
  const next = { ...obj }
  let cursor = next
  for (let i = 0; i < keys.length - 1; i++) {
    cursor[keys[i]] = { ...cursor[keys[i]] }
    cursor = cursor[keys[i]]
  }
  cursor[keys[keys.length - 1]] = value
  return next
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}

// EPSDT defaults must seed from the reducer, not a step-component mount:
// focused (limited/emergency) visits never render the EPSDT step, so a
// mount-based seed would silently skip. Pediatric perio seeding stays
// mount-based on purpose — it asserts a visual exam, which is only true
// when the Perio step actually renders.
function maybeSeedVisitDefaults(state) {
  const { patientType, visitType } = state.visitSetup
  if (state.epsdtDefaultsApplied) return state
  if (patientType !== 'epsdt' || !['comprehensive', 'periodic'].includes(visitType)) return state
  return {
    ...state,
    epsdtDefaultsApplied: true,
    epsdtScreening: {
      ...state.epsdtScreening,
      counselingTopics: union(state.epsdtScreening.counselingTopics, EPSDT_DEFAULT_COUNSELING)
    },
    patientEducation: union(state.patientEducation, EPSDT_DEFAULT_EDUCATION)
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const next = setPath(state, action.path, action.value)
      return action.path.startsWith('visitSetup.') ? maybeSeedVisitDefaults(next) : next
    }
    case 'TOGGLE_ARRAY_ITEM': {
      const arr = getPath(state, action.path) || []
      const next = arr.includes(action.item)
        ? arr.filter((x) => x !== action.item)
        : [...arr, action.item]
      return setPath(state, action.path, next)
    }
    case 'SEED_EPSDT_DEFAULTS':
      if (state.epsdtDefaultsApplied) return state
      return {
        ...state,
        epsdtDefaultsApplied: true,
        epsdtScreening: {
          ...state.epsdtScreening,
          counselingTopics: union(state.epsdtScreening.counselingTopics, EPSDT_DEFAULT_COUNSELING)
        },
        patientEducation: union(state.patientEducation, EPSDT_DEFAULT_EDUCATION)
      }
    case 'SEED_PEDIATRIC_PERIO':
      return {
        ...state,
        perio: {
          ...state.perio,
          pediatricVisualExam: true,
          periodontiumType: state.perio.periodontiumType || 'Periodontally Healthy',
          ohStatus: state.perio.ohStatus || 'Good'
        }
      }
    case 'SET_STEP':
      return { ...state, currentStep: action.step }
    case 'SET_GENERATED_NOTE':
      return { ...state, generatedNote: action.note }
    case 'SET_PATIENT_SUMMARY':
      return { ...state, patientSummary: action.summary }
    case 'RESET_FORM':
      return { ...initialState, visitSetup: { ...initialState.visitSetup, visitDate: new Date().toISOString().slice(0, 10) } }
    case 'APPLY_FRAGMENT':
      return maybeSeedVisitDefaults(mergeFragment(state, action.fragment))
    case 'HYDRATE':
      return maybeSeedVisitDefaults(action.state)
    default:
      return state
  }
}

export function useChartStore() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.radiographs?.taken?.length && typeof parsed.radiographs.taken[0] === 'string') {
          parsed.radiographs.taken = parsed.radiographs.taken.map((t) => ({ type: t, reason: '', panoIndications: [] }))
        }
        if (parsed.scheduledTreatment?.procedures?.length) {
          parsed.scheduledTreatment.procedures = parsed.scheduledTreatment.procedures.map((p) => {
            if (p.type !== 'crown') return p
            if (p.appointmentType === 'Prep') return { ...p, appointmentType: 'Prep (lab case)' }
            if (p.appointmentType === 'Seat') return { ...p, appointmentType: 'Seat (lab case delivery)' }
            return p
          })
        }
        if (parsed.visitSetup && !Array.isArray(parsed.visitSetup.extraSections)) {
          parsed.visitSetup.extraSections = []
        }
        if (!('softTissueExamined' in parsed)) {
          // Pre-flag charts: full-exam visits walked the soft-tissue step by
          // definition; otherwise only count an exam if a finding was entered.
          parsed.softTissueExamined =
            ['comprehensive', 'periodic'].includes(parsed.visitSetup?.visitType) ||
            Object.values(parsed.softTissue || {}).some((v) => v !== 'wnl')
        }
        dispatch({ type: 'HYDRATE', state: { ...initialState, ...parsed } })
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const setField = useCallback((path, value) => dispatch({ type: 'SET_FIELD', path, value }), [])
  const toggleItem = useCallback((path, item) => dispatch({ type: 'TOGGLE_ARRAY_ITEM', path, item }), [])
  const seedEpsdtDefaults = useCallback(() => dispatch({ type: 'SEED_EPSDT_DEFAULTS' }), [])
  const seedPediatricPerio = useCallback(() => dispatch({ type: 'SEED_PEDIATRIC_PERIO' }), [])
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', step }), [])
  const setGeneratedNote = useCallback((note) => dispatch({ type: 'SET_GENERATED_NOTE', note }), [])
  const setPatientSummary = useCallback((summary) => dispatch({ type: 'SET_PATIENT_SUMMARY', summary }), [])
  const resetForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'RESET_FORM' })
  }, [])
  const applyFragment = useCallback((fragment) => {
    if (!isPlainObject(fragment)) return { ok: false, error: 'invalid-shape' }
    if (hasPhi(fragment)) return { ok: false, error: 'disallowed-field' }
    dispatch({ type: 'APPLY_FRAGMENT', fragment })
    return { ok: true, mergedKeys: Object.keys(fragment) }
  }, [])

  return { state, setField, toggleItem, seedEpsdtDefaults, seedPediatricPerio, setStep, setGeneratedNote, setPatientSummary, resetForm, applyFragment }
}
