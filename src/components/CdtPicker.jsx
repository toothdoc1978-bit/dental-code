import { useState } from 'react'
import { CDT_BY_CATEGORY, CDT_CATEGORIES, EPSDT_FAVORITES, lookupCdt } from '../data/cdtCodes.js'

export default function CdtPicker({ patientType, selected, onChange, withPriority = false }) {
  const isEpsdt = patientType === 'epsdt'
  const tabs = isEpsdt ? ['Favorites', ...CDT_CATEGORIES] : CDT_CATEGORIES
  const [tab, setTab] = useState(tabs[0])
  const [search, setSearch] = useState('')

  const sourceList =
    tab === 'Favorites'
      ? EPSDT_FAVORITES
      : (CDT_BY_CATEGORY[tab] || []).map((c) => ({ ...c, category: tab }))

  const filtered = search
    ? sourceList.filter(
        (c) => c.code.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
      )
    : sourceList

  const addCode = (c) => {
    const newItem = {
      cdtCode: c.code,
      description: c.desc,
      teeth: [],
      surfaces: [],
      ...(withPriority ? { priority: 'elective' } : {})
    }
    onChange([...selected, newItem])
  }

  const removeAt = (i) => {
    onChange(selected.filter((_, idx) => idx !== i))
  }

  const updateAt = (i, patch) => {
    onChange(selected.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-md p-3">
        <input
          type="text"
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full mb-3 text-sm"
        />
        <div className="flex flex-wrap gap-1 mb-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-2 py-1 rounded ${
                tab === t ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="max-h-96 overflow-y-auto flex flex-col gap-1">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => addCode(c)}
              className="text-left px-2 py-1.5 text-sm rounded hover:bg-clinical-50 border border-slate-100"
            >
              <span className="font-mono font-bold text-clinical-700">{c.code}</span>{' '}
              <span className="text-slate-700">{c.desc}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-400 p-2">No codes match.</p>}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-3">
        <h4 className="text-sm font-semibold mb-2">Selected ({selected.length})</h4>
        {selected.length === 0 && <p className="text-sm text-slate-400">No codes selected yet.</p>}
        <div className="flex flex-col gap-2">
          {selected.map((item, i) => {
            const meta = lookupCdt(item.cdtCode) || {}
            return (
              <div key={i} className="border border-slate-200 rounded p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-mono font-bold text-clinical-700">{item.cdtCode}</span>{' '}
                    <span className="text-slate-700">{item.description}</span>
                  </div>
                  <button onClick={() => removeAt(i)} className="text-xs text-red-600 hover:text-red-800">✕</button>
                </div>
                {meta.toothRequired && (
                  <input
                    type="text"
                    placeholder="Tooth # (e.g., 19 or A)"
                    value={item.teeth.join(', ')}
                    onChange={(e) =>
                      updateAt(i, {
                        teeth: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      })
                    }
                    className="input mt-2 w-full text-xs"
                  />
                )}
                {meta.surfaceRequired && (
                  <div className="flex gap-1 mt-2">
                    {['M', 'O/I', 'D', 'B/F', 'L/P'].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          updateAt(i, {
                            surfaces: item.surfaces.includes(s)
                              ? item.surfaces.filter((x) => x !== s)
                              : [...item.surfaces, s]
                          })
                        }
                        className={`flex-1 text-xs py-1 rounded border ${
                          item.surfaces.includes(s) ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {withPriority && (
                  <div className="flex gap-1 mt-2">
                    {[
                      { v: 'urgent', l: 'Urgent' },
                      { v: 'soon', l: 'Soon' },
                      { v: 'elective', l: 'Elective' }
                    ].map((p) => (
                      <button
                        key={p.v}
                        onClick={() => updateAt(i, { priority: p.v })}
                        className={`flex-1 text-xs py-1 rounded border ${
                          item.priority === p.v ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
