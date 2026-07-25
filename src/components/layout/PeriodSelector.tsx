import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { Periodo } from '../../types'
import { Popover } from '../ui/Popover'

const OPTIONS: { value: Periodo; label: string }[] = [
  { value: 'mes', label: 'Este mês' },
  { value: '3meses', label: 'Últimos 3 meses' },
  { value: '6meses', label: 'Últimos 6 meses' },
  { value: 'ano', label: 'Este ano' },
]

interface PeriodSelectorProps {
  value: Periodo
  onChange: (p: Periodo) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const current = OPTIONS.find((o) => o.value === value)?.label ?? 'Este mês'
  return (
    <Popover
      align="left"
      panelClassName="w-48"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-3 text-body font-medium text-ink transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
            open && 'ring-2 ring-acento/40',
          )}
        >
          <Calendar className="h-4 w-4 text-subtle" />
          {current}
          <ChevronDown className="h-3.5 w-3.5 text-subtle" />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value)
                close()
              }}
              className={cn(
                'rounded-lg px-2.5 py-2 text-left text-body transition-colors',
                value === o.value
                  ? 'bg-acento/10 font-medium text-acento'
                  : 'text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
