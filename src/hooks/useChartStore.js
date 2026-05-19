import { useReducer, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dental-chart-state-v1'

export const initialState = {
  visitSetup: {
    patientType: null,
    visitType: null,
    visitDate: new Date().toISOString().slice(0, 10),
    provider: null,
    age: null
  },
  scheduledTreatment: {
    procedures: []
  },
  medicalHistory: {
    changesSinceLastVisit: null,
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
    fullChartDone: false
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
  generatedNote: '',
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

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return setPath(state, action.path, action.value)
    case 'TOGGLE_ARRAY_ITEM': {
      const arr = getPath(state, action.path) || []
      const next = arr.includes(action.item)
        ? arr.filter((x) => x !== action.item)
        : [...arr, action.item]
      return setPath(state, action.path, next)
    }
    case 'SET_STEP':
      return { ...state, currentStep: action.step }
    case 'SET_GENERATED_NOTE':
      return { ...state, generatedNote: action.note }
    case 'RESET_FORM':
      return { ...initialState, visitSetup: { ...initialState.visitSetup, visitDate: new Date().toISOString().slice(0, 10) } }
    case 'HYDRATE':
      return action.state
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
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', step }), [])
  const setGeneratedNote = useCallback((note) => dispatch({ type: 'SET_GENERATED_NOTE', note }), [])
  const resetForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'RESET_FORM' })
  }, [])

  return { state, setField, toggleItem, setStep, setGeneratedNote, resetForm }
}
