import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { toISODate } from './format'

export interface CalendarDay {
  date: Date
  iso: string // "2026-07-23"
  dayNumber: number // 1..31
  inMonth: boolean // pertence ao mês exibido?
  isToday: boolean
  isWeekend: boolean // domingo ou sábado
}

/**
 * Gera a matriz de dias de um mês, sempre iniciando no domingo e completando
 * a última semana, imitando o app Calendário da Apple (semana começa no domingo).
 */
export function buildMonthMatrix(month: Date): CalendarDay[] {
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const gridStart = startOfWeek(first, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(last, { weekStartsOn: 0 })

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
    const dow = date.getDay()
    return {
      date,
      iso: toISODate(date),
      dayNumber: date.getDate(),
      inMonth: isSameMonth(date, month),
      isToday: isToday(date),
      isWeekend: dow === 0 || dow === 6,
    }
  })
}

/** Cabeçalhos dos dias da semana começando no domingo. */
export const WEEKDAY_LABELS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.']

/**
 * Índice da "semana do mês" (1..5/6) para um dia, usado nos gráficos.
 * Semana 1 é a que contém o dia 1º do mês.
 */
export function weekOfMonth(date: Date): number {
  const first = startOfMonth(date)
  const firstWeekStart = startOfWeek(first, { weekStartsOn: 0 })
  const thisWeekStart = startOfWeek(date, { weekStartsOn: 0 })
  const diffDays = Math.round(
    (thisWeekStart.getTime() - firstWeekStart.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.floor(diffDays / 7) + 1
}

/** Quantas semanas o mês ocupa na grade. */
export function weeksInMonth(month: Date): number {
  return weekOfMonth(endOfMonth(month))
}

export { addDays }
