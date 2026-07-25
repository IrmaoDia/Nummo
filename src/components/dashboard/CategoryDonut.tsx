import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/format'
import type { CategorySlice } from '../../lib/stats'
import { ChartTooltip, type RTProps } from './ChartTooltip'

function DonutTooltip({ active, payload }: RTProps) {
  const p = payload?.[0]
  return (
    <ChartTooltip
      active={active}
      rows={
        p
          ? [
              {
                name: String(p.payload?.label ?? ''),
                value: p.value ?? 0,
                color: String(p.payload?.color ?? ''),
              },
            ]
          : []
      }
    />
  )
}

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-legend text-subtle">
        Nenhum gasto no período
      </div>
    )
  }

  const nonZero = data.filter((d) => d.value > 0)
  const dominant = [...data].sort((a, b) => b.value - a.value)[0]
  const pct = Math.round((dominant.value / total) * 100)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={nonZero}
              dataKey="value"
              nameKey="label"
              innerRadius="65%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {nonZero.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-[26px] font-semibold text-ink">{pct}%</span>
          <span className="max-w-[70%] truncate text-legend text-subtle">{dominant.label}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-2 text-legend">
            <span className="flex min-w-0 items-center gap-2 text-subtle">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="tabular shrink-0 text-subtle">
              <span className="font-medium text-ink">{formatCurrency(d.value)}</span>
              <span className="ml-1.5">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
