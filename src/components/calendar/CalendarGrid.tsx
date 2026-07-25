import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { buildMonthMatrix, WEEKDAY_LABELS } from '../../lib/calendar'
import { toISODate } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Lancamento } from '../../types'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  month: Date
  direction: 1 | -1
  items: Lancamento[] // já filtrados para o mês exibido
  onAdd: (iso: string) => void
  onEdit: (l: Lancamento) => void
  onMoveToDay: (id: string, iso: string) => void
}

export function CalendarGrid({
  month,
  direction,
  items,
  onAdd,
  onEdit,
  onMoveToDay,
}: CalendarGridProps) {
  const days = useMemo(() => buildMonthMatrix(month), [month])

  const byDay = useMemo(() => {
    const map = new Map<string, Lancamento[]>()
    for (const l of items) {
      const arr = map.get(l.data)
      if (arr) arr.push(l)
      else map.set(l.data, [l])
    }
    // Ordena cada dia por valor decrescente para destacar os maiores.
    for (const arr of map.values()) arr.sort((a, b) => b.valor - a.valor)
    return map
  }, [items])

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-apple">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-hairline">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'py-2 text-center text-micro font-medium uppercase text-subtle',
              (i === 0 || i === 6) && 'bg-surface-2',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grade dos dias com slide de mês */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={toISODate(month)}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="grid grid-cols-7"
          >
            {days.map((day) => (
              <DayCell
                key={day.iso}
                day={day}
                items={byDay.get(day.iso) ?? []}
                onAdd={onAdd}
                onEdit={onEdit}
                onMoveToDay={onMoveToDay}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
