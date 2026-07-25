export type Tipo = 'entrada' | 'gasto'

export type Categoria = 'empresa' | 'pessoa_fisica' | 'sem_categoria'

export interface Lancamento {
  id: string // uuid
  perfilId: string // ← perfil a que pertence
  titulo: string // ex: "Anúncios Meta", "Venda Hotmart"
  data: string // ISO: "2026-07-23"
  tipo: Tipo
  valor: number // sempre positivo, em reais (ex: 1250.90)
  categoria: Categoria // obrigatório, lista fixa
  observacao?: string // opcional, texto longo
  criadoEm: string // ISO datetime
  atualizadoEm: string // ISO datetime
}

/** Payload completo de persistência — inclui perfilId, sem campos gerados. */
export type LancamentoInput = Omit<Lancamento, 'id' | 'criadoEm' | 'atualizadoEm'>

/** Payload do formulário — sem perfilId (injetado a partir do perfil ativo). */
export type LancamentoDraft = Omit<LancamentoInput, 'perfilId'>

export type Theme = 'light' | 'dark' | 'system'

export type View = 'dia' | 'tipo' | 'resumo'

export type Periodo = 'mes' | '3meses' | '6meses' | 'ano'

export interface Filtros {
  tipo: Tipo | 'todos'
  categorias: Categoria[]
  busca: string
}

export const FILTROS_VAZIOS: Filtros = {
  tipo: 'todos',
  categorias: [],
  busca: '',
}

export type { Perfil, PerfilInput, ProfileColor, ActiveProfileId } from './perfil'
