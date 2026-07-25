import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatPercent } from '../../lib/format'
import { cn } from '../../lib/cn'

interface KpiCardProps {
  label: string
  value: string // já formatado (moeda ou número)
  valueColor?: string
  /** variação vs. mês anterior (fração). null = sem base de comparação. */
  delta?: number | null
  /** quando true, subir é ruim (ex.: gastos) → seta para cima fica vermelha. */
  invertDelta?: boolean
}

export function KpiCard({ label, value, valueColor, delta, invertDelta }: KpiCardProps) {
  const showDelta = delta !== undefined && delta !== null
  const up = (delta ?? 0) > 0
  const flat = (delta ?? 0) === 0
  const good = invertDelta ? !up : up
  const deltaColor = flat ? 'var(--text-secondary)' : good ? 'var(--green)' : 'var(--red)'

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-hairline bg-surface p-4 shadow-apple">
      <span className="text-micro font-medium uppercase text-subtle">{label}</span>
      <span
        className="tabular text-[22px] font-semibold leading-tight"
        style={{ color: valueColor ?? 'var(--text)' }}
      >
        {value}
      </span>
      {showDelta ? (
        <span
          className="tabular inline-flex items-center gap-1 text-legend font-medium"
          style={{ color: deltaColor }}
        >
          {!flat &&
            (up ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            ))}
          {formatPercent(delta ?? 0)}
          <span className="font-normal text-subtle">vs. mês anterior</span>
        </span>
      ) : (
        <span className={cn('text-legend text-subtle')}>&nbsp;</span>
      )}
    </div>
  )
}
