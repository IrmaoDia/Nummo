import { formatCurrency } from '../../lib/format'

interface TooltipRow {
  name: string
  value: number
  color?: string
}

/** Formato aproximado dos props que o Recharts injeta no `content` do Tooltip. */
export interface RTPayloadItem {
  name?: string | number
  value?: number
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

export interface RTProps {
  active?: boolean
  label?: string | number
  payload?: RTPayloadItem[]
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  title?: string
  rows: TooltipRow[]
}

/** Tooltip estilo Apple: cartão claro, arredondado, sombra suave, sem borda dura. */
export function ChartTooltip({ active, title, rows }: ChartTooltipProps) {
  if (!active || rows.length === 0) return null
  return (
    <div className="min-w-[132px] rounded-xl bg-surface/95 px-3 py-2 shadow-apple-lg backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10">
      {title && <div className="mb-1 text-legend font-medium text-ink">{title}</div>}
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-4 text-legend">
            <span className="flex items-center gap-1.5 text-subtle">
              {r.color && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
              )}
              {r.name}
            </span>
            <span className="tabular font-semibold text-ink">{formatCurrency(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
