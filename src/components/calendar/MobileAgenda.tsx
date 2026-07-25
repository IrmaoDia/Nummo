import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toDate } from '../../lib/format'
import type { Lancamento } from '../../types'
import { EntryChip } from './EntryChip'

interface MobileAgendaProps {
  items: Lancamento[]
  onAdd: (iso: string) => void
  onEdit: (l: Lancamento) => void
}

/** Versão em lista agrupada por dia, usada em telas estreitas (<768px). */
export function MobileAgenda({ items, onAdd, onEdit }: MobileAgendaProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Lancamento[]>()
    for (const l of items) {
      const arr = map.get(l.data)
      if (arr) arr.push(l)
      else map.set(l.data, [l])
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, list]) => ({
        iso,
        list: list.sort((a, b) => b.valor - a.valor),
      }))
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ iso, list }) => {
        const d = toDate(iso)
        return (
          <div key={iso} className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-apple">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="tabular text-section font-semibold text-ink">
                  {format(d, 'd', { locale: ptBR })}
                </span>
                <span className="text-legend text-subtle first-letter:uppercase">
                  {format(d, "EEEE, MMM", { locale: ptBR })}
                </span>
              </div>
              <button
                type="button"
                aria-label="Adicionar item neste dia"
                onClick={() => onAdd(iso)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-acento transition-colors hover:bg-acento/10"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 p-2">
              {list.map((l) => (
                <EntryChip key={l.id} lancamento={l} compact onClick={() => onEdit(l)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
