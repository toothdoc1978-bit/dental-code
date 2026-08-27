import { useState } from 'react'
import { PageTitle } from './shared.jsx'
import { findJargon } from '../data/plainLanguage.js'

export default function NoteOutput({ store }) {
  const { state, setGeneratedNote, setPatientSummary } = store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [summaryCopied, setSummaryCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartData: state })
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      setGeneratedNote(json.note)
    } catch (e) {
      setError(e.message || 'Failed to generate note')
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async () => {
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const res = await fetch('/api/patient-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartData: state })
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      setPatientSummary(json.summary)
    } catch (e) {
      setSummaryError(e.message || 'Failed to generate patient summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedNote)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(state.patientSummary)
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 1500)
    } catch {}
  }

  const jargonHits = findJargon(state.patientSummary)

  return (
    <div>
      <PageTitle title="Chart Note" subtitle="AI-generated narrative. Each regeneration produces a unique variation." />

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={generate} disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Generating…' : state.generatedNote ? 'Regenerate (New Variation)' : 'Generate Chart Note'}
        </button>
        {state.generatedNote && (
          <button onClick={copy} className="btn-secondary">
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
          <p className="text-xs mt-1 text-red-600">Ensure the backend is running and ANTHROPIC_API_KEY is set in .env.</p>
        </div>
      )}

      {state.generatedNote && (
        <>
          <textarea
            value={state.generatedNote}
            onChange={(e) => setGeneratedNote(e.target.value)}
            className="w-full min-h-[400px] p-4 font-mono text-sm border border-slate-300 rounded-md focus:ring-clinical-500 focus:border-clinical-500"
          />
          <p className="text-xs text-slate-500 mt-2">
            Replace <code>[PATIENT]</code> with the patient's name after pasting into Dentrix. Review for accuracy before saving.
          </p>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Patient Visit Summary</h2>
        <p className="text-sm text-slate-600 mt-1 mb-3">
          Plain-language "what we did today" to hand or read to the patient/guardian. Written at a 6th-grade level with no clinical jargon.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={generateSummary} disabled={summaryLoading} className="btn-secondary disabled:opacity-50">
            {summaryLoading ? 'Generating…' : state.patientSummary ? 'Regenerate Summary' : 'Generate Patient Summary'}
          </button>
          {state.patientSummary && (
            <button onClick={copySummary} className="btn-secondary">
              {summaryCopied ? '✓ Copied!' : 'Copy Summary'}
            </button>
          )}
        </div>

        {summaryError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{summaryError}</div>
        )}

        {state.patientSummary && (
          <>
            <div
              className={`mb-2 inline-block text-xs px-2 py-1 rounded ${
                jargonHits.length
                  ? 'bg-amber-50 border border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {jargonHits.length
                ? `⚠ Plain-language check: contains ${jargonHits.join(', ')}`
                : '✓ Plain-language check: clean'}
            </div>
            <textarea
              value={state.patientSummary}
              onChange={(e) => setPatientSummary(e.target.value)}
              className="w-full min-h-[220px] p-4 text-sm border border-slate-300 rounded-md focus:ring-clinical-500 focus:border-clinical-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Review before handing to the patient. This summary is a courtesy document — the chart note above remains the record.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
