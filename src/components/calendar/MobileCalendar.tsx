import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { buildMonthMatrix } from '../../lib/calendar'
import { cn } from '../../lib/cn'
import { formatCurrency, formatDateLong, toISODate } from '../../lib/format'
import { TIPO_COLOR } from '../../lib/labels'
import type { Lancamento } from '../../types'
import { CategoryBadge } from '../ui/CategoryBadge'

const WEEKDAYS_CURTOS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface MobileCalendarProps {
  month: Date
  items: Lancamento[]
  onAdd: (iso: string) => void
  onEdit: (l: Lancamento) => void
}

/**
 * Calendário compacto para telas estreitas: grade do mês inteiro com pontinhos
 * indicando entradas/gastos, e os lançamentos do dia selecionado logo abaixo.
 */
export function MobileCalendar({ month, items, onAdd, onEdit }: MobileCalendarProps) {
  const days = useMemo(() => buildMonthMatrix(month), [month])

  const byDay = useMemo(() => {
    const map = new Map<string, Lancamento[]>()
    for (const l of items) {
      const arr = map.get(l.data)
      if (arr) arr.push(l)
      else map.set(l.data, [l])
    }
    for (const arr of map.values()) arr.sort((a, b) => b.valor - a.valor)
    return map
  }, [items])

  // Dia selecionado: hoje (se estiver no mês) ou o primeiro dia com lançamento.
  const [selected, setSelected] = useState<string>('')
  useEffect(() => {
    const hoje = days.find((d) => d.isToday && d.inMonth)
    const comLancamento = days.find((d) => d.inMonth && byDay.has(d.iso))
    const primeiro = days.find((d) => d.inMonth)
    setSelected(hoje?.iso ?? comLancamento?.iso ?? primeiro?.iso ?? toISODate(month))
  }, [days, byDay, month])

  const doDia = byDay.get(selected) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Grade do mês */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-apple">
        <div className="grid grid-cols-7 border-b border-hairline">
          {WEEKDAYS_CURTOS.map((d, i) => (
            <div
              key={i}
              className={cn(
                'py-2 text-center text-micro font-medium uppercase text-subtle',
                (i === 0 || i === 6) && 'bg-surface-2',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const lancs = byDay.get(day.iso) ?? []
            const temEntrada = lancs.some((l) => l.tipo === 'entrada')
            const temGasto = lancs.some((l) => l.tipo === 'gasto')
            const isSelected = day.iso === selected
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelected(day.iso)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-1 border-b border-r border-hairline transition-colors',
                  day.isWeekend ? 'bg-surface-2' : 'bg-surface',
                  !day.inMonth && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'tabular flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium',
                    day.isToday
                      ? 'bg-gasto text-white'
                      : isSelected
                        ? 'bg-acento text-white'
                        : day.inMonth
                          ? 'text-ink'
                          : 'text-subtle',
                  )}
                >
                  {day.dayNumber}
                </span>
                {/* indicadores */}
                <span className="flex h-1.5 items-center gap-0.5">
                  {temEntrada && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--green)' }}
                    />
                  )}
                  {temGasto && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--red)' }}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lançamentos do dia selecionado */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-apple">
        <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-2.5">
          <span className="text-body font-semibold text-ink first-letter:uppercase">
            {selected ? formatDateLong(selected) : ''}
          </span>
          <button
            type="button"
            aria-label="Adicionar lançamento neste dia"
            onClick={() => selected && onAdd(selected)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-acento transition-colors hover:bg-acento/10"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {doDia.length === 0 ? (
          <p className="px-4 py-6 text-center text-legend text-subtle">
            Nenhum lançamento neste dia
          </p>
        ) : (
          <ul className="flex flex-col">
            {doDia.map((l) => (
              <li key={l.id} className="border-b border-hairline last:border-b-0">
                <button
                  type="button"
                  onClick={() => onEdit(l)}
                  className="flex w-full flex-col gap-1 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-body font-medium"
                      style={{ color: TIPO_COLOR[l.tipo] }}
                    >
                      {l.titulo}
                    </span>
                    <span
                      className="tabular shrink-0 text-body font-semibold"
                      style={{ color: TIPO_COLOR[l.tipo] }}
                    >
                      {formatCurrency(l.valor)}
                    </span>
                  </span>
                  <CategoryBadge categoria={l.categoria} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
