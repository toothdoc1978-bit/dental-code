import { PageTitle } from './shared.jsx'
import CdtPicker from './CdtPicker.jsx'

export default function TreatmentRendered({ store }) {
  const { state, setField } = store
  return (
    <div>
      <PageTitle title="Treatment Rendered" subtitle="CDT codes performed today" />
      <CdtPicker
        patientType={state.visitSetup.patientType}
        selected={state.treatmentRendered}
        onChange={(v) => setField('treatmentRendered', v)}
      />
    </div>
  )
}
