import { Tile, CheckChip, Section, YesNo, PageTitle } from './shared.jsx'
import { MEDICAL_CONDITIONS, ALLERGY_OPTIONS } from '../data/examDefaults.js'
import { filterMedicalConditions } from '../data/ageBands.js'

function ChangesDetail({ value, onChange }) {
  return (
    <Section
      title="Reported changes"
      hint="New medications, recent surgeries or hospitalizations, significant health events, or age-related changes reported by the patient or guardian."
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., started lisinopril 20 mg; appendectomy 3 weeks ago; recent hospitalization for pneumonia; loss of spouse 2 months ago"
        rows={4}
        className="input w-full"
      />
    </Section>
  )
}

export default function MedicalHistory({ store }) {
  const { state, setField, toggleItem } = store
  const m = state.medicalHistory
  const isScheduled = state.visitSetup.visitType === 'scheduled'
  const nka = m.allergies.includes('NKA')

  if (isScheduled) {
    return (
      <div>
        <PageTitle
          title="Medical History — Interim Review"
          subtitle="Confirm the patient was asked about changes since the last visit, and capture anything new they reported."
        />
        <Section
          title="Any changes to medical history since last visit?"
          hint="Selecting Yes or No confirms the review was conducted. Use the textbox below to record any new medications, recent surgeries, hospitalizations, life events, or age-related changes."
        >
          <YesNo value={m.changesSinceLastVisit} onChange={(v) => setField('medicalHistory.changesSinceLastVisit', v)} />
        </Section>
        {m.changesSinceLastVisit === true && (
          <ChangesDetail value={m.changesDetail} onChange={(v) => setField('medicalHistory.changesDetail', v)} />
        )}
      </div>
    )
  }

  return (
    <div>
      <PageTitle title="Medical History" />

      <Section title="Changes since last visit?">
        <YesNo value={m.changesSinceLastVisit} onChange={(v) => setField('medicalHistory.changesSinceLastVisit', v)} />
      </Section>

      {m.changesSinceLastVisit === true && (
        <ChangesDetail value={m.changesDetail} onChange={(v) => setField('medicalHistory.changesDetail', v)} />
      )}

      <Section title="Conditions" hint="Check all that apply">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filterMedicalConditions(MEDICAL_CONDITIONS, state.visitSetup.age).map((c) => (
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
