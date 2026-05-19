import { Section, PageTitle } from './shared.jsx'
import { SOFT_TISSUE_AREAS } from '../data/examDefaults.js'

export default function SoftTissueExam({ store }) {
  const { state, setField } = store
  const s = state.softTissue

  const allWnl = () => {
    SOFT_TISSUE_AREAS.forEach((a) => setField(`softTissue.${a.key}`, 'wnl'))
  }

  return (
    <div>
      <PageTitle title="Soft Tissue Exam" />

      <button onClick={allWnl} className="btn-primary mb-4">✓ Mark All WNL (one click)</button>

      <Section title="Per Area">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOFT_TISSUE_AREAS.map((area) => {
            const val = s[area.key]
            return (
              <div key={area.key} className="bg-white border border-slate-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm">{area.label}</strong>
                  <button
                    onClick={() => setField(`softTissue.${area.key}`, 'wnl')}
                    className={`text-xs px-2 py-1 rounded ${val === 'wnl' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    WNL
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {area.findings.map((f) => (
                    <button
                      key={f}
                      onClick={() => setField(`softTissue.${area.key}`, f)}
                      className={`text-xs px-2 py-1 rounded border ${
                        val === f ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
