import { useEffect, useState } from 'react'
import { Tile, Section, PageTitle } from './shared.jsx'
import { PATIENT_TYPES, VISIT_TYPES, PROVIDERS } from '../data/examDefaults.js'

export default function VisitSetup({ store }) {
  const { state, setField, applyFragment } = store
  const v = state.visitSetup
  const isScheduled = v.visitType === 'scheduled'

  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape' && !loading) setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, loading])

  const closeModal = () => {
    if (loading) return
    setIsOpen(false)
    setCode('')
    setError('')
    setSuccessMsg('')
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    const normalized = code.trim().toUpperCase()
    try {
      const res = await fetch(`/api/intake-fetch?code=${encodeURIComponent(normalized)}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`)
      const result = applyFragment(json.chartFragment)
      if (!result.ok) {
        throw new Error(
          result.error === 'disallowed-field'
            ? 'Intake data contained a disallowed field. Import refused.'
            : 'Intake data was malformed.'
        )
      }
      setSuccessMsg('Intake imported. Empty fields filled; existing entries preserved.')
      setTimeout(() => {
        setIsOpen(false)
        setCode('')
        setSuccessMsg('')
      }, 1500)
    } catch (e) {
      setError(e.message || 'Failed to fetch intake')
    } finally {
      setLoading(false)
    }
  }

  const codeValid = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.trim().toUpperCase())

  return (
    <div>
      <PageTitle title="Visit Setup" subtitle="Three taps to start. Do NOT enter patient name or identifiers anywhere in this app." />

      <div className="mb-6 p-4 bg-clinical-50 border border-clinical-200 rounded flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-clinical-800">
          <strong>Pre-visit intake?</strong> Enter the patient's visit code to pre-fill medical history, chief complaint, and consents from the home form.
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIsOpen(true)}
        >
          Import from intake form
        </button>
      </div>

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

      <Section title="Patient Age" hint="Enables age-specific clinical logic (e.g., pediatric pano justification under 6). Age alone is not PHI under HIPAA Safe Harbor for patients under 90.">
        <input
          type="number"
          min="0"
          max="120"
          value={v.age ?? ''}
          onChange={(e) => setField('visitSetup.age', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="years"
          className="input w-32"
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

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intake-modal-title"
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="intake-modal-title" className="text-lg font-semibold text-slate-800">
              Import from intake form
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Enter the visit code from the patient's appointment card or text message.
            </p>

            <label className="block mt-4 text-sm font-medium text-slate-700">
              Visit code
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD-1234"
                pattern="[A-Z0-9]{4}-[A-Z0-9]{4}"
                className="input mt-1 w-full font-mono uppercase tracking-wider"
                disabled={loading}
              />
              <span className="text-xs text-slate-500 mt-1 block">Format: ABCD-1234</span>
            </label>

            {error && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded">
                {successMsg}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={submit}
                disabled={loading || !codeValid}
              >
                {loading ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
