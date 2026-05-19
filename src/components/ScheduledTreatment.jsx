import { useEffect } from 'react'
import { Tile, Section, PageTitle, CheckChip } from './shared.jsx'
import {
  ANESTHESIA_OPTIONS,
  CEREC_OPTIONS,
  PROCEDURE_TYPES,
  TOOTH_SURFACES_ALL,
  FILLING_DEFAULTS,
  FILLING_OPTIONS,
  CROWN_DEFAULTS,
  CROWN_OPTIONS,
  EXTRACTION_DEFAULTS,
  EXTRACTION_OPTIONS
} from '../data/examDefaults.js'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function makeProcedure(type) {
  const defaults = {
    filling: FILLING_DEFAULTS,
    crown: CROWN_DEFAULTS,
    extraction: EXTRACTION_DEFAULTS
  }[type]
  return { id: makeId(), type, ...defaults }
}

function isPosteriorTooth(toothStr) {
  if (!toothStr) return false
  const n = Number(toothStr)
  if (!Number.isFinite(n)) return false
  return (n >= 1 && n <= 3) || (n >= 14 && n <= 19) || (n >= 30 && n <= 32)
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="input w-full">
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

function TextInput({ value, onChange, ...rest }) {
  return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="input w-full" {...rest} />
}

function NumberInput({ value, onChange, ...rest }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="input w-24"
      {...rest}
    />
  )
}

function TextArea({ value, onChange }) {
  return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="input w-full min-h-[60px]" />
}

