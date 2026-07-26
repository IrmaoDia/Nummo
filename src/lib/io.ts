import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subMonths } from 'date-fns'
import { CATEGORIA_LABEL, TIPO_LABEL } from './labels'
import { toDate, toISODate } from './format'
import type { Lancamento, Perfil } from '../types'

function download(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function stamp(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// ---------------------------------------------------------------------------
// Período da exportação
// ---------------------------------------------------------------------------

export type ExportPeriodo = 'mes' | '3meses' | 'ano' | 'tudo'

export const EXPORT_PERIODOS: { value: ExportPeriodo; label: string }[] = [
  { value: 'mes', label: 'Mês atual' },
  { value: '3meses', label: 'Últimos 3 meses' },
  { value: 'ano', label: 'Ano atual' },
  { value: 'tudo', label: 'Tudo' },
]

/** Intervalo ISO fechado do período; `null` em "Tudo" (sem limite). */
export interface IntervaloExport {
  inicio: string | null
  fim: string | null
}

export function intervaloDoPeriodo(p: ExportPeriodo, hoje = new Date()): IntervaloExport {
  switch (p) {
    case 'mes':
      return { inicio: toISODate(startOfMonth(hoje)), fim: toISODate(endOfMonth(hoje)) }
    case '3meses':
      return { inicio: toISODate(startOfMonth(subMonths(hoje, 2))), fim: toISODate(endOfMonth(hoje)) }
    case 'ano':
      return { inicio: toISODate(startOfYear(hoje)), fim: toISODate(endOfYear(hoje)) }
    case 'tudo':
      return { inicio: null, fim: null }
  }
}

/** Filtra pelo período e devolve ordenado por data (o PDF e o CSV dependem disso). */
export function filtrarPorPeriodo(
  lancamentos: Lancamento[],
  p: ExportPeriodo,
  hoje = new Date(),
): Lancamento[] {
  const { inicio, fim } = intervaloDoPeriodo(p, hoje)
  return lancamentos
    .filter((l) => (!inicio || l.data >= inicio) && (!fim || l.data <= fim))
    .slice()
    .sort((a, b) => a.data.localeCompare(b.data))
}

/** Trecho do nome do arquivo: "2026-07", "2026-05_2026-07", "2026" ou "tudo". */
export function sufixoPeriodo(p: ExportPeriodo, hoje = new Date()): string {
  switch (p) {
    case 'mes':
      return format(hoje, 'yyyy-MM')
    case '3meses':
      return `${format(subMonths(hoje, 2), 'yyyy-MM')}_${format(hoje, 'yyyy-MM')}`
    case 'ano':
      return format(hoje, 'yyyy')
    case 'tudo':
      return 'tudo'
  }
}

/** "Conta Pessoal" → "conta-pessoal" (seguro para nome de arquivo). */
export function slugify(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'perfil'
  )
}

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

/** Exporta perfis + lançamentos como JSON (backup completo, reimportável). */
export function exportJSON(perfis: Perfil[], lancamentos: Lancamento[]) {
  download(
    `nummo-backup-${stamp()}.json`,
    JSON.stringify({ perfis, lancamentos }, null, 2),
    'application/json',
  )
}

function csvCell(value: string): string {
  if (/[";\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"'
  return value
}

const numeroBR = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Serializa o extrato em CSV pt-BR (delimitador ';', decimal ','). Gasto sai
 * com valor negativo e entrada positivo — é assim que a importação reconhece o
 * tipo, o que torna o arquivo reimportável pelo próprio Nummo.
 */
export function csvExtrato(lancamentos: Lancamento[]): string {
  const header = ['Data', 'Titulo', 'Tipo', 'Categoria', 'Valor']
  const rows = lancamentos.map((l) => [
    format(toDate(l.data), 'dd/MM/yyyy'),
    l.titulo,
    TIPO_LABEL[l.tipo],
    CATEGORIA_LABEL[l.categoria],
    numeroBR.format(l.tipo === 'gasto' ? -l.valor : l.valor),
  ])
  return [header, ...rows].map((cols) => cols.map(csvCell).join(';')).join('\r\n')
}

export function exportCSV(lancamentos: Lancamento[], filename: string) {
  // BOM: sem ele o Excel-BR abre os acentos errados.
  download(filename, '﻿' + csvExtrato(lancamentos), 'text/csv;charset=utf-8')
}

/** Dispara o download de um PDF já montado (ver `lib/pdf.ts`). */
export function downloadBlob(filename: string, blob: Blob) {
  download(filename, blob, blob.type)
}

/** Lê um arquivo e devolve o JSON bruto (para validar com parseImport). */
export function readFileAsJSON(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch {
        reject(new Error('Arquivo JSON inválido'))
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsText(file)
  })
}
