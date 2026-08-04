import { Tile, CheckChip, Section, PageTitle } from './shared.jsx'
import { OCCLUSION_HABITS } from '../data/examDefaults.js'
import { filterOcclusionHabits } from '../data/ageBands.js'

export default function OcclusionExam({ store }) {
  const { state, setField, toggleItem } = store
  const o = state.occlusion

  const classRow = (label, path, value) => (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-16 text-sm font-medium">{label}</span>
      {['I', 'II', 'III'].map((c) => (
        <Tile key={c} active={value === c} onClick={() => setField(path, c)}>Class {c}</Tile>
      ))}
    </div>
  )

  const radioGroup = (path, value, options) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {options.map((o) => (
        <Tile key={o} active={value === o} onClick={() => setField(path, o)}>{o}</Tile>
      ))}
    </div>
  )

  return (
    <div>
      <PageTitle title="Occlusion" />

      <Section title="Molar Relationship">
        {classRow('Right', 'occlusion.molarClassR', o.molarClassR)}
        {classRow('Left', 'occlusion.molarClassL', o.molarClassL)}
      </Section>

      <Section title="Canine Relationship">
        {classRow('Right', 'occlusion.canineClassR', o.canineClassR)}
        {classRow('Left', 'occlusion.canineClassL', o.canineClassL)}
      </Section>

      <Section title="Overjet">
        {radioGroup('occlusion.overjet', o.overjet, ['WNL (2–4mm)', 'Increased', 'Decreased', 'Edge-to-edge'])}
      </Section>

      <Section title="Overbite">
        {radioGroup('occlusion.overbite', o.overbite, ['WNL', 'Deep', 'Open', 'Edge-to-edge'])}
      </Section>

      <Section title="Midline">
        {radioGroup('occlusion.midline', o.midline, ['Coincident', 'Upper deviated R', 'Upper deviated L', 'Lower deviated R', 'Lower deviated L'])}
      </Section>

      <Section title="Crossbite">
        {radioGroup('occlusion.crossbite', o.crossbite, ['None', 'Anterior', 'Posterior R', 'Posterior L', 'Bilateral posterior'])}
      </Section>

      <Section title="Habits">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filterOcclusionHabits(OCCLUSION_HABITS, state.visitSetup.age).map((h) => (
            <CheckChip key={h} active={o.habits.includes(h)} onClick={() => toggleItem('occlusion.habits', h)}>{h}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
