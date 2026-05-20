import { CheckChip, Section, PageTitle } from './shared.jsx'
import { DIAGNOSIS_QUICK_PICKS, lookupCrosswalk } from '../data/examDefaults.js'

function suggestedFromProcedures(treatmentRendered, treatmentPlan) {
  // Pulls primary ICD + first alt for every CDT code on today's chart, plus
  // every CDT code on the treatment plan. De-duplicates by ICD code; output
  // entries are {icd, label, suggestedFor: [codes…]}.
  const map = new Map()
  const codes = [
    ...(treatmentRendered || []).map((t) => t.cdtCode),
    ...(treatmentPlan || []).map((t) => t.cdtCode)
  ].filter(Boolean)

  for (const code of codes) {
    const xw = lookupCrosswalk(code)
    if (!xw) continue
    const candidates = [xw.primary, ...(xw.alts || [])]
    for (const c of candidates) {
      if (!c?.icd) continue
      const existing = map.get(c.icd) || { icd: c.icd, label: c.label, suggestedFor: new Set() }
      existing.suggestedFor.add(code)
      map.set(c.icd, existing)
    }
  }
  return Array.from(map.values()).map((v) => ({ ...v, suggestedFor: Array.from(v.suggestedFor) }))
}

function displayLabel(item) {
  if (typeof item === 'string') return item
  return `${item.icd} — ${item.label}`
}

export default function Diagnoses({ store }) {
  const { state, setField, toggleItem } = store
  const suggestions = suggestedFromProcedures(state.treatmentRendered, state.treatmentPlan)

  const toggleSuggestion = (s) => {
    const label = displayLabel(s)
    const current = state.diagnoses || []
    if (current.includes(label)) {
      setField('diagnoses', current.filter((x) => x !== label))
    } else {
      setField('diagnoses', [...current, label])
    }
  }

  return (
    <div>
      <PageTitle title="Diagnoses" subtitle="ICD-10 codes auto-suggested from the procedures rendered and planned. Tap to add to the visit." />

      {suggestions.length > 0 && (
        <Section
          title="Suggested from today's procedures"
          hint="Each suggestion pulls primary and alternate ICD-10 codes from the CDT crosswalk. Pick the codes that match the patient's actual diagnosis."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((s) => {
              const label = displayLabel(s)
              const active = (state.diagnoses || []).includes(label)
              return (
                <CheckChip key={s.icd} active={active} onClick={() => toggleSuggestion(s)}>
                  <span className="text-left">
                    <span className="font-mono text-xs text-clinical-700">{s.icd}</span>
                    <span className="ml-2 text-sm">{s.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">from {s.suggestedFor.join(', ')}</span>
                  </span>
                </CheckChip>
              )
            })}
          </div>
        </Section>
      )}

      <Section title="Quick Pick — common diagnostic narratives">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DIAGNOSIS_QUICK_PICKS.map((d) => (
            <CheckChip key={d} active={(state.diagnoses || []).includes(d)} onClick={() => toggleItem('diagnoses', d)}>
              {d}
            </CheckChip>
          ))}
        </div>
      </Section>

      {(state.diagnoses || []).length > 0 && (
        <Section title={`Selected (${state.diagnoses.length})`}>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-0.5">
            {state.diagnoses.map((d, i) => (
              <li key={`${d}-${i}`}>{d}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
