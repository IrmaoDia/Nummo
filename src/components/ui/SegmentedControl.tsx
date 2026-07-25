import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  /** cor do texto quando selecionado (ex.: 'var(--green)') */
  activeColor?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}

/** Segmented control estilo Apple: pílula branca deslizante via layoutId. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const groupId = useId()
  const pad = size === 'sm' ? 'p-0.5' : 'p-1'
  const cell = size === 'sm' ? 'h-7 text-legend px-3' : 'h-9 text-body px-4'

  return (
    <div
      role="tablist"
      className={cn(
        'relative inline-flex items-center rounded-xl bg-black/[0.05] dark:bg-white/[0.08]',
        pad,
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200',
              cell,
            )}
            style={{
              color: active ? (opt.activeColor ?? 'var(--text)') : 'var(--text-secondary)',
            }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-lg bg-surface shadow-sm"
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
