import { CheckChip, Section, PageTitle } from './shared.jsx'
import { EDUCATION_TOPICS, EDUCATION_TOPICS_EPSDT } from '../data/examDefaults.js'

export default function PatientEducation({ store }) {
  const { state, toggleItem } = store
  const isEpsdt = state.visitSetup.patientType === 'epsdt'

  return (
    <div>
      <PageTitle title="Patient Education" />

      {isEpsdt && (
        <Section title="EPSDT Priority Topics" hint="Required documentation elements appear first for MCNA compliance">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EDUCATION_TOPICS_EPSDT.map((t) => (
              <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
            ))}
          </div>
        </Section>
      )}

      <Section title={isEpsdt ? 'Additional Topics' : 'Topics Discussed'}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EDUCATION_TOPICS.map((t) => (
            <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
