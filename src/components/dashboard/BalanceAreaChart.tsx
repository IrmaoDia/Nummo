import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumberCompact } from '../../lib/format'
import type { BalancePoint } from '../../lib/stats'
import { ChartTooltip, type RTProps } from './ChartTooltip'

const axisTick = { fontSize: 12, fill: 'var(--text-secondary)' }

function BalanceTooltip({ active, payload }: RTProps) {
  const p = payload?.[0]
  const dia = p?.payload?.dia
  return (
    <ChartTooltip
      active={active}
      title={dia != null ? `Dia ${dia}` : undefined}
      rows={p ? [{ name: 'Saldo acumulado', value: p.value ?? 0, color: (p.value ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }] : []}
    />
  )
}

export function BalanceAreaChart({ data }: { data: BalancePoint[] }) {
  const saldos = data.map((d) => d.saldo)
  const dataMax = Math.max(...saldos, 0)
  const dataMin = Math.min(...saldos, 0)
  const off = dataMax <= 0 ? 0 : dataMin >= 0 ? 1 : dataMax / (dataMax - dataMin)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="saldoStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="var(--green)" />
            <stop offset={off} stopColor="var(--red)" />
          </linearGradient>
          <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--green)" stopOpacity={0.28} />
            <stop offset={off} stopColor="var(--green)" stopOpacity={0.02} />
            <stop offset={off} stopColor="var(--red)" stopOpacity={0.02} />
            <stop offset="1" stopColor="var(--red)" stopOpacity={0.28} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="2 5" stroke="var(--border)" />
        <XAxis
          dataKey="dia"
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatNumberCompact(v)}
        />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
        <Tooltip cursor={{ stroke: 'var(--border)' }} content={<BalanceTooltip />} />
        <Area
          type="monotone"
          dataKey="saldo"
          stroke="url(#saldoStroke)"
          strokeWidth={2}
          fill="url(#saldoFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
