import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo } from 'react'
import { formatCurrency } from '../../lib/format'
import {
  balanceAccumulated,
  comparativoPorPerfil,
  entradasGastosPorMes,
  filterByRange,
  gastosPorCategoria,
  maiores,
  rangeFor,
  saldoUltimosMeses,
  totais,
  totaisPorCategoria,
  variacao,
  weeklyData,
} from '../../lib/stats'
import type { Lancamento, Perfil, Periodo } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { BalanceAreaChart } from './BalanceAreaChart'
import { CategoriaCompare } from './CategoriaCompare'
import { CategoryDonut } from './CategoryDonut'
import { ChartCard } from './ChartCard'
import { KpiCard } from './KpiCard'
import { MonthlyComparison } from './MonthlyComparison'
import { TopEntries } from './TopEntries'
import { WeeklyBarChart } from './WeeklyBarChart'

interface ResumoViewProps {
  month: Date
  periodo: Periodo
  filteredAll: Lancamento[] // lançamentos do perfil ativo (ou todos), já filtrados
  isAll: boolean
  perfis: Perfil[]
  onSelect: (l: Lancamento) => void
  onAdd: () => void
}

const PERIODO_LABEL: Record<Periodo, string> = {
  mes: 'Este mês',
  '3meses': 'Últimos 3 meses',
  '6meses': 'Últimos 6 meses',
  ano: 'Este ano',
}

export function ResumoView({
  month,
  periodo,
  filteredAll,
  isAll,
  perfis,
  onSelect,
  onAdd,
}: ResumoViewProps) {
  const range = useMemo(() => rangeFor(periodo, month), [periodo, month])
  const items = useMemo(() => filterByRange(filteredAll, range), [filteredAll, range])

  // Período anterior equivalente, para a variação.
  const prevItems = useMemo(() => {
    const prevRange = rangeFor(periodo, subMonths(month, range.months.length))
    return filterByRange(filteredAll, prevRange)
  }, [filteredAll, periodo, month, range.months.length])

  const t = useMemo(() => totais(items), [items])
  const tPrev = useMemo(() => totais(prevItems), [prevItems])

  const weekly = useMemo(() => weeklyData(items, month), [items, month])
  const monthly = useMemo(
    () =>
      entradasGastosPorMes(items, range.months).map((p) => ({
        semana: format(p.mes, 'MMM', { locale: ptBR }).replace('.', ''),
        entradas: p.entradas,
        gastos: p.gastos,
      })),
    [items, range.months],
  )
  const balance = useMemo(() => balanceAccumulated(items, month), [items, month])
  const donut = useMemo(() => gastosPorCategoria(items), [items])
  const porCategoria = useMemo(() => totaisPorCategoria(items), [items])
  const history = useMemo(() => saldoUltimosMeses(filteredAll, month, 6), [filteredAll, month])
  const topEntradas = useMemo(() => maiores(items, 'entrada', 5), [items])
  const topGastos = useMemo(() => maiores(items, 'gasto', 5), [items])
  const porPerfil = useMemo(
    () =>
      isAll
        ? comparativoPorPerfil(items, perfis).map((p) => ({
            semana: p.nome,
            entradas: p.entradas,
            gastos: p.gastos,
          }))
        : [],
    [isAll, items, perfis],
  )

  if (items.length === 0) {
    return (
      <EmptyState
        title={`Nada em ${PERIODO_LABEL[periodo].toLowerCase()}`}
        description="Adicione lançamentos para ver os gráficos e indicadores."
        actionLabel={isAll ? undefined : 'Adicionar o primeiro'}
        onAction={isAll ? undefined : onAdd}
      />
    )
  }

  const nGastos = items.filter((l) => l.tipo === 'gasto').length
  const ticketMedio = nGastos > 0 ? t.gastos / nGastos : 0

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Entradas"
          value={formatCurrency(t.entradas)}
          valueColor="var(--green)"
          delta={variacao(t.entradas, tPrev.entradas)}
        />
        <KpiCard
          label="Gastos"
          value={formatCurrency(t.gastos)}
          valueColor="var(--red)"
          delta={variacao(t.gastos, tPrev.gastos)}
          invertDelta
        />
        <KpiCard
          label="Saldo"
          value={formatCurrency(t.saldo)}
          valueColor={t.saldo >= 0 ? 'var(--green)' : 'var(--red)'}
          delta={variacao(t.saldo, tPrev.saldo)}
        />
        <KpiCard label="Ticket médio de gasto" value={formatCurrency(ticketMedio)} />
      </div>

      {/* Comparativo por perfil (modo consolidado) */}
      {isAll && porPerfil.length > 0 && (
        <ChartCard title="Comparativo por perfil" subtitle="Entradas × Gastos no período">
          <WeeklyBarChart data={porPerfil} />
        </ChartCard>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {range.single ? (
          <>
            <ChartCard title="Entradas vs. Gastos" subtitle="Por semana do mês">
              <WeeklyBarChart data={weekly} />
            </ChartCard>
            <ChartCard title="Saldo acumulado" subtitle="Ao longo do mês">
              <BalanceAreaChart data={balance} />
            </ChartCard>
          </>
        ) : (
          <ChartCard title="Entradas vs. Gastos" subtitle="Por mês" className="lg:col-span-2">
            <WeeklyBarChart data={monthly} />
          </ChartCard>
        )}

        <ChartCard title="Gastos por categoria" subtitle="Empresa · Pessoa Física · Sem categoria">
          <CategoryDonut data={donut} />
        </ChartCard>

        <ChartCard title="Empresa × Pessoa Física" subtitle="Entradas, gastos e saldo">
          <CategoriaCompare data={porCategoria} />
        </ChartCard>

        <ChartCard title="Últimos 6 meses" subtitle="Saldo mensal" className="lg:col-span-2">
          <MonthlyComparison data={history} />
        </ChartCard>

        <ChartCard title="Maiores lançamentos" className="lg:col-span-2">
          <TopEntries entradas={topEntradas} gastos={topGastos} onSelect={onSelect} />
        </ChartCard>
      </div>
    </div>
  )
}
