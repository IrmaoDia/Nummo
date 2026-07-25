import { Check, ChevronDown } from 'lucide-react'
import { CATEGORIA_COLOR, CATEGORIA_LABEL, CATEGORIA_ORDER } from '../../lib/labels'
import { cn } from '../../lib/cn'
import type { Categoria } from '../../types'
import { Popover } from '../ui/Popover'

interface CategorySelectProps {
  value: Categoria
  onChange: (c: Categoria) => void
}

/** Select fechado (sem digitação) com as três categorias fixas. */
export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <Popover
      className="w-full"
      align="left"
      panelClassName="w-full"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-hairline bg-surface-2 px-3 text-body text-ink transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]',
            open && 'ring-4 ring-acento/15',
          )}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIA_COLOR[value] }} />
            {CATEGORIA_LABEL[value]}
          </span>
          <ChevronDown className="h-4 w-4 text-subtle" />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          {CATEGORIA_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c)
                close()
              }}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-body text-ink transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIA_COLOR[c] }} />
                {CATEGORIA_LABEL[c]}
              </span>
              {value === c && <Check className="h-4 w-4 text-acento" />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
