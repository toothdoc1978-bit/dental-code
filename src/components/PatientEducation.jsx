import { CheckChip, Section, PageTitle } from './shared.jsx'
import { EDUCATION_TOPICS } from '../data/examDefaults.js'

export default function PatientEducation({ store }) {
  const { state, toggleItem } = store
  return (
    <div>
      <PageTitle title="Patient Education" />
      <Section title="Topics Discussed">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDUCATION_TOPICS.map((t) => (
            <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
