import { format } from 'date-fns'
import { CATEGORIA_LABEL, TIPO_LABEL } from './labels'
import { toDate } from './format'
import type { Lancamento, Perfil } from '../types'

function download(filename: string, content: string, mime: string) {
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

/** Exporta perfis + lançamentos como JSON (reimportável). */
export function exportJSON(perfis: Perfil[], lancamentos: Lancamento[]) {
  download(
    `nummo-${stamp()}.json`,
    JSON.stringify({ perfis, lancamentos }, null, 2),
    'application/json',
  )
}

function csvCell(value: string): string {
  if (/[";\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"'
  return value
}

/** Exporta como CSV amigável para Excel-BR (delimitador ';', decimal ','). */
export function exportCSV(lancamentos: Lancamento[], nomePorPerfil: Record<string, string>) {
  const header = ['Data', 'Perfil', 'Título', 'Tipo', 'Valor', 'Categoria', 'Observação']
  const rows = lancamentos.map((l) => [
    format(toDate(l.data), 'dd/MM/yyyy'),
    nomePorPerfil[l.perfilId] ?? '',
    l.titulo,
    TIPO_LABEL[l.tipo],
    l.valor.toFixed(2).replace('.', ','),
    CATEGORIA_LABEL[l.categoria],
    l.observacao ?? '',
  ])
  const body = [header, ...rows].map((cols) => cols.map(csvCell).join(';')).join('\r\n')
  download(`nummo-${stamp()}.csv`, '﻿' + body, 'text/csv;charset=utf-8')
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
