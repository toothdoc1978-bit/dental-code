import { CheckChip, Section, PageTitle } from './shared.jsx'
import { DIAGNOSIS_QUICK_PICKS } from '../data/examDefaults.js'

export default function Diagnoses({ store }) {
  const { state, toggleItem } = store
  return (
    <div>
      <PageTitle title="Diagnoses" />
      <Section title="Quick Pick">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DIAGNOSIS_QUICK_PICKS.map((d) => (
            <CheckChip key={d} active={state.diagnoses.includes(d)} onClick={() => toggleItem('diagnoses', d)}>{d}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
