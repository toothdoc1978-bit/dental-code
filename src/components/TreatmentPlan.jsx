import { PageTitle } from './shared.jsx'
import CdtPicker from './CdtPicker.jsx'

export default function TreatmentPlan({ store }) {
  const { state, setField } = store
  return (
    <div>
      <PageTitle title="Treatment Plan" subtitle="Recommended future treatment" />
      <CdtPicker
        patientType={state.visitSetup.patientType}
        age={state.visitSetup.age}
        selected={state.treatmentPlan}
        onChange={(v) => setField('treatmentPlan', v)}
        withPriority
      />
    </div>
  )
}
