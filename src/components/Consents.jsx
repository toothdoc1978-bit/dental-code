import { CheckChip, Section, PageTitle } from './shared.jsx'
import { CONSENTS, derivedRequiredConsents } from '../data/examDefaults.js'

export default function Consents({ store }) {
  const { state, setField } = store
  const cdtCodes = [
    ...(state.treatmentRendered || []).map((t) => t.cdtCode),
    ...(state.treatmentPlan || []).map((t) => t.cdtCode)
  ].filter(Boolean)
  const required = new Set(derivedRequiredConsents(cdtCodes))
  const signed = state.signedConsents || []

  const toggle = (id) => {
    if (signed.includes(id)) {
      setField('signedConsents', signed.filter((x) => x !== id))
    } else {
      setField('signedConsents', [...signed, id])
    }
  }

  const requiredList = CONSENTS.filter((c) => required.has(c.id))
  const otherList = CONSENTS.filter((c) => !required.has(c.id))
  const missingRequired = requiredList.filter((c) => !signed.includes(c.id))

  return (
    <div>
      <PageTitle
        title="Consents"
        subtitle="Required consents are derived from the procedures rendered and planned. Tap each form once it has been signed (paper or digital)."
      />

      {missingRequired.length > 0 && (
        <div className="mb-6 p-3 border border-amber-300 bg-amber-50 rounded text-sm text-amber-900">
          <strong>{missingRequired.length}</strong> required {missingRequired.length === 1 ? 'consent has' : 'consents have'} not been recorded as signed:
          <ul className="list-disc pl-5 mt-1">
            {missingRequired.map((c) => <li key={c.id}>{c.label}</li>)}
          </ul>
        </div>
      )}

      <Section title={`Required for today's procedures (${requiredList.length})`}>
        {requiredList.length === 0 && (
          <p className="text-sm text-slate-500">No procedure-driven consents are required based on the CDT codes on the chart. Confirm with the Treatment Rendered / Treatment Plan steps.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {requiredList.map((c) => (
            <CheckChip key={c.id} active={signed.includes(c.id)} onClick={() => toggle(c.id)}>
              {c.label}
            </CheckChip>
          ))}
        </div>
      </Section>

      <Section title="Optional / additional consents" hint="Document if signed even though not directly required by today's CDT codes.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {otherList.map((c) => (
            <CheckChip key={c.id} active={signed.includes(c.id)} onClick={() => toggle(c.id)}>
              {c.label}
            </CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
