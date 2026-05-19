import { Tile, CheckChip, Section, YesNo, PageTitle } from './shared.jsx'
import { MEDICAL_CONDITIONS, ALLERGY_OPTIONS } from '../data/examDefaults.js'

export default function MedicalHistory({ store }) {
  const { state, setField, toggleItem } = store
  const m = state.medicalHistory
  const nka = m.allergies.includes('NKA')

  return (
    <div>
      <PageTitle title="Medical History" />

      <Section title="Changes since last visit?">
        <YesNo value={m.changesSinceLastVisit} onChange={(v) => setField('medicalHistory.changesSinceLastVisit', v)} />
      </Section>

      <Section title="Conditions" hint="Check all that apply">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MEDICAL_CONDITIONS.map((c) => (
            <CheckChip key={c} active={m.conditions.includes(c)} onClick={() => toggleItem('medicalHistory.conditions', c)}>
              {c}
            </CheckChip>
          ))}
        </div>
      </Section>

      <Section title="Allergies">
        <div className="mb-2">
          <CheckChip
            active={nka}
            onClick={() => {
              if (nka) {
                toggleItem('medicalHistory.allergies', 'NKA')
              } else {
                setField('medicalHistory.allergies', ['NKA'])
              }
            }}
          >
            No Known Allergies (NKA)
          </CheckChip>
        </div>
        {!nka && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ALLERGY_OPTIONS.map((a) => (
              <CheckChip key={a} active={m.allergies.includes(a)} onClick={() => toggleItem('medicalHistory.allergies', a)}>
                {a}
              </CheckChip>
            ))}
          </div>
        )}
      </Section>

      <Section title="Current Medications" hint="Optional — brief list only (no patient identifiers)">
        <input
          type="text"
          value={m.medications}
          onChange={(e) => setField('medicalHistory.medications', e.target.value)}
          placeholder="e.g., lisinopril, metformin (or leave blank)"
          className="input w-full"
        />
      </Section>

      <Section title="ASA Physical Status">
        <div className="grid grid-cols-4 gap-2">
          {['I', 'II', 'III', 'IV'].map((c) => (
            <Tile key={c} active={m.asaClass === c} onClick={() => setField('medicalHistory.asaClass', c)}>
              ASA {c}
            </Tile>
          ))}
        </div>
      </Section>
    </div>
  )
}
