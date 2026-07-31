import { useState } from 'react'
import { PageTitle } from './shared.jsx'

export default function NoteOutput({ store }) {
  const { state, setGeneratedNote } = store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedNote)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

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
    </div>
  )
}
