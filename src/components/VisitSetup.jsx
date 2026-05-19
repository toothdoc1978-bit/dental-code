import { Tile, Section, PageTitle } from './shared.jsx'
import { PATIENT_TYPES, VISIT_TYPES, PROVIDERS } from '../data/examDefaults.js'

export default function VisitSetup({ store }) {
  const { state, setField } = store
  const v = state.visitSetup
  const isScheduled = v.visitType === 'scheduled'

  return (
    <div>
      <PageTitle title="Visit Setup" subtitle="Three taps to start. Do NOT enter patient name or identifiers anywhere in this app." />

      <Section title="Patient Type">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PATIENT_TYPES.map((p) => (
            <Tile key={p.value} active={v.patientType === p.value} onClick={() => setField('visitSetup.patientType', p.value)}>
              <div className="font-semibold">{p.label}</div>
              <div className="text-xs opacity-70 mt-1">{p.desc}</div>
            </Tile>
          ))}
        </div>
      </Section>

      <Section title="Visit Type">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {VISIT_TYPES.map((t) => (
            <Tile key={t.value} active={v.visitType === t.value} onClick={() => setField('visitSetup.visitType', t.value)}>
              {t.label}
            </Tile>
          ))}
        </div>
      </Section>

      <Section title="Date of Service">
        <input
          type="date"
          value={v.visitDate}
          onChange={(e) => setField('visitSetup.visitDate', e.target.value)}
          className="input w-48"
        />
      </Section>

      {isScheduled && (
        <Section title="Provider" hint="Required for scheduled treatment visits.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PROVIDERS.map((p) => (
              <Tile key={p} active={v.provider === p} onClick={() => setField('visitSetup.provider', p)}>
                {p}
              </Tile>
            ))}
          </div>
        </Section>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
        <strong>HIPAA reminder:</strong> This app never collects or stores patient names, DOB, or Medicaid ID.
        The generated note will use <code>[PATIENT]</code> as a placeholder — you replace it after pasting into Dentrix.
      </div>
    </div>
  )
}
