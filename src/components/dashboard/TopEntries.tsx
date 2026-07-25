import { formatCurrency, formatDateShort } from '../../lib/format'
import { TIPO_COLOR } from '../../lib/labels'
import type { Lancamento } from '../../types'

function List({
  title,
  items,
  onSelect,
}: {
  title: string
  items: Lancamento[]
  onSelect: (l: Lancamento) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-micro font-medium uppercase text-subtle">{title}</h4>
      {items.length === 0 ? (
        <p className="py-4 text-legend text-subtle">Sem lançamentos</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelect(l)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-body font-medium text-ink">{l.titulo}</span>
                  <span className="flex items-center gap-2 text-legend text-subtle">
                    <span className="tabular">{formatDateShort(l.data)}</span>
                    {l.categoria && <span className="truncate">· {l.categoria}</span>}
                  </span>
                </div>
                <span
                  className="tabular shrink-0 text-body font-semibold"
                  style={{ color: TIPO_COLOR[l.tipo] }}
                >
                  {formatCurrency(l.valor)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface TopEntriesProps {
  entradas: Lancamento[]
  gastos: Lancamento[]
  onSelect: (l: Lancamento) => void
}

export function TopEntries({ entradas, gastos, onSelect }: TopEntriesProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <List title="Maiores entradas" items={entradas} onSelect={onSelect} />
      <List title="Maiores gastos" items={gastos} onSelect={onSelect} />
    </div>
  )
}
