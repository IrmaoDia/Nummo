import type { Categoria, Tipo } from '../../types'

/** Um lançamento extraído do CSV, ainda sem perfil/id (não gravado). */
export interface LinhaImportada {
  data: string // ISO: "2026-07-25"
  titulo: string
  tipo: Tipo
  valor: number // sempre positivo
  categoria: Categoria
  /** Texto original do Histórico — só para conferência na tela. */
  historico: string
}

/** Linha na tela de conferência: o dado + o estado de seleção. */
export interface LinhaPreview extends LinhaImportada {
  id: string // chave estável para React
  selecionada: boolean
  duplicada: boolean
}

export interface ResultadoParse {
  linhas: LinhaImportada[]
  /** Linhas descartadas por não terem valor numérico válido. */
  ignoradas: number
  /** Intervalo de datas encontrado (ISO), null quando não há linhas. */
  inicio: string | null
  fim: string | null
}

/** Assinatura comum a todos os parsers de banco (hoje só o Inter). */
export type ParserExtrato = (texto: string) => ResultadoParse
