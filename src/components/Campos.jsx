// Campos de formulario compartidos (check-in, registro de sesiones, pruebas)

export function Escala({ id, label, ayuda, min, max, value, onChange, alerta }) {
  const valores = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold">
        {label} {ayuda && <span className="font-normal text-muted">{ayuda}</span>}
      </legend>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${valores.length}, minmax(0,1fr))` }}>
        {valores.map((v) => {
          const on = value === v
          const warn = alerta?.(v)
          return (
            <button
              key={v}
              id={`${id}-${v}`}
              type="button"
              onClick={() => onChange(on ? null : v)}
              aria-pressed={on}
              className={`h-9 rounded-lg border text-sm font-semibold tabular transition-colors ${
                on ? (warn ? 'border-bad bg-bad text-white' : 'border-accent bg-accent text-accent-on') : 'border-line bg-bg text-ink'
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Numero({ id, label, unidad, value, onChange, step = '1', placeholder, compacto = false }) {
  const input = (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        placeholder={placeholder}
        aria-label={compacto ? label : undefined}
        className={`field tabular placeholder:text-muted/60 ${unidad ? 'pr-10' : ''} ${compacto ? 'px-2 py-1.5 text-center' : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
      {unidad && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">{unidad}</span>}
    </div>
  )
  if (compacto) return input
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      {input}
    </label>
  )
}

export function Texto({ id, label, value, onChange, placeholder, multilinea = false }) {
  const props = {
    id,
    placeholder,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    className: 'field placeholder:text-muted/60',
  }
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      {multilinea ? <textarea rows={3} {...props} /> : <input type="text" {...props} />}
    </label>
  )
}

export function Opciones({ id, label, opciones, value, onChange }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      {label && <legend className="mb-1.5 text-sm font-semibold">{label}</legend>}
      <div className="grid gap-1 rounded-xl border border-line bg-bg p-1" style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0,1fr))` }} role="radiogroup">
        {opciones.map((o) => (
          <button
            key={String(o.value)}
            id={`${id}-${o.value}`}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-2 py-2 text-sm font-semibold ${value === o.value ? 'bg-ink text-bg' : 'text-muted'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
