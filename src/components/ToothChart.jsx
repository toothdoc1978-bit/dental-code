import { useState } from 'react'
import { Section, PageTitle, Tile } from './shared.jsx'
import { TOOTH_CONDITIONS, TOOTH_SURFACES } from '../data/examDefaults.js'

const PERMANENT_UPPER = Array.from({ length: 16 }, (_, i) => String(i + 1))
const PERMANENT_LOWER = Array.from({ length: 16 }, (_, i) => String(32 - i))
const PRIMARY_UPPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const PRIMARY_LOWER = ['T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K']

const SURFACE_FILL = {
  Caries: '#dc2626',
  'Existing amalgam': '#475569',
  'Existing composite': '#fef3c7',
  'Sealant present': '#67e8f9'
}

const SURFACE_PRIORITY = ['Caries', 'Existing amalgam', 'Existing composite', 'Sealant present']

function pickSurfaceColor(conditions) {
  for (const c of SURFACE_PRIORITY) if (conditions.includes(c)) return SURFACE_FILL[c]
  return null
}

function ToothGlyph({ tooth, isSelected }) {
  const conditions = tooth.conditions || []
  const surfaces = tooth.surfaces || []
  const missing = conditions.includes('Missing')
  const crown = conditions.includes('Crown')
  const implant = conditions.includes('Implant')
  const rct = conditions.includes('Root canal treated')
  const pa = conditions.includes('Periapical pathology')
  const watch = conditions.includes('Watch/monitor')
  const fracture = conditions.includes('Fracture')
  const mobility = conditions.includes('Mobility')

  const surfaceColor = pickSurfaceColor(conditions)
  const fillSurface = (s) => {
    if (crown) return '#fbbf24'
    if (implant) return '#1f2937'
    if (!surfaceColor) return '#ffffff'
    if (surfaces.length === 0) return s === 'O/I' ? surfaceColor : '#ffffff'
    return surfaces.includes(s) ? surfaceColor : '#ffffff'
  }

  // 40x40 viewbox: outer corners (0,0)-(40,40), inner occlusal (12,12)-(28,28)
  const stroke = isSelected ? '#0369a1' : '#94a3b8'
  const strokeWidth = isSelected ? 2 : 1
  const dash = mobility ? '2,2' : undefined

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full block">
      {pa && <rect x="1" y="1" width="38" height="38" rx="4" fill="none" stroke="#dc2626" strokeWidth="2" />}
      <g>
        {/* B/F top trapezoid */}
        <polygon points="0,0 40,0 28,12 12,12" fill={fillSurface('B/F')} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        {/* D right */}
        <polygon points="40,0 40,40 28,28 28,12" fill={fillSurface('D')} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        {/* L/P bottom */}
        <polygon points="0,40 40,40 28,28 12,28" fill={fillSurface('L/P')} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        {/* M left */}
        <polygon points="0,0 0,40 12,28 12,12" fill={fillSurface('M')} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        {/* O/I center */}
        <polygon points="12,12 28,12 28,28 12,28" fill={fillSurface('O/I')} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      </g>
      {missing && (
        <g stroke="#64748b" strokeWidth="3" strokeLinecap="round">
          <line x1="6" y1="6" x2="34" y2="34" />
          <line x1="34" y1="6" x2="6" y2="34" />
        </g>
      )}
      {rct && !missing && <circle cx="20" cy="20" r="3" fill="#a855f7" />}
      {fracture && !missing && <line x1="4" y1="36" x2="36" y2="4" stroke="#dc2626" strokeWidth="2" />}
      {watch && !missing && <circle cx="34" cy="6" r="3" fill="#f59e0b" />}
    </svg>
  )
}

export default function ToothChart({ store }) {
  const { state, setField } = store
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
    const isSelected = selectedTooth === n
    const tooltip = t.conditions.length
      ? `#${n}: ${t.conditions.join(', ')}${t.surfaces.length ? ` (${t.surfaces.join('')})` : ''}`
      : `#${n}: WNL`
    return (
      <button
        key={n}
        onClick={() => setSelectedTooth(n)}
        title={tooltip}
        className={`flex flex-col items-center gap-0.5 p-0.5 rounded transition-all ${
          isSelected ? 'bg-clinical-100 ring-2 ring-clinical-500' : 'hover:bg-slate-100'
        }`}
      >
        <div className="w-9 h-9">
          <ToothGlyph tooth={t} isSelected={isSelected} />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-600 leading-none">{n}</span>
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-slate-600">
        <span className="font-medium text-slate-500">Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#dc2626' }} /> Caries</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#475569' }} /> Amalgam</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-slate-300" style={{ background: '#fef3c7' }} /> Composite</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#fbbf24' }} /> Crown</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#67e8f9' }} /> Sealant</span>
        <span>✕ Missing</span>
        <span className="text-purple-600">● RCT</span>
        <span className="text-amber-600">● Watch</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500 mb-2">Maxillary (Upper)</div>
          <div className="flex gap-0.5 flex-wrap mb-4">{upper.map(renderTooth)}</div>
          <div className="text-xs text-slate-500 mb-2">Mandibular (Lower)</div>
          <div className="flex gap-0.5 flex-wrap">{lower.map(renderTooth)}</div>
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
