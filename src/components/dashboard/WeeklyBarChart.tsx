import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumberCompact } from '../../lib/format'
import type { WeeklyPoint } from '../../lib/stats'
import { ChartTooltip, type RTProps } from './ChartTooltip'

const axisTick = { fontSize: 12, fill: 'var(--text-secondary)' }

function WeeklyTooltip({ active, label, payload }: RTProps) {
  return (
    <ChartTooltip
      active={active}
      title={typeof label === 'string' ? label : undefined}
      rows={(payload ?? []).map((p) => ({
        name: String(p.name),
        value: p.value ?? 0,
        color: p.color,
      }))}
    />
  )
}

export function WeeklyBarChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="2 5" stroke="var(--border)" />
        <XAxis dataKey="semana" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatNumberCompact(v)}
        />
        <Tooltip cursor={{ fill: 'var(--border)', opacity: 0.4 }} content={<WeeklyTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
        />
        <Bar dataKey="entradas" name="Entradas" fill="var(--green)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        <Bar dataKey="gastos" name="Gastos" fill="var(--red)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
