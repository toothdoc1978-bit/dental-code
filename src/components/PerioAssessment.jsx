import { useEffect } from 'react'
import { Tile, Section, PageTitle, CheckChip } from './shared.jsx'
import { PERIO_CLASSIFICATION } from '../data/examDefaults.js'

export default function PerioAssessment({ store }) {
  const { state, setField, seedPediatricPerio } = store
  const p = state.perio
  const age = state.visitSetup.age
  const isYoungChild = age != null && age < 12

  useEffect(() => {
    if (isYoungChild && !p.pediatricVisualExam && p.periodontiumType == null) seedPediatricPerio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYoungChild])

  const radioGroup = (path, value, options) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {options.map((o) => (
        <Tile key={o} active={value === o} onClick={() => setField(path, o)}>{o}</Tile>
      ))}
    </div>
  )

  if (isYoungChild && p.pediatricVisualExam) {
    return (
      <div>
        <PageTitle
          title="Periodontal Assessment"
          subtitle="Patient under 12 — age-appropriate visual assessment. Full probing (BOP, pocket depths) deferred as not clinically indicated."
        />

        <div className="mb-4 p-3 bg-clinical-50 border border-clinical-200 rounded text-sm text-clinical-800">
          Visual examination of a healthy pediatric periodontium. Comprehensive probing is not routinely
          indicated under age 12; only a visual gingival assessment and oral hygiene status are documented.
        </div>

        <Section title="Visual Periodontal Condition">
          {radioGroup('perio.periodontiumType', p.periodontiumType, PERIO_CLASSIFICATION)}
        </Section>

        <Section title="Oral Hygiene Status">
          {radioGroup('perio.ohStatus', p.ohStatus, ['Good', 'Fair', 'Poor'])}
        </Section>

        <Section title="Need full periodontal probing instead?">
          <CheckChip active={false} onClick={() => setField('perio.pediatricVisualExam', false)}>
            Document full probing (BOP, pocket depths) for this child
          </CheckChip>
        </Section>
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Periodontal Assessment" />

      {isYoungChild && (
        <Section title="Assessment mode">
          <CheckChip active={false} onClick={() => seedPediatricPerio()}>
            Use age-appropriate visual assessment (under 12 — defer probing)
          </CheckChip>
        </Section>
      )}

      <Section title="Classification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PERIO_CLASSIFICATION.map((c) => (
            <Tile key={c} active={p.periodontiumType === c} onClick={() => setField('perio.periodontiumType', c)}>{c}</Tile>
          ))}
        </div>
      </Section>

      <Section title="Bleeding on Probing (BOP)">
        {radioGroup('perio.bop', p.bop, ['None', 'Localized (<30%)', 'Generalized (≥30%)'])}
      </Section>

      <Section title="Pocket Depth Range">
        {radioGroup('perio.pocketDepthRange', p.pocketDepthRange, ['1–3 mm (WNL)', '4–5 mm', '6+ mm'])}
      </Section>

      <Section title="Furcation">
        {radioGroup('perio.furcation', p.furcation, ['None', 'Class I', 'Class II', 'Class III'])}
      </Section>

      <Section title="Calculus">
        {radioGroup('perio.calculus', p.calculus, ['None', 'Supra-light', 'Supra-moderate/heavy', 'Subgingival present'])}
      </Section>

      <Section title="Mobility">
        {radioGroup('perio.mobility', p.mobility, ['None', 'Localized present'])}
      </Section>

      <Section title="Oral Hygiene Status">
        {radioGroup('perio.ohStatus', p.ohStatus, ['Good', 'Fair', 'Poor'])}
      </Section>

      <Section title="Full perio chart completed separately?">
        <CheckChip active={p.fullChartDone} onClick={() => setField('perio.fullChartDone', !p.fullChartDone)}>
          Yes - documented in separate periodontal chart
        </CheckChip>
      </Section>
    </div>
  )
}