function SurfacePicker({ value, onChange }) {
  const toggle = (s) => {
    const next = value.includes(s) ? value.filter((x) => x !== s) : [...value, s]
    onChange(next)
  }
  return (
    <div className="flex gap-2">
      {TOOTH_SURFACES_ALL.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={`w-10 h-10 rounded font-semibold ${value.includes(s) ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function AnesthesiaFields({ proc, update }) {
  // Legacy-shape repair: rows that pre-date the structured split carried a single
  // `anesthesia` string. Drop them onto the new defaults on first render so the
  // Selects don't render empty controls.
  useEffect(() => {
    if (proc.anestheticDrug == null) {
      update('anestheticDrug', ANESTHESIA_OPTIONS.drug[0])
      const fallbackCarpules = proc.type === 'extraction' ? 2 : proc.type === 'crown' ? 1.5 : 1
      update('anestheticCarpules', fallbackCarpules)
      const fallbackTechnique = proc.type === 'extraction' ? 'Infiltration + IAN block' : 'Infiltration'
      update('anestheticTechnique', fallbackTechnique)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <Field label="Anesthetic drug">
        <Select value={proc.anestheticDrug} onChange={(v) => update('anestheticDrug', v)} options={ANESTHESIA_OPTIONS.drug} />
      </Field>
      <Field label="Carpules">
        <NumberInput value={proc.anestheticCarpules} onChange={(v) => update('anestheticCarpules', v)} min="0.5" max="6" step="0.5" />
      </Field>
      <Field label="Technique">
        <Select value={proc.anestheticTechnique} onChange={(v) => update('anestheticTechnique', v)} options={ANESTHESIA_OPTIONS.technique} />
      </Field>
    </>
  )
}

function FillingForm({ proc, update }) {
  const isAmalgam = proc.material === 'Amalgam'
  const isComposite = proc.material === 'Composite'

  // Heal legacy bondingAgent values that no longer appear in the option list.
  useEffect(() => {
    if (proc.bondingAgent && !FILLING_OPTIONS.bondingAgent.includes(proc.bondingAgent)) {
      update('bondingAgent', FILLING_DEFAULTS.bondingAgent)
    }
    if (proc.material !== 'Amalgam' && !proc.desensitizers) {
      update('desensitizers', ['None'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDesensitizer = (opt) => {
    const cur = proc.desensitizers || ['None']
    if (opt === 'None') {
      update('desensitizers', ['None'])
      return
    }
    const has = cur.includes(opt)
    const without = cur.filter((x) => x !== opt && x !== 'None')
    const next = has ? without : [...without, opt]
    update('desensitizers', next.length ? next : ['None'])
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Tooth #">
          <TextInput value={proc.tooth} onChange={(v) => update('tooth', v)} placeholder="e.g., 19" />
        </Field>
        <Field label="Surfaces (M / O / D / B / L / I)">
          <SurfacePicker value={proc.surfaces} onChange={(v) => update('surfaces', v)} />
        </Field>
        <Field label="Restorative material">
          <Select value={proc.material} onChange={(v) => update('material', v)} options={FILLING_OPTIONS.material} />
        </Field>
        <Field label="Decay depth (MCNA)">
          <Select value={proc.decayDepth} onChange={(v) => update('decayDepth', v)} options={FILLING_OPTIONS.decayDepth} />
        </Field>
        <AnesthesiaFields proc={proc} update={update} />
        <Field label="Isolation">
          <TextInput value={proc.isolation} onChange={(v) => update('isolation', v)} />
        </Field>
        <Field label="Prep method">
          <Select value={proc.prepMethod} onChange={(v) => update('prepMethod', v)} options={FILLING_OPTIONS.prepMethod} />
        </Field>
        {!isAmalgam && (
          <>
            <Field label="Etch type">
              <Select value={proc.etchType} onChange={(v) => update('etchType', v)} options={FILLING_OPTIONS.etchType} />
            </Field>
            <Field label="Etch time — enamel (sec)">
              <NumberInput value={proc.etchTimeEnamel} onChange={(v) => update('etchTimeEnamel', v)} min="0" max="60" />
            </Field>
            <Field label="Etch time — dentin (sec)">
              <NumberInput value={proc.etchTimeDentin} onChange={(v) => update('etchTimeDentin', v)} min="0" max="60" />
            </Field>
            <Field label="Bonding agent">
              <Select value={proc.bondingAgent} onChange={(v) => update('bondingAgent', v)} options={FILLING_OPTIONS.bondingAgent} />
            </Field>
            <Field label="Light-cure time (sec per layer)">
              <NumberInput value={proc.cureTimeSec} onChange={(v) => update('cureTimeSec', v)} min="0" max="120" />
            </Field>
          </>
        )}
        {isComposite && (
          <Field label="Composite product">
            <Select
              value={proc.compositeProduct || FILLING_OPTIONS.compositeProduct[0]}
              onChange={(v) => update('compositeProduct', v)}
              options={FILLING_OPTIONS.compositeProduct}
            />
          </Field>
        )}
        <Field label="Base / liner">
          <Select value={proc.base} onChange={(v) => update('base', v)} options={FILLING_OPTIONS.base} />
        </Field>
      </div>

      {isAmalgam && (
        <Field label="Desensitizer(s) placed under restoration">
          <div className="flex flex-wrap gap-2">
            {FILLING_OPTIONS.desensitizer.map((d) => (
              <CheckChip
                key={d}
                active={(proc.desensitizers || ['None']).includes(d)}
                onClick={() => toggleDesensitizer(d)}
              >
                {d}
              </CheckChip>
            ))}
          </div>
        </Field>
      )}

      <div className="flex gap-3 mt-2">
        {!isAmalgam && (
          <CheckChip active={proc.msdsReviewed} onClick={() => update('msdsReviewed', !proc.msdsReviewed)}>
            Bonding agent applied per MSDS
          </CheckChip>
        )}
        <CheckChip active={proc.occlusionAdjusted} onClick={() => update('occlusionAdjusted', !proc.occlusionAdjusted)}>
          Occlusion checked and adjusted
        </CheckChip>
      </div>
      <Field label="Additional details">
        <TextArea value={proc.additionalNotes} onChange={(v) => update('additionalNotes', v)} />
      </Field>
    </>
  )
}

function CerecBlock({ proc, update }) {
  // Auto-default Riva Star ON for posterior numeric teeth when vital. Once the user
  // clicks the chip explicitly (true OR false), their choice persists.
  useEffect(() => {
    if (proc.vitality === 'Vital' && proc.rivaStarApplied === undefined) {
      update('rivaStarApplied', isPosteriorTooth(proc.tooth))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proc.tooth, proc.vitality])

  // Heal legacy cementation values that no longer appear in the option list.
  useEffect(() => {
    if (proc.cementation && !CROWN_OPTIONS.cementation.includes(proc.cementation)) {
      update('cementation', CROWN_DEFAULTS.cementation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Field label="Scan device">
        <Select value={proc.cerecScanDevice} onChange={(v) => update('cerecScanDevice', v)} options={CEREC_OPTIONS.scanDevice} />
      </Field>
      <Field label="Mill">
        <Select value={proc.cerecMill} onChange={(v) => update('cerecMill', v)} options={CEREC_OPTIONS.mill} />
      </Field>
      <Field label="Sintering / crystallization">
        <Select value={proc.cerecCrystallization} onChange={(v) => update('cerecCrystallization', v)} options={CEREC_OPTIONS.crystallization} />
      </Field>
      <Field label="Crown material">
        <Select value={proc.cerecCrownMaterial} onChange={(v) => update('cerecCrownMaterial', v)} options={CEREC_OPTIONS.crownMaterial} />
      </Field>
      <Field label="Pulpal vitality">
        <Select value={proc.vitality} onChange={(v) => update('vitality', v)} options={CEREC_OPTIONS.vitality} />
      </Field>
      <Field label="Cementation">
        <Select
          value={proc.cementation || CROWN_OPTIONS.cementation[0]}
          onChange={(v) => update('cementation', v)}
          options={CROWN_OPTIONS.cementation}
        />
      </Field>
      {proc.vitality === 'Vital' && (
        <div className="md:col-span-2">
          <CheckChip
            active={!!proc.rivaStarApplied}
            onClick={() => update('rivaStarApplied', !proc.rivaStarApplied)}
          >
            Riva Star desensitizer applied immediately post-scan
          </CheckChip>
        </div>
      )}
    </>
  )
}

function CrownForm({ proc, update }) {
  const apt = proc.appointmentType
  const isPrep = apt === 'Prep (lab case)' || apt === 'Prep'
  const isSeat = apt === 'Seat (lab case delivery)' || apt === 'Seat'
  const isCerec = apt === 'Same-day CEREC'
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Tooth #">
          <TextInput value={proc.tooth} onChange={(v) => update('tooth', v)} placeholder="e.g., 19" />
        </Field>
        <Field label="Appointment">
          <Select value={apt} onChange={(v) => update('appointmentType', v)} options={CROWN_OPTIONS.appointmentType} />
        </Field>
        <Field label="Crown type">
          <Select value={proc.crownType} onChange={(v) => update('crownType', v)} options={CROWN_OPTIONS.crownType} />
        </Field>
        <AnesthesiaFields proc={proc} update={update} />
        {isPrep && (
          <>
            <Field label="Reduction">
              <TextInput value={proc.reduction} onChange={(v) => update('reduction', v)} />
            </Field>
            <Field label="Margin design">
              <Select value={proc.marginDesign} onChange={(v) => update('marginDesign', v)} options={CROWN_OPTIONS.marginDesign} />
            </Field>
            <Field label="Margin location">
              <Select value={proc.marginLocation} onChange={(v) => update('marginLocation', v)} options={CROWN_OPTIONS.marginLocation} />
            </Field>
            <Field label="Retraction cord">
              <Select value={proc.retractionCord} onChange={(v) => update('retractionCord', v)} options={CROWN_OPTIONS.retractionCord} />
            </Field>
            <Field label="Impression">
              <Select value={proc.impression} onChange={(v) => update('impression', v)} options={CROWN_OPTIONS.impression} />
            </Field>
            <Field label="Shade">
              <TextInput value={proc.shade} onChange={(v) => update('shade', v)} placeholder="e.g., A3" />
            </Field>
            <Field label="Temporary">
              <TextInput value={proc.temporary} onChange={(v) => update('temporary', v)} />
            </Field>
          </>
        )}
        {isSeat && (
          <Field label="Cementation">
            <Select
              value={proc.cementation || CROWN_OPTIONS.cementation[0]}
              onChange={(v) => update('cementation', v)}
              options={CROWN_OPTIONS.cementation}
            />
          </Field>
        )}
        {isCerec && <CerecBlock proc={proc} update={update} />}
      </div>
      <Field label="Additional details">
        <TextArea value={proc.additionalNotes} onChange={(v) => update('additionalNotes', v)} />
      </Field>
    </>
  )
}

function ExtractionForm({ proc, update }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Tooth #">
          <TextInput value={proc.tooth} onChange={(v) => update('tooth', v)} placeholder="e.g., 17" />
        </Field>
        <Field label="Type">
          <Select value={proc.type} onChange={(v) => update('type', v)} options={EXTRACTION_OPTIONS.type} />
        </Field>
        <AnesthesiaFields proc={proc} update={update} />
        <Field label="Technique">
          <Select value={proc.technique} onChange={(v) => update('technique', v)} options={EXTRACTION_OPTIONS.technique} />
        </Field>
        <Field label="Complications">
          <Select value={proc.complications} onChange={(v) => update('complications', v)} options={EXTRACTION_OPTIONS.complications} />
        </Field>
        <Field label="Sutures">
          <Select value={proc.sutures} onChange={(v) => update('sutures', v)} options={EXTRACTION_OPTIONS.sutures} />
        </Field>
      </div>
      <div className="flex gap-3 mt-2 items-center">
        <CheckChip active={proc.socketPreservation} onClick={() => update('socketPreservation', !proc.socketPreservation)}>
          Socket preservation graft placed
        </CheckChip>
        {proc.socketPreservation && (
          <Select
            value={proc.graftMaterial || EXTRACTION_OPTIONS.graftMaterial[0]}
            onChange={(v) => update('graftMaterial', v)}
            options={EXTRACTION_OPTIONS.graftMaterial}
          />
        )}
      </div>
      <Field label="Post-op instructions">
        <TextInput value={proc.postOpInstructions} onChange={(v) => update('postOpInstructions', v)} />
      </Field>
      <Field label="Additional details">
        <TextArea value={proc.additionalNotes} onChange={(v) => update('additionalNotes', v)} />
      </Field>
    </>
  )
}

function procSummary(p) {
  const tooth = p.tooth ? `#${p.tooth}` : '#?'
  if (p.type === 'filling') {
    let tag = p.material
    if (p.material === 'Composite') tag = `Composite (${p.compositeProduct || '?'})`
    return `Filling ${tooth} — ${p.surfaces?.join('') || 'surfaces?'}, ${tag}`
  }
  if (p.type === 'crown') return `Crown ${tooth} — ${p.crownType}, ${p.appointmentType || 'Prep'}`
  if (p.type === 'extraction') return `Extraction ${tooth} — ${p.type === 'Simple' ? 'simple' : 'surgical'}`
  return p.type
}

export default function ScheduledTreatment({ store }) {
  const { state, setField } = store
  const procedures = state.scheduledTreatment.procedures

  const addProcedure = (type) => {
    setField('scheduledTreatment.procedures', [...procedures, makeProcedure(type)])
  }
  const removeProcedure = (id) => {
    setField('scheduledTreatment.procedures', procedures.filter((p) => p.id !== id))
  }
  const updateProcedure = (id, key, value) => {
    setField(
      'scheduledTreatment.procedures',
      procedures.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    )
  }

  return (
    <div>
      <PageTitle
        title="Scheduled Treatment"
        subtitle="Add each procedure performed today. Smart defaults reflect your standard protocol — tap to override only what was different."
      />

      <Section title="Add procedure">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PROCEDURE_TYPES.map((t) => (
            <Tile key={t.value} onClick={() => addProcedure(t.value)}>
              + {t.label}
            </Tile>
          ))}
        </div>
      </Section>

      {procedures.length === 0 && (
        <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 rounded">
          No procedures yet. Tap a button above to add one.
        </div>
      )}

      {procedures.map((proc, idx) => {
        const update = (key, value) => updateProcedure(proc.id, key, value)
        const Form = proc.type === 'filling' ? FillingForm : proc.type === 'crown' ? CrownForm : ExtractionForm
        return (
          <div key={proc.id} className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <h4 className="font-semibold text-slate-800">
                {idx + 1}. {procSummary(proc)}
              </h4>
              <button onClick={() => removeProcedure(proc.id)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </div>
            <div className="p-4">
              <Form proc={proc} update={update} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
