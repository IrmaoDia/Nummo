import { isSameMonth, startOfMonth } from 'date-fns'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { formatMonthLong, toISODate } from '../../lib/format'
import type { Lancamento } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { CalendarGrid } from './CalendarGrid'
import { MobileAgenda } from './MobileAgenda'

interface CalendarViewProps {
  month: Date
  direction: 1 | -1
  items: Lancamento[]
  onAdd: (iso: string) => void
  onEdit: (l: Lancamento) => void
  onMoveToDay: (id: string, iso: string) => void
  hasAnyThisMonth: boolean // antes dos filtros: existe algo no mês?
}

export function CalendarView({
  month,
  direction,
  items,
  onAdd,
  onEdit,
  onMoveToDay,
  hasAnyThisMonth,
}: CalendarViewProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  // Data padrão para "adicionar": hoje se o mês exibido for o atual, senão dia 1º.
  const defaultIso = isSameMonth(month, new Date())
    ? toISODate(new Date())
    : toISODate(startOfMonth(month))

  // Estado vazio: nenhum lançamento no mês (independente de filtros).
  if (!hasAnyThisMonth) {
    return (
      <EmptyState
        title={`Nenhum lançamento em ${formatMonthLong(month).split(' de ')[0]}`}
        description="Comece registrando uma entrada ou um gasto neste mês."
        actionLabel="Adicionar o primeiro"
        onAction={() => onAdd(defaultIso)}
      />
    )
  }

  // Há dados no mês, mas os filtros esconderam tudo.
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nada corresponde aos filtros"
        description="Ajuste ou limpe os filtros para ver os lançamentos deste mês."
      />
    )
  }

  return isMobile ? (
    <MobileAgenda items={items} onAdd={onAdd} onEdit={onEdit} />
  ) : (
    <CalendarGrid
      month={month}
      direction={direction}
      items={items}
      onAdd={onAdd}
      onEdit={onEdit}
      onMoveToDay={onMoveToDay}
    />
  )
}
