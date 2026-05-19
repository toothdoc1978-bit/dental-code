import { Tile, Section, PageTitle, CheckChip } from './shared.jsx'
import { PERIO_CLASSIFICATION } from '../data/examDefaults.js'

export default function PerioAssessment({ store }) {
  const { state, setField } = store
  const p = state.perio

  const radioGroup = (path, value, options) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {options.map((o) => (
        <Tile key={o} active={value === o} onClick={() => setField(path, o)}>{o}</Tile>
      ))}
    </div>
  )

  return (
    <div>
      <PageTitle title="Periodontal Assessment" />

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
