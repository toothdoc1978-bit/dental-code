import { useState } from 'react'
import { Section, PageTitle, Tile } from './shared.jsx'
import { TOOTH_CONDITIONS, TOOTH_SURFACES } from '../data/examDefaults.js'

const PERMANENT_UPPER = Array.from({ length: 16 }, (_, i) => String(i + 1))
const PERMANENT_LOWER = Array.from({ length: 16 }, (_, i) => String(32 - i))
const PRIMARY_UPPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const PRIMARY_LOWER = ['T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K']

export default function ToothChart({ store }) {
  const { state, setField, toggleItem } = store
  const [selectedTooth, setSelectedTooth] = useState(null)
  const dentition = state.dentitionType
  const upper = dentition === 'primary' ? PRIMARY_UPPER : PERMANENT_UPPER
  const lower = dentition === 'primary' ? PRIMARY_LOWER : PERMANENT_LOWER

  const getToothState = (t) => state.toothChart[t] || { conditions: [], surfaces: [] }

  const toggleCondition = (cond) => {
    if (!selectedTooth) return
    const t = getToothState(selectedTooth)
    const next = t.conditions.includes(cond) ? t.conditions.filter((c) => c !== cond) : [...t.conditions, cond]
    setField(`toothChart.${selectedTooth}`, { ...t, conditions: next })
  }

  const toggleSurface = (surf) => {
    if (!selectedTooth) return
    const t = getToothState(selectedTooth)
    const next = t.surfaces.includes(surf) ? t.surfaces.filter((s) => s !== surf) : [...t.surfaces, surf]
    setField(`toothChart.${selectedTooth}`, { ...t, surfaces: next })
  }

  const renderTooth = (n) => {
    const t = getToothState(n)
    const hasFindings = t.conditions.length > 0
    const isSelected = selectedTooth === n
    return (
      <button
        key={n}
        onClick={() => setSelectedTooth(n)}
        className={`w-10 h-12 rounded text-xs font-mono font-bold border-2 transition-all ${
          isSelected
            ? 'bg-clinical-600 text-white border-clinical-700 scale-110'
            : hasFindings
            ? 'bg-amber-100 border-amber-500 text-amber-900'
            : 'bg-white border-slate-300 hover:border-clinical-400'
        }`}
        title={hasFindings ? t.conditions.join(', ') : 'WNL'}
      >
        {n}
      </button>
    )
  }

  const sel = selectedTooth ? getToothState(selectedTooth) : null

  return (
    <div>
      <PageTitle title="Hard Tissue / Tooth Chart" subtitle="Click a tooth, then mark conditions and surfaces." />

      <Section title="Dentition">
        <div className="grid grid-cols-3 gap-2 max-w-md">
          {['permanent', 'mixed', 'primary'].map((d) => (
            <Tile key={d} active={dentition === d} onClick={() => setField('dentitionType', d)}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Tile>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500 mb-2">Maxillary (Upper)</div>
          <div className="flex gap-1 flex-wrap mb-4">{upper.map(renderTooth)}</div>
          <div className="text-xs text-slate-500 mb-2">Mandibular (Lower)</div>
          <div className="flex gap-1 flex-wrap">{lower.map(renderTooth)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 sticky top-32 h-fit">
          {!selectedTooth ? (
            <p className="text-sm text-slate-500">Select a tooth to mark conditions.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <strong className="text-lg">Tooth #{selectedTooth}</strong>
                <button
                  onClick={() => {
                    setField(`toothChart.${selectedTooth}`, { conditions: [], surfaces: [] })
                  }}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Clear
                </button>
              </div>

              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-1">Surfaces</div>
                <div className="flex gap-1">
                  {TOOTH_SURFACES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSurface(s)}
                      className={`flex-1 py-2 text-xs font-bold rounded border-2 ${
                        sel.surfaces.includes(s) ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Conditions</div>
                <div className="flex flex-col gap-1">
                  {TOOTH_CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`text-left px-2 py-1.5 text-sm rounded border ${
                        sel.conditions.includes(c)
                          ? 'bg-clinical-50 border-clinical-500 text-clinical-700'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sel.conditions.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
