import { Calendar } from 'lucide-react'
import { useRef } from 'react'
import { formatDateLong } from '../../lib/format'

interface DateFieldProps {
  value: string // "2026-07-23"
  onChange: (value: string) => void
  id?: string
}

/** Campo de data estilo Apple: mostra "23 de julho de 2026" e abre o seletor nativo. */
export function DateField({ value, onChange, id }: DateFieldProps) {
  const ref = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const el = ref.current
    if (!el) return
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.focus()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="flex w-full items-center justify-between rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-body text-ink transition-all duration-200 hover:bg-black/[0.02] focus:border-acento/60 focus:outline-none focus:ring-4 focus:ring-acento/15 dark:hover:bg-white/[0.04]"
      >
        <span className="first-letter:uppercase">{formatDateLong(value)}</span>
        <Calendar className="h-4 w-4 text-subtle" />
      </button>
      <input
        ref={ref}
        id={id}
        type="date"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-3 h-0 w-0 opacity-0"
      />
    </div>
  )
}
