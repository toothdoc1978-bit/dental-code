import { Tile, CheckChip, Section, PageTitle } from './shared.jsx'
import { CC_TYPES, PAIN_CHARACTER } from '../data/examDefaults.js'
import { isFocusedVisit } from '../data/ageBands.js'

const EXTRA_SECTION_OPTIONS = [
  { key: 'soft', label: 'Soft Tissue Exam' },
  { key: 'perio', label: 'Perio Assessment' },
  { key: 'occ', label: 'Occlusion Exam' }
]

export default function ChiefComplaint({ store }) {
  const { state, setField, toggleItem } = store
  const c = state.chiefComplaint
  const focused = isFocusedVisit(state.visitSetup.visitType)
  const extras = state.visitSetup.extraSections || []

  return (
    <div>
      <PageTitle title="Chief Complaint" />

      <Section title="Reason for Visit">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CC_TYPES.map((t) => (
            <Tile key={t.value} active={c.type === t.value} onClick={() => setField('chiefComplaint.type', t.value)}>
              {t.label}
            </Tile>
          ))}
        </div>
      </Section>

      {c.type === 'pain' && (
        <>
          <Section title="Location" hint="Tooth # or area">
            <input
              type="text"
              value={c.location}
              onChange={(e) => setField('chiefComplaint.location', e.target.value)}
              placeholder="e.g., #19 or UR quadrant"
              className="input w-64"
            />
          </Section>

          <Section title="Duration">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: '<1wk', l: 'Less than 1 week' },
                { v: '1-4wk', l: '1–4 weeks' },
                { v: '>1mo', l: 'More than 1 month' }
              ].map((d) => (
                <Tile key={d.v} active={c.duration === d.v} onClick={() => setField('chiefComplaint.duration', d.v)}>
                  {d.l}
                </Tile>
              ))}
            </div>
          </Section>

          <Section title="Severity (1–10)">
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setField('chiefComplaint.severity', n)}
                  className={`w-12 h-12 rounded-md font-semibold border-2 ${
                    c.severity === n ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Pain Character">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAIN_CHARACTER.map((p) => (
                <CheckChip key={p} active={c.character.includes(p)} onClick={() => toggleItem('chiefComplaint.character', p)}>
                  {p}
                </CheckChip>
              ))}
            </div>
          </Section>
        </>
      )}

      {focused && (
        <Section
          title="Add exam sections for this visit"
          hint="Problem-focused visits skip these by default. Add any you actually performed today."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {EXTRA_SECTION_OPTIONS.map((s) => (
              <CheckChip key={s.key} active={extras.includes(s.key)} onClick={() => toggleItem('visitSetup.extraSections', s.key)}>
                {s.label}
              </CheckChip>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
