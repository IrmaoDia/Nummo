import { formatCurrency, formatDateLong } from '../../lib/format'
import { TIPO_COLOR } from '../../lib/labels'
import type { Lancamento } from '../../types'
import { CategoryBadge } from '../ui/CategoryBadge'
import { Popover } from '../ui/Popover'

interface DayPopoverProps {
  iso: string
  items: Lancamento[]
  extraCount: number
  onSelect: (l: Lancamento) => void
}

/** Botão "+N mais" que abre um popover com todos os lançamentos do dia. */
export function DayPopover({ iso, items, extraCount, onSelect }: DayPopoverProps) {
  return (
    <Popover
      align="left"
      panelClassName="w-72"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          className="w-full rounded-md px-2 py-0.5 text-left text-[12px] font-medium text-subtle transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          +{extraCount} mais
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 pb-1 text-micro font-medium uppercase text-subtle">
            {formatDateLong(iso)}
          </div>
          <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
            {items.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  close()
                  onSelect(l)
                }}
                className="flex flex-col gap-1 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="truncate text-[13px] font-medium"
                    style={{ color: TIPO_COLOR[l.tipo] }}
                  >
                    {l.titulo}
                  </span>
                  <span
                    className="tabular shrink-0 text-[13px] font-medium"
                    style={{ color: TIPO_COLOR[l.tipo] }}
                  >
                    {formatCurrency(l.valor)}
                  </span>
                </div>
                <CategoryBadge categoria={l.categoria} />
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  )
}
