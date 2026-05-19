export function Tile({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${active ? 'btn-tile-active' : 'btn-tile-inactive'} ${className}`}
    >
      {children}
    </button>
  )
}

export function CheckChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={active ? 'check-chip-on' : 'check-chip-off'}>
      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${active ? 'bg-clinical-600 border-clinical-600 text-white' : 'border-slate-300 bg-white'}`}>
        {active ? '✓' : ''}
      </span>
      <span>{children}</span>
    </button>
  )
}

export function Section({ title, children, hint }) {
  return (
    <section className="mb-6">
      <h3 className="section-title">{title}</h3>
      {hint && <p className="text-sm text-slate-500 mb-2">{hint}</p>}
      {children}
    </section>
  )
}

export function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      <Tile active={value === true} onClick={() => onChange(true)}>Yes</Tile>
      <Tile active={value === false} onClick={() => onChange(false)}>No</Tile>
    </div>
  )
}

export function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
