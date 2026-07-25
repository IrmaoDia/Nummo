import { formatCurrency, formatDateShort } from '../../lib/format'
import { TIPO_COLOR } from '../../lib/labels'
import type { Lancamento } from '../../types'
import { CategoryBadge } from '../ui/CategoryBadge'

interface EntryCardProps {
  lancamento: Lancamento
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
}

export function EntryCard({ lancamento, onClick, onDragStart }: EntryCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="cursor-grab rounded-xl border border-hairline bg-surface p-3 shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-apple active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-acento/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-body font-medium text-ink">{lancamento.titulo}</span>
        <span
          className="tabular shrink-0 text-body font-semibold"
          style={{ color: TIPO_COLOR[lancamento.tipo] }}
        >
          {formatCurrency(lancamento.valor)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-legend text-subtle">
        <span className="tabular">{formatDateShort(lancamento.data)}</span>
        <CategoryBadge categoria={lancamento.categoria} />
      </div>
    </div>
  )
}
