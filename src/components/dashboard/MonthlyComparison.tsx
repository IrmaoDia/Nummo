import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumberCompact } from '../../lib/format'
import type { MonthlyBalance } from '../../lib/stats'
import { ChartTooltip, type RTProps } from './ChartTooltip'

function ComparisonTooltip({ active, payload }: RTProps) {
  const p = payload?.[0]
  const saldo = p?.value ?? 0
  return (
    <ChartTooltip
      active={active}
      title={typeof p?.payload?.full === 'string' ? p.payload.full : undefined}
      rows={p ? [{ name: 'Saldo', value: saldo, color: saldo >= 0 ? 'var(--green)' : 'var(--red)' }] : []}
    />
  )
}

export function MonthlyComparison({ data }: { data: MonthlyBalance[] }) {
  const chartData = data.map((d) => ({
    label: format(d.mes, 'MMM', { locale: ptBR }),
    full: format(d.mes, "MMMM 'de' yyyy", { locale: ptBR }),
    saldo: d.saldo,
    atual: d.atual,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.replace('.', '')}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatNumberCompact(v)}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Tooltip cursor={{ fill: 'var(--border)', opacity: 0.4 }} content={<ComparisonTooltip />} />
        <Bar dataKey="saldo" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {chartData.map((d, i) => (
            <Cell
              key={i}
              fill={d.saldo >= 0 ? 'var(--green)' : 'var(--red)'}
              fillOpacity={d.atual ? 1 : 0.32}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
