import type { LancamentoRow, PerfilRow } from '../types/database'
import type { Database } from '../types/database'
import type {
  Categoria,
  Lancamento,
  LancamentoInput,
  Perfil,
  PerfilInput,
  ProfileColor,
  Tipo,
} from '../types'

type PerfilInsertRow = Database['public']['Tables']['perfis']['Insert']
type PerfilUpdateRow = Database['public']['Tables']['perfis']['Update']
type LancInsertRow = Database['public']['Tables']['lancamentos']['Insert']
type LancUpdateRow = Database['public']['Tables']['lancamentos']['Update']

/** Dinheiro: sempre 2 casas na escrita, número puro na leitura. */
function money(v: number): number {
  return Math.round(v * 100) / 100
}

// ---- Perfis ----

export function perfilFromRow(r: PerfilRow): Perfil {
  return {
    id: r.id,
    nome: r.nome,
    emoji: r.emoji,
    cor: r.cor as ProfileColor,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  }
}

export function perfilToInsert(input: PerfilInput, userId: string): PerfilInsertRow {
  return { user_id: userId, nome: input.nome, emoji: input.emoji, cor: input.cor }
}

/** Perfil completo (com id) — para migração/importação preservando o id. */
export function perfilToInsertWithId(p: Perfil, userId: string): PerfilInsertRow {
  return { id: p.id, user_id: userId, nome: p.nome, emoji: p.emoji, cor: p.cor }
}

export function perfilToUpdate(patch: Partial<PerfilInput>): PerfilUpdateRow {
  const out: PerfilUpdateRow = {}
  if (patch.nome !== undefined) out.nome = patch.nome
  if (patch.emoji !== undefined) out.emoji = patch.emoji
  if (patch.cor !== undefined) out.cor = patch.cor
  return out
}

// ---- Lançamentos ----

export function lancamentoFromRow(r: LancamentoRow): Lancamento {
  return {
    id: r.id,
    perfilId: r.perfil_id,
    titulo: r.titulo,
    data: r.data,
    tipo: r.tipo as Tipo,
    categoria: r.categoria as Categoria,
    valor: Number(r.valor),
    observacao: r.observacao ?? undefined,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  }
}

export function lancamentoToInsert(input: LancamentoInput, userId: string): LancInsertRow {
  return {
    user_id: userId,
    perfil_id: input.perfilId,
    titulo: input.titulo,
    data: input.data,
    tipo: input.tipo,
    categoria: input.categoria,
    valor: money(input.valor),
    observacao: input.observacao ?? null,
  }
}

/** Lançamento completo (com id) — para restaurar (desfazer), migrar ou importar. */
export function lancamentoToInsertWithId(l: Lancamento, userId: string): LancInsertRow {
  return { id: l.id, ...lancamentoToInsert(l, userId) }
}

export function lancamentoToUpdate(patch: Partial<LancamentoInput>): LancUpdateRow {
  const out: LancUpdateRow = {}
  if (patch.perfilId !== undefined) out.perfil_id = patch.perfilId
  if (patch.titulo !== undefined) out.titulo = patch.titulo
  if (patch.data !== undefined) out.data = patch.data
  if (patch.tipo !== undefined) out.tipo = patch.tipo
  if (patch.categoria !== undefined) out.categoria = patch.categoria
  if (patch.valor !== undefined) out.valor = money(patch.valor)
  if (patch.observacao !== undefined) out.observacao = patch.observacao ?? null
  return out
}
