import { useMemo, useState } from 'react'
import { formatMonthLong } from '../../lib/format'
import type { Lancamento, Tipo } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  month: Date
  items: Lancamento[]
  hasAnyThisMonth: boolean
  onEdit: (l: Lancamento) => void
  onUpdate: (id: string, patch: Partial<Lancamento>) => void
  onAddNew: (tipo?: Tipo) => void
}

export function KanbanBoard({
  month,
  items,
  hasAnyThisMonth,
  onEdit,
  onUpdate,
  onAddNew,
}: KanbanBoardProps) {
  const [dragging, setDragging] = useState(false)

  // Agrupa EXCLUSIVAMENTE por tipo — a categoria não influencia a coluna.
  const cols = useMemo(() => {
    const entrada: Lancamento[] = []
    const gasto: Lancamento[] = []
    for (const l of items) {
      if (l.tipo === 'entrada') entrada.push(l)
      else gasto.push(l)
    }
    const byDateDesc = (a: Lancamento, b: Lancamento) => b.data.localeCompare(a.data)
    entrada.sort(byDateDesc)
    gasto.sort(byDateDesc)
    const sum = (arr: Lancamento[]) => arr.reduce((acc, l) => acc + l.valor, 0)
    // Garantia: todo lançamento cai em exatamente uma coluna.
    if (import.meta.env.DEV) {
      console.assert(
        entrada.length + gasto.length === items.length,
        'Kanban: soma das colunas diverge do total de lançamentos',
      )
    }
    return { entrada, gasto, totalEntrada: sum(entrada), totalGasto: sum(gasto) }
  }, [items])

  if (!hasAnyThisMonth) {
    return (
      <EmptyState
        title="Nenhum lançamento neste mês"
        description="Crie um lançamento para organizá-lo por tipo."
        actionLabel="Adicionar o primeiro"
        onAction={() => onAddNew()}
      />
    )
  }

  const mes = formatMonthLong(month).split(' de ')[0]

  return (
    <div
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      onDrop={() => setDragging(false)}
      className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <KanbanColumn
        tipo="entrada"
        title="Entrada"
        accent="var(--green)"
        count={cols.entrada.length}
        total={cols.totalEntrada}
        items={cols.entrada}
        dragging={dragging}
        emptyLabel={`Nenhuma entrada em ${mes}`}
        onEdit={onEdit}
        onDropCard={(id) => onUpdate(id, { tipo: 'entrada' })}
        onAddNew={() => onAddNew('entrada')}
      />
      <KanbanColumn
        tipo="gasto"
        title="Gasto"
        accent="var(--red)"
        count={cols.gasto.length}
        total={cols.totalGasto}
        items={cols.gasto}
        dragging={dragging}
        emptyLabel={`Nenhum gasto em ${mes}`}
        onEdit={onEdit}
        onDropCard={(id) => onUpdate(id, { tipo: 'gasto' })}
        onAddNew={() => onAddNew('gasto')}
      />
    </div>
  )
}
