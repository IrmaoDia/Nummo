import { forwardRef } from 'react'
import { formatCurrency } from '../../lib/format'
import { cn } from '../../lib/cn'

interface CurrencyInputProps {
  value: number // em reais (ex.: 1250.9)
  onChange: (value: number) => void
  onBlur?: () => void
  /** cor do texto (reflete o tipo entrada/gasto) */
  color?: string
  id?: string
  className?: string
  placeholder?: string
}

/**
 * Input de moeda BRL. Digitar "125090" resulta em "R$ 1.250,90".
 * O valor é interpretado como centavos: cada dígito empurra o número.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, onBlur, color, id, className, placeholder }, ref) {
    const display = value > 0 ? formatCurrency(value) : ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '')
      const cents = digits === '' ? 0 : parseInt(digits, 10)
      onChange(cents / 100)
    }

    return (
      <input
        ref={ref}
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder ?? 'R$ 0,00'}
        style={{ color: value > 0 ? color : undefined }}
        className={cn(
          'tabular w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-[24px] font-semibold text-ink placeholder:text-subtle placeholder:font-normal transition-all duration-200 focus:border-acento/60 focus:outline-none focus:ring-4 focus:ring-acento/15',
          className,
        )}
      />
    )
  },
)
