import { CheckChip, Section, PageTitle } from './shared.jsx'
import { EDUCATION_TOPICS, EDUCATION_TOPICS_EPSDT, EDUCATION_TOPICS_FOCUSED } from '../data/examDefaults.js'
import { isFocusedVisit, filterEducationTopics } from '../data/ageBands.js'

export default function PatientEducation({ store }) {
  const { state, toggleItem } = store
  const isEpsdt = state.visitSetup.patientType === 'epsdt'
  const focused = isFocusedVisit(state.visitSetup.visitType)
  const age = state.visitSetup.age
  const additionalTopics = filterEducationTopics(
    isEpsdt ? EDUCATION_TOPICS.filter((t) => t !== 'Denture/prosthesis care') : EDUCATION_TOPICS,
    age
  )

  if (focused) {
    return (
      <div>
        <PageTitle title="Patient Education" />
        <Section title="Visit-Relevant Topics" hint="Problem-focused visit — comprehensive education topics return on exam visits.">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EDUCATION_TOPICS_FOCUSED.map((t) => (
              <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
            ))}
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Patient Education" />

      {isEpsdt && (
        <Section title="EPSDT Priority Topics" hint="Required documentation elements appear first for MCNA compliance">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filterEducationTopics(EDUCATION_TOPICS_EPSDT, age).map((t) => (
              <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
            ))}
          </div>
        </Section>
      )}

      <Section title={isEpsdt ? 'Additional Topics' : 'Topics Discussed'}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {additionalTopics.map((t) => (
            <CheckChip key={t} active={state.patientEducation.includes(t)} onClick={() => toggleItem('patientEducation', t)}>{t}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
