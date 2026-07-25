import { Plus } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Lancamento, Tipo } from '../../types'
import { EntryCard } from './EntryCard'

interface KanbanColumnProps {
  tipo: Tipo
  title: string
  accent: string
  count: number
  total: number
  items: Lancamento[]
  dragging: boolean
  emptyLabel: string
  onEdit: (l: Lancamento) => void
  onDropCard: (id: string) => void
  onAddNew: () => void
}

export function KanbanColumn({
  title,
  accent,
  count,
  total,
  items,
  dragging,
  emptyLabel,
  onEdit,
  onDropCard,
  onAddNew,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDropCard(id)
      }}
      className={cn(
        'flex min-h-[280px] flex-col rounded-2xl border bg-surface-2 transition-colors',
        dragOver ? 'border-acento/60 ring-2 ring-inset ring-acento/30' : 'border-hairline',
      )}
    >
      {/* Cabeçalho: chip do tipo + contagem + total */}
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-legend font-semibold"
            style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            {title}
          </span>
          <span className="tabular text-legend text-subtle">{count}</span>
        </div>
        <span className="tabular text-legend font-semibold" style={{ color: accent }}>
          {formatCurrency(total)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-2">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-3 py-8 text-center text-legend text-subtle">
            {dragging ? 'Arraste cards para cá' : emptyLabel}
          </div>
        ) : (
          items.map((l) => (
            <EntryCard
              key={l.id}
              lancamento={l}
              onClick={() => onEdit(l)}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', l.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
            />
          ))
        )}
      </div>

      {/* Rodapé */}
      <div className="p-2">
        <button
          type="button"
          onClick={onAddNew}
          className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-2 text-legend font-medium text-subtle transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>
    </div>
  )
}
