import { CheckChip, Section, PageTitle } from './shared.jsx'
import {
  RADIOGRAPH_TYPES,
  RADIOGRAPH_FINDINGS,
  RADIOGRAPH_COMMON_REASONS,
  PEDIATRIC_PANO_INDICATIONS,
  PEDIATRIC_PANO_ALARA_FOOTER
} from '../data/examDefaults.js'

function isPano(type) {
  return type === 'Panoramic'
}

function buildPanoReason(indicationIds) {
  if (!indicationIds?.length) return ''
  const all = PEDIATRIC_PANO_INDICATIONS.flatMap((g) => g.items)
  // The ALARA catch-all is intentionally excluded from the auto-fill — its phrasing is
  // generated dynamically server-side to avoid producing cloned-note text across visits.
  const docs = indicationIds
    .filter((id) => id !== 'alara-retake')
    .map((id) => all.find((x) => x.id === id)?.documentation)
    .filter(Boolean)
  if (!docs.length) return ''
  return `${docs.join(' ')} ${PEDIATRIC_PANO_ALARA_FOOTER}`
}

export default function Radiographs({ store }) {
  const { state, setField } = store
  const r = state.radiographs
  const age = state.visitSetup.age
  const isPediatricUnder6 = age !== null && age < 6

  const toggleType = (type) => {
    const exists = r.taken.find((t) => t.type === type)
    if (exists) {
      setField('radiographs.taken', r.taken.filter((t) => t.type !== type))
    } else {
      setField('radiographs.taken', [...r.taken, { type, reason: '', panoIndications: [] }])
    }
  }

  const setReason = (type, value) => {
    setField('radiographs.taken', r.taken.map((t) => (t.type === type ? { ...t, reason: value } : t)))
  }

  const setCatchAllReason = (type, value) => {
    setField('radiographs.taken', r.taken.map((t) => (t.type === type ? { ...t, alaraCatchAllReason: value } : t)))
  }

  const setQuickReason = (type, reason) => setReason(type, reason)

  const togglePanoIndication = (type, id) => {
    setField(
      'radiographs.taken',
      r.taken.map((t) => {
        if (t.type !== type) return t
        const has = (t.panoIndications || []).includes(id)
        const next = has ? t.panoIndications.filter((x) => x !== id) : [...(t.panoIndications || []), id]
        return { ...t, panoIndications: next, reason: buildPanoReason(next) || t.reason }
      })
    )
  }

  const toggleFinding = (f) => {
    const has = r.findings.includes(f)
    setField('radiographs.findings', has ? r.findings.filter((x) => x !== f) : [...r.findings, f])
  }

  return (
    <div>
      <PageTitle title="Radiographs" subtitle="ALARA requires a specific clinical reason for every image. Each radiograph below needs a reason documented." />

      <Section title="Radiographs Today">
        <CheckChip
          active={r.none}
          onClick={() => {
            const next = !r.none
            setField('radiographs.none', next)
            if (next) {
              setField('radiographs.taken', [])
              setField('radiographs.findings', [])
            }
          }}
        >
          No radiographs taken today
        </CheckChip>
      </Section>

      {!r.none && (
        <>
          <Section title="Types Taken" hint="Tap to add. Each entry below requires a reason.">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RADIOGRAPH_TYPES.map((t) => (
                <CheckChip key={t} active={!!r.taken.find((x) => x.type === t)} onClick={() => toggleType(t)}>{t}</CheckChip>
              ))}
            </div>
          </Section>

          {r.taken.length > 0 && (
            <Section title="ALARA Justification (per radiograph)">
              {r.taken.map((entry) => {
                const showPanoChecklist = isPano(entry.type) && isPediatricUnder6
                return (
                  <div key={entry.type} className="mb-4 border border-slate-200 rounded-lg">
                    <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-800 border-b border-slate-200">
                      {entry.type}
                      {showPanoChecklist && (
                        <span className="ml-2 text-xs font-normal text-amber-700">
                          Patient is under 6 — check all that apply below; the rationale auto-fills.
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reason / clinical question being answered</label>
                      <textarea
                        value={entry.reason}
                        onChange={(e) => setReason(entry.type, e.target.value)}
                        placeholder="e.g., High caries risk profile; pain in LR quadrant"
                        className="input w-full min-h-[60px] mb-2"
                      />
                      {!showPanoChecklist && (
                        <div className="flex flex-wrap gap-1">
                          {RADIOGRAPH_COMMON_REASONS.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setQuickReason(entry.type, q)}
                              className="text-xs px-2 py-1 bg-slate-100 hover:bg-clinical-100 hover:text-clinical-700 text-slate-600 rounded"
                            >
                              + {q}
                            </button>
                          ))}
                        </div>
                      )}

                      {showPanoChecklist && (
                        <div className="mt-3 space-y-3">
                          {PEDIATRIC_PANO_INDICATIONS.map((group) => (
                            <details key={group.category} open className="border border-slate-200 rounded">
                              <summary className="cursor-pointer px-3 py-2 bg-slate-50 font-semibold text-sm text-slate-700">
                                {group.category}
                              </summary>
                              <div className="p-3 space-y-1">
                                {group.items.map((item) => {
                                  const active = (entry.panoIndications || []).includes(item.id)
                                  return (
                                    <CheckChip
                                      key={item.id}
                                      active={active}
                                      onClick={() => togglePanoIndication(entry.type, item.id)}
                                    >
                                      <span className="text-xs">{item.label}</span>
                                    </CheckChip>
                                  )
                                })}
                              </div>
                            </details>
                          ))}
                          {(entry.panoIndications || []).includes('alara-retake') && (
                            <div className="border border-amber-300 bg-amber-50 rounded p-3">
                              <label className="block text-sm font-semibold text-amber-900 mb-1">
                                ALARA catch-all: specific clinical reason being assessed
                              </label>
                              <p className="text-xs text-amber-800 mb-2">
                                Be specific (e.g., "developing permanent dentition and root morphology of #J/K", "interproximal caries assessment"). The note generator will <strong>rephrase the ALARA catch-all language fresh every visit</strong> to avoid cloned-note audit flags, while preserving the medical-legal defenses (barrier, ALARA, cumulative-radiation avoidance, digital extraoral + pediatric collimation).
                              </p>
                              <input
                                type="text"
                                value={entry.alaraCatchAllReason || ''}
                                onChange={(e) => setCatchAllReason(entry.type, e.target.value)}
                                placeholder="e.g., evaluation of developing dentition prior to space maintenance"
                                className="input w-full"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </Section>
          )}

          <Section title="Findings">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RADIOGRAPH_FINDINGS.map((f) => (
                <CheckChip key={f} active={r.findings.includes(f)} onClick={() => toggleFinding(f)}>{f}</CheckChip>
              ))}
            </div>
          </Section>

          <Section title="Additional Notes" hint="Optional">
            <input
              type="text"
              value={r.additionalNotes}
              onChange={(e) => setField('radiographs.additionalNotes', e.target.value)}
              placeholder="e.g., PA #19 shows widened PDL"
              className="input w-full"
            />
          </Section>
        </>
      )}
    </div>
  )
}
