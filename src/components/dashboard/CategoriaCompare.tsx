import { formatCurrency } from '../../lib/format'
import type { CategoriaTotais } from '../../lib/stats'

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-legend">
      <span className="text-subtle">{label}</span>
      <span className="tabular font-semibold" style={{ color }}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

/** Card "Empresa × Pessoa Física": entradas, gastos e saldo de cada categoria. */
export function CategoriaCompare({ data }: { data: CategoriaTotais[] }) {
  const cols = data.filter((d) => d.categoria !== 'sem_categoria')
  return (
    <div className="grid grid-cols-2 gap-4">
      {cols.map((c) => (
        <div key={c.categoria} className="flex flex-col gap-2.5 rounded-xl bg-surface-2 p-4">
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-legend font-semibold"
            style={{ color: c.color, backgroundColor: `color-mix(in srgb, ${c.color} 12%, transparent)` }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.label}
          </span>
          <Row label="Entradas" value={c.entradas} color="var(--green)" />
          <Row label="Gastos" value={c.gastos} color="var(--red)" />
          <div className="mt-1 border-t border-hairline pt-2">
            <Row label="Saldo" value={c.saldo} color={c.saldo >= 0 ? 'var(--green)' : 'var(--red)'} />
          </div>
        </div>
      ))}
    </div>
  )
}
