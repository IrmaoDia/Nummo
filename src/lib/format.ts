import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Formata um número em Real: 1250.9 -> "R$ 1.250,90". */
export function formatCurrency(value: number): string {
  return brl.format(value)
}

/** Aceita string ISO ("2026-07-23") ou Date e devolve um Date estável (meio-dia local, evita salto de fuso). */
export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  // Datas puras "YYYY-MM-DD" viram meia-noite UTC no parseISO; fixamos meio-dia local.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d, 12, 0, 0, 0)
  }
  return parseISO(value)
}

/** "23 de julho de 2026" */
export function formatDateLong(value: string | Date): string {
  return format(toDate(value), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/** "julho de 2026" */
export function formatMonthLong(value: string | Date): string {
  return format(toDate(value), "MMMM 'de' yyyy", { locale: ptBR })
}

/** "23 jul" */
export function formatDateShort(value: string | Date): string {
  return format(toDate(value), 'd MMM', { locale: ptBR })
}

/** "jul/26" */
export function formatMonthShort(value: string | Date): string {
  return format(toDate(value), 'MMM/yy', { locale: ptBR })
}

/** ISO curto de uma data local: Date -> "2026-07-23" */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Percentual assinado: 0.1234 -> "+12,3%" */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return (
    sign +
    new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  )
}

/** Concordância simples: 1 -> "1 lançamento", 0/2+ -> "N lançamentos". */
export function pluralizar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** Valor compacto para rótulos: 1250 -> "R$ 1,3 mil" */
export function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Número compacto sem símbolo, para eixos: 1250 -> "1,3 mil", -900 -> "-900" */
export function formatNumberCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
