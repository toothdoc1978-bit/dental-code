import { CheckChip, Section, PageTitle } from './shared.jsx'
import { RADIOGRAPH_TYPES, RADIOGRAPH_FINDINGS } from '../data/examDefaults.js'

export default function Radiographs({ store }) {
  const { state, setField, toggleItem } = store
  const r = state.radiographs

  return (
    <div>
      <PageTitle title="Radiographs" />

      <Section title="Radiographs Today">
        <CheckChip
          active={r.none}
          onClick={() => {
            const next = !r.none
            setField('radiographs.none', next)
            if (next) {
              setField('radiographs.taken', [])
              setField('radiographs.findings', [])
            }
          }}
        >
          No radiographs taken today
        </CheckChip>
      </Section>

      {!r.none && (
        <>
          <Section title="Types Taken">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RADIOGRAPH_TYPES.map((t) => (
                <CheckChip key={t} active={r.taken.includes(t)} onClick={() => toggleItem('radiographs.taken', t)}>{t}</CheckChip>
              ))}
            </div>
          </Section>

          <Section title="Findings">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RADIOGRAPH_FINDINGS.map((f) => (
                <CheckChip key={f} active={r.findings.includes(f)} onClick={() => toggleItem('radiographs.findings', f)}>{f}</CheckChip>
              ))}
            </div>
          </Section>

          <Section title="Additional Notes" hint="Optional">
            <input
              type="text"
              value={r.additionalNotes}
              onChange={(e) => setField('radiographs.additionalNotes', e.target.value)}
              placeholder="e.g., PA #19 shows widened PDL"
              className="input w-full"
            />
          </Section>
        </>
      )}
    </div>
  )
}
