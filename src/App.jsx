import { useMemo } from 'react'
import { useChartStore } from './hooks/useChartStore.js'
import { isFocusedVisit } from './data/ageBands.js'
import VisitSetup from './components/VisitSetup.jsx'
import MedicalHistory from './components/MedicalHistory.jsx'
import ChiefComplaint from './components/ChiefComplaint.jsx'
import EpsdtScreening from './components/EpsdtScreening.jsx'
import SoftTissueExam from './components/SoftTissueExam.jsx'
import ToothChart from './components/ToothChart.jsx'
import PerioAssessment from './components/PerioAssessment.jsx'
import OcclusionExam from './components/OcclusionExam.jsx'
import Radiographs from './components/Radiographs.jsx'
import TreatmentRendered from './components/TreatmentRendered.jsx'
import Diagnoses from './components/Diagnoses.jsx'
import TreatmentPlan from './components/TreatmentPlan.jsx'
import PatientEducation from './components/PatientEducation.jsx'
import NoteOutput from './components/NoteOutput.jsx'
import ScheduledTreatment from './components/ScheduledTreatment.jsx'
import Consents from './components/Consents.jsx'
import Audit, { computeAuditScore } from './components/Audit.jsx'

// Canonical full-exam order. Focused (limited/emergency) visits filter this
// list down; the escape-hatch chips on the Chief Complaint page can add
// 'soft'/'perio'/'occ' back via visitSetup.extraSections.
//
// Index-stability invariant: the extraSections chips render ONLY on the CC
// page (index 2), and every togglable step sits at canonical index >= 3.
// Toggling can therefore never shift the step the user is standing on. Keep
// the chips on CC (or earlier) if they ever move.
const FULL_EXAM_STEPS = [
  { key: 'setup', label: 'Setup', Component: VisitSetup },
  { key: 'medHx', label: 'Med Hx', Component: MedicalHistory },
  { key: 'cc', label: 'CC', Component: ChiefComplaint },
  { key: 'epsdt', label: 'EPSDT', Component: EpsdtScreening },
  { key: 'soft', label: 'Soft Tissue', Component: SoftTissueExam },
  { key: 'teeth', label: 'Teeth', Component: ToothChart },
  { key: 'perio', label: 'Perio', Component: PerioAssessment },
  { key: 'occ', label: 'Occlusion', Component: OcclusionExam },
  { key: 'xray', label: 'X-ray', Component: Radiographs },
  { key: 'tx', label: 'Tx Done', Component: TreatmentRendered },
  { key: 'dx', label: 'Dx', Component: Diagnoses },
  { key: 'plan', label: 'Tx Plan', Component: TreatmentPlan },
  { key: 'edu', label: 'Education', Component: PatientEducation },
  { key: 'consents', label: 'Consents', Component: Consents },
  { key: 'audit', label: 'Audit', Component: Audit },
  { key: 'note', label: 'Note', Component: NoteOutput }
]

const FOCUSED_HIDDEN_KEYS = ['soft', 'perio', 'occ']

function getSteps(patientType, visitType, extraSections) {
  if (visitType === 'scheduled') {
    return [
      { key: 'setup', label: 'Setup', Component: VisitSetup },
      { key: 'medHx', label: 'Med Hx', Component: MedicalHistory },
      { key: 'procs', label: 'Procedures', Component: ScheduledTreatment },
      { key: 'consents', label: 'Consents', Component: Consents },
      { key: 'audit', label: 'Audit', Component: Audit },
      { key: 'note', label: 'Note', Component: NoteOutput }
    ]
  }
  const focused = isFocusedVisit(visitType)
  const extras = extraSections || []
  return FULL_EXAM_STEPS.filter(({ key }) => {
    if (key === 'epsdt') return patientType === 'epsdt' && !focused
    if (FOCUSED_HIDDEN_KEYS.includes(key)) return !focused || extras.includes(key)
    return true
  })
}

export default function App() {
  const store = useChartStore()
  const { state, setStep, resetForm } = store

  const steps = useMemo(
    () => getSteps(state.visitSetup.patientType, state.visitSetup.visitType, state.visitSetup.extraSections),
    [state.visitSetup.patientType, state.visitSetup.visitType, state.visitSetup.extraSections]
  )
  const auditScore = useMemo(() => computeAuditScore(state), [state])
  const safeStep = Math.min(state.currentStep, steps.length - 1)
  const Current = steps[safeStep].Component
  const setupComplete =
    state.visitSetup.patientType &&
    state.visitSetup.visitType &&
    state.visitSetup.visitDate &&
    (state.visitSetup.visitType !== 'scheduled' || state.visitSetup.provider)
  const canAdvance = safeStep > 0 || setupComplete

  const onReset = () => {
    if (confirm('Reset entire chart? This cannot be undone.')) resetForm()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-clinical-700">Dental Charting Companion</h1>
            <p className="text-xs text-slate-500">
              Louisiana EPSDT / MCNA + General — No PHI stored
              <span className="ml-2 font-mono text-slate-400" title="Build identity">v{__APP_VERSION__} · {__BUILD_SHA__}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              title={`${auditScore.passing} of ${auditScore.total} required audit checks passing`}
              className={`text-xs font-semibold px-2 py-1 rounded ${
                auditScore.pct >= 90
                  ? 'bg-emerald-100 text-emerald-700'
                  : auditScore.pct >= 70
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              Audit {auditScore.pct}%
            </span>
            <span className="text-sm text-slate-600">Step {safeStep + 1} of {steps.length}</span>
            <button onClick={onReset} className="btn-secondary text-sm">Reset</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-clinical-500 transition-all" style={{ width: `${((safeStep + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="flex gap-1 flex-wrap mt-2">
            {steps.map((s, i) => (
              <button
                key={s.key}
                onClick={() => i <= safeStep && setStep(i)}
                disabled={i > safeStep}
                className={`text-xs px-2 py-1 rounded ${
                  i === safeStep
                    ? 'bg-clinical-600 text-white'
                    : i < safeStep
                    ? 'bg-clinical-100 text-clinical-700 hover:bg-clinical-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < safeStep ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Current store={store} />
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, safeStep - 1))}
            disabled={safeStep === 0}
            className="btn-secondary disabled:opacity-40"
          >
            ← Back
          </button>
          <span className="text-sm text-slate-500">{steps[safeStep].label}</span>
          <button
            onClick={() => setStep(Math.min(steps.length - 1, safeStep + 1))}
            disabled={safeStep === steps.length - 1 || !canAdvance}
            className="btn-primary disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </footer>
    </div>
  )
}
