function Barra({ label, valor, meta, color }) {
  const pct = Math.min(100, Math.round((valor / meta) * 100))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <b>{label}</b>
        <span className="font-mono text-muted tabular">
          {valor}/{meta} g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Meta del día (alta/media) contra lo que ya marcaste como hecho en la línea de tiempo
export default function MacroSummary({ meta, consumido, tipo, ajuste }) {
  const kcal = consumido.p * 4 + consumido.c * 4 + consumido.g * 9
  const pct = Math.min(1, kcal / meta.kcal)
  const R = 34
  const C = 2 * Math.PI * R
  return (
    <div className="card p-3">
      <div className="grid grid-cols-[88px_1fr] items-center gap-4">
        <svg viewBox="0 0 88 88" className="h-[88px] w-[88px]" role="img" aria-label={`${kcal} de ${meta.kcal} kcal`}>
          <circle cx="44" cy="44" r={R} fill="none" stroke="rgb(var(--line))" strokeWidth="9" />
          {pct > 0 && <circle
            cx="44"
            cy="44"
            r={R}
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${pct * C} ${C}`}
            transform="rotate(-90 44 44)"
          />}
          <text x="44" y="44" textAnchor="middle" fill="rgb(var(--ink))" className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>
            {kcal.toLocaleString('es-MX')}
          </text>
          <text x="44" y="58" textAnchor="middle" fill="rgb(var(--muted))" className="font-mono" style={{ fontSize: 9 }}>
            / {meta.kcal.toLocaleString('es-MX')} kcal
          </text>
        </svg>
        <div className="flex flex-col gap-2">
          <Barra label="Proteína" valor={consumido.p} meta={meta.p} color="bg-accent" />
          <Barra label="Carbohidrato" valor={consumido.c} meta={meta.c} color="bg-sun" />
          <Barra label="Grasa" valor={consumido.g} meta={meta.g} color="bg-muted" />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Día <b className="text-ink">{tipo}</b>. Se suma lo que marcas como hecho.
        {ajuste ? ` ${ajuste}` : ''}
      </p>
    </div>
  )
}
