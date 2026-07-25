import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import type { CalendarDay } from '../../lib/calendar'
import type { Lancamento } from '../../types'
import { AddButton } from './AddButton'
import { DayPopover } from './DayPopover'
import { EntryChip } from './EntryChip'

const MAX_VISIBLE = 3

interface DayCellProps {
  day: CalendarDay
  items: Lancamento[]
  onAdd: (iso: string) => void
  onEdit: (l: Lancamento) => void
  onMoveToDay: (id: string, iso: string) => void
}

export function DayCell({ day, items, onAdd, onEdit, onMoveToDay }: DayCellProps) {
  const [hover, setHover] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visible = items.slice(0, MAX_VISIBLE)
  const extra = items.length - visible.length
  const isEmpty = items.length === 0

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const id = e.dataTransfer.getData('text/plain')
    if (id) onMoveToDay(id, day.iso)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onTouchStart={() => {
        longPress.current = setTimeout(() => onAdd(day.iso), 500)
      }}
      onTouchEnd={() => longPress.current && clearTimeout(longPress.current)}
      onTouchMove={() => longPress.current && clearTimeout(longPress.current)}
      className={cn(
        'group relative flex min-h-[120px] flex-col border-b border-r border-hairline p-1.5 transition-colors',
        day.isWeekend ? 'bg-surface-2' : 'bg-surface',
        !day.inMonth && 'opacity-55',
        dragOver && 'ring-2 ring-inset ring-acento/50',
      )}
    >
      {/* Cabeçalho: número do dia no canto superior direito */}
      <div className="mb-1 flex items-center justify-end">
        <span
          className={cn(
            'tabular flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[13px] font-medium',
            day.isToday
              ? 'bg-gasto text-white'
              : day.inMonth
                ? 'text-ink'
                : 'text-subtle',
          )}
        >
          {day.dayNumber}
        </span>
      </div>

      {/* Lista de chips (rola internamente se muitos) */}
      <div className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
        {visible.map((l) => (
          <EntryChip
            key={l.id}
            lancamento={l}
            onClick={() => onEdit(l)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', l.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
          />
        ))}
        {extra > 0 && (
          <DayPopover iso={day.iso} items={items} extraCount={extra} onSelect={onEdit} />
        )}
      </div>

      {/* Hover: "+" centralizado quando vazio; linha discreta quando há itens */}
      {isEmpty ? (
        <AddButton visible={hover} onClick={() => onAdd(day.iso)} />
      ) : (
        hover && (
          <button
            type="button"
            onClick={() => onAdd(day.iso)}
            className="mt-1 flex items-center justify-center gap-1 rounded-md py-0.5 text-[11px] font-medium text-subtle transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        )
      )}
    </div>
  )
}
