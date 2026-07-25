import {
  addMonths,
  endOfMonth,
  endOfYear,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns'
import type { Categoria, Lancamento, Perfil, Periodo } from '../types'
import { PROFILE_COLORS } from '../types/perfil'
import { CATEGORIA_COLOR, CATEGORIA_LABEL, CATEGORIA_ORDER } from './labels'
import { toDate } from './format'
import { weekOfMonth, weeksInMonth } from './calendar'

export interface Totais {
  entradas: number
  gastos: number
  saldo: number
  count: number
}

export function filterByMonth(all: Lancamento[], month: Date): Lancamento[] {
  return all.filter((l) => isSameMonth(toDate(l.data), month))
}

export function totais(lancamentos: Lancamento[]): Totais {
  let entradas = 0
  let gastos = 0
  for (const l of lancamentos) {
    if (l.tipo === 'entrada') entradas += l.valor
    else gastos += l.valor
  }
  return { entradas, gastos, saldo: entradas - gastos, count: lancamentos.length }
}

/** Entradas x Gastos por semana do mês, para o gráfico de barras agrupadas. */
export interface WeeklyPoint {
  semana: string
  entradas: number
  gastos: number
}

export function weeklyData(monthLancamentos: Lancamento[], month: Date): WeeklyPoint[] {
  const total = weeksInMonth(month)
  const buckets: WeeklyPoint[] = Array.from({ length: total }, (_, i) => ({
    semana: `Sem ${i + 1}`,
    entradas: 0,
    gastos: 0,
  }))
  for (const l of monthLancamentos) {
    const idx = weekOfMonth(toDate(l.data)) - 1
    if (idx < 0 || idx >= buckets.length) continue
    if (l.tipo === 'entrada') buckets[idx].entradas += l.valor
    else buckets[idx].gastos += l.valor
  }
  return buckets
}

/** Saldo acumulado dia a dia ao longo do mês. */
export interface BalancePoint {
  dia: number
  saldo: number
}

export function balanceAccumulated(monthLancamentos: Lancamento[], month: Date): BalancePoint[] {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const perDay = new Array<number>(daysInMonth + 1).fill(0)
  for (const l of monthLancamentos) {
    const dia = toDate(l.data).getDate()
    perDay[dia] += l.tipo === 'entrada' ? l.valor : -l.valor
  }
  const points: BalancePoint[] = []
  let running = 0
  for (let dia = 1; dia <= daysInMonth; dia++) {
    running += perDay[dia]
    points.push({ dia, saldo: running })
  }
  return points
}

/** Distribuição de gastos por categoria (donut): exatamente 3 fatias fixas. */
export interface CategorySlice {
  categoria: Categoria
  label: string
  value: number
  color: string
}

export function gastosPorCategoria(lancamentos: Lancamento[]): CategorySlice[] {
  const totals: Record<Categoria, number> = { empresa: 0, pessoa_fisica: 0, sem_categoria: 0 }
  for (const l of lancamentos) {
    if (l.tipo === 'gasto') totals[l.categoria] += l.valor
  }
  return CATEGORIA_ORDER.map((c) => ({
    categoria: c,
    label: CATEGORIA_LABEL[c],
    value: totals[c],
    color: CATEGORIA_COLOR[c],
  }))
}

/** Entradas/Gastos/Saldo por categoria (card "Empresa × Pessoa Física"). */
export interface CategoriaTotais {
  categoria: Categoria
  label: string
  color: string
  entradas: number
  gastos: number
  saldo: number
}

export function totaisPorCategoria(items: Lancamento[]): CategoriaTotais[] {
  return CATEGORIA_ORDER.map((c) => {
    const t = totais(items.filter((l) => l.categoria === c))
    return { categoria: c, label: CATEGORIA_LABEL[c], color: CATEGORIA_COLOR[c], ...t }
  })
}

/** Saldo dos últimos N meses. */
export interface MonthlyBalance {
  mes: Date
  saldo: number
  atual: boolean
}

export function saldoUltimosMeses(all: Lancamento[], month: Date, n = 6): MonthlyBalance[] {
  const result: MonthlyBalance[] = []
  for (let i = n - 1; i >= 0; i--) {
    const m = subMonths(month, i)
    const t = totais(filterByMonth(all, m))
    result.push({ mes: m, saldo: t.saldo, atual: i === 0 })
  }
  return result
}

/** Maiores lançamentos do mês por tipo. */
export function maiores(monthLancamentos: Lancamento[], tipo: 'entrada' | 'gasto', limit = 5) {
  return monthLancamentos
    .filter((l) => l.tipo === tipo)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limit)
}

/** Variação percentual de um total vs. período anterior. null quando não há base. */
export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null
  return (atual - anterior) / anterior
}

/** Intervalo e meses cobertos por um período do dashboard. */
export interface Range {
  start: Date
  end: Date
  months: Date[] // month-starts, cronológico
  single: boolean // true quando é um único mês
}

export function rangeFor(periodo: Periodo, ref: Date): Range {
  if (periodo === 'mes') {
    const start = startOfMonth(ref)
    return { start, end: endOfMonth(ref), months: [start], single: true }
  }
  if (periodo === 'ano') {
    const start = startOfYear(ref)
    const end = endOfYear(ref)
    const months: Date[] = []
    for (let m = start; m <= end; m = addMonths(m, 1)) months.push(m)
    return { start, end, months, single: false }
  }
  const n = periodo === '3meses' ? 3 : 6
  const start = startOfMonth(subMonths(ref, n - 1))
  const end = endOfMonth(ref)
  const months: Date[] = []
  for (let i = 0; i < n; i++) months.push(startOfMonth(subMonths(ref, n - 1 - i)))
  return { start, end, months, single: false }
}

export function filterByRange(all: Lancamento[], range: Range): Lancamento[] {
  return all.filter((l) => isWithinInterval(toDate(l.data), { start: range.start, end: range.end }))
}

/** Entradas x Gastos agrupados por mês (para períodos de vários meses). */
export function entradasGastosPorMes(
  items: Lancamento[],
  months: Date[],
): { mes: Date; entradas: number; gastos: number }[] {
  return months.map((mes) => {
    const t = totais(filterByMonth(items, mes))
    return { mes, entradas: t.entradas, gastos: t.gastos }
  })
}

/** Comparativo consolidado por perfil (modo "Todos os perfis"). */
export interface PerfilComparativo {
  perfilId: string
  nome: string
  color: string
  entradas: number
  gastos: number
  saldo: number
}

export function comparativoPorPerfil(
  items: Lancamento[],
  perfis: Perfil[],
): PerfilComparativo[] {
  return perfis.map((p) => {
    const t = totais(items.filter((l) => l.perfilId === p.id))
    return {
      perfilId: p.id,
      nome: p.nome,
      color: PROFILE_COLORS[p.cor],
      entradas: t.entradas,
      gastos: t.gastos,
      saldo: t.saldo,
    }
  })
}
