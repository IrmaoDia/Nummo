import { supabase } from './supabase'
import {
  lancamentoFromRow,
  lancamentoToInsert,
  lancamentoToInsertWithId,
  lancamentoToUpdate,
  perfilFromRow,
  perfilToInsert,
  perfilToInsertWithId,
  perfilToUpdate,
} from './mappers'
import type { Lancamento, LancamentoInput, Perfil, PerfilInput } from '../types'

/**
 * Camada de persistência abstrata (implementada sobre o Supabase).
 * NENHUM componente de UI importa `supabase` diretamente — só este arquivo.
 * O `user_id` é sempre preenchido a partir da sessão ativa; o RLS garante o
 * isolamento por usuário no servidor.
 */
export interface Repository {
  // Perfis
  listarPerfis(): Promise<Perfil[]>
  criarPerfil(input: PerfilInput): Promise<Perfil>
  atualizarPerfil(id: string, patch: Partial<PerfilInput>): Promise<Perfil>
  excluirPerfil(id: string): Promise<void>
  bulkInserirPerfis(perfis: Perfil[]): Promise<void>

  // Lançamentos
  listarLancamentos(perfilId?: string): Promise<Lancamento[]>
  criarLancamento(input: LancamentoInput): Promise<Lancamento>
  atualizarLancamento(id: string, patch: Partial<LancamentoInput>): Promise<Lancamento>
  excluirLancamento(id: string): Promise<void>
  moverLancamento(id: string, perfilId: string): Promise<void>
  inserirLancamento(l: Lancamento): Promise<void>
  bulkInserirLancamentos(items: Lancamento[]): Promise<void>
  limparPerfil(perfilId: string): Promise<void>

  // Agregados (contagem/saldo por perfil)
  agregadoPorPerfil(): Promise<{ counts: Record<string, number>; saldos: Record<string, number> }>
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('Sessão expirada. Faça login novamente.')
  return id
}

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

class SupabaseRepository implements Repository {
  // ---- Perfis ----
  async listarPerfis(): Promise<Perfil[]> {
    const { data, error } = await supabase.from('perfis').select('*').order('criado_em')
    fail('listarPerfis', error)
    return (data ?? []).map(perfilFromRow)
  }

  async criarPerfil(input: PerfilInput): Promise<Perfil> {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('perfis')
      .insert(perfilToInsert(input, userId))
      .select()
      .single()
    fail('criarPerfil', error)
    return perfilFromRow(data!)
  }

  async atualizarPerfil(id: string, patch: Partial<PerfilInput>): Promise<Perfil> {
    const { data, error } = await supabase
      .from('perfis')
      .update(perfilToUpdate(patch))
      .eq('id', id)
      .select()
      .single()
    fail('atualizarPerfil', error)
    return perfilFromRow(data!)
  }

  async excluirPerfil(id: string): Promise<void> {
    // Lançamentos são removidos em cascata pela FK (on delete cascade).
    const { error } = await supabase.from('perfis').delete().eq('id', id)
    fail('excluirPerfil', error)
  }

  async bulkInserirPerfis(perfis: Perfil[]): Promise<void> {
    if (!perfis.length) return
    const userId = await currentUserId()
    const { error } = await supabase
      .from('perfis')
      .insert(perfis.map((p) => perfilToInsertWithId(p, userId)))
    fail('bulkInserirPerfis', error)
  }

  // ---- Lançamentos ----
  async listarLancamentos(perfilId?: string): Promise<Lancamento[]> {
    let query = supabase.from('lancamentos').select('*').order('data')
    if (perfilId) query = query.eq('perfil_id', perfilId)
    const { data, error } = await query
    fail('listarLancamentos', error)
    return (data ?? []).map(lancamentoFromRow)
  }

  async criarLancamento(input: LancamentoInput): Promise<Lancamento> {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('lancamentos')
      .insert(lancamentoToInsert(input, userId))
      .select()
      .single()
    fail('criarLancamento', error)
    return lancamentoFromRow(data!)
  }

  async atualizarLancamento(id: string, patch: Partial<LancamentoInput>): Promise<Lancamento> {
    const { data, error } = await supabase
      .from('lancamentos')
      .update(lancamentoToUpdate(patch))
      .eq('id', id)
      .select()
      .single()
    fail('atualizarLancamento', error)
    return lancamentoFromRow(data!)
  }

  async excluirLancamento(id: string): Promise<void> {
    const { error } = await supabase.from('lancamentos').delete().eq('id', id)
    fail('excluirLancamento', error)
  }

  async moverLancamento(id: string, perfilId: string): Promise<void> {
    const { error } = await supabase
      .from('lancamentos')
      .update({ perfil_id: perfilId })
      .eq('id', id)
    fail('moverLancamento', error)
  }

  async inserirLancamento(l: Lancamento): Promise<void> {
    const userId = await currentUserId()
    const { error } = await supabase.from('lancamentos').insert(lancamentoToInsertWithId(l, userId))
    fail('inserirLancamento', error)
  }

  async bulkInserirLancamentos(items: Lancamento[]): Promise<void> {
    if (!items.length) return
    const userId = await currentUserId()
    // Lotes de 100 (evita payloads grandes).
    for (let i = 0; i < items.length; i += 100) {
      const lote = items.slice(i, i + 100).map((l) => lancamentoToInsertWithId(l, userId))
      const { error } = await supabase.from('lancamentos').upsert(lote)
      fail('bulkInserirLancamentos', error)
    }
  }

  async limparPerfil(perfilId: string): Promise<void> {
    const { error } = await supabase.from('lancamentos').delete().eq('perfil_id', perfilId)
    fail('limparPerfil', error)
  }

  async agregadoPorPerfil(): Promise<{ counts: Record<string, number>; saldos: Record<string, number> }> {
    const { data, error } = await supabase.from('lancamentos').select('perfil_id, tipo, valor')
    fail('agregadoPorPerfil', error)
    const counts: Record<string, number> = {}
    const saldos: Record<string, number> = {}
    for (const r of data ?? []) {
      counts[r.perfil_id] = (counts[r.perfil_id] ?? 0) + 1
      const v = Number(r.valor)
      saldos[r.perfil_id] = (saldos[r.perfil_id] ?? 0) + (r.tipo === 'entrada' ? v : -v)
    }
    return { counts, saldos }
  }
}

export const repository: Repository = new SupabaseRepository()
