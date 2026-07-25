import type { Transaction } from 'dexie'
import type { Categoria, Perfil } from '../types'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Perfil criado por padrão (migração e primeiro uso). */
export function defaultPerfil(): Perfil {
  const now = new Date().toISOString()
  return { id: uuid(), nome: 'Pessoal', emoji: '🏠', cor: 'blue', criadoEm: now, atualizadoEm: now }
}

/**
 * Migração v1 → v2 (roda uma única vez):
 * 1. cria o perfil padrão "Pessoal";
 * 2. atribui esse perfilId a todos os lançamentos existentes;
 * 3. remove o antigo campo `origem`.
 */
export async function migrateToV2(tx: Transaction): Promise<void> {
  const perfil = defaultPerfil()
  await tx.table('perfis').add(perfil)
  await tx
    .table('lancamentos')
    .toCollection()
    .modify((l: Record<string, unknown>) => {
      l.perfilId = perfil.id
      delete l.origem
    })
}

/**
 * Normaliza uma categoria de texto livre para a lista fixa.
 * Contém "empresa" → empresa; contém "pessoa"/"pf"/"fisica" → pessoa_fisica;
 * qualquer outra coisa (inclusive vazio/undefined) → sem_categoria.
 */
export function normalizeCategoria(raw: unknown): Categoria {
  if (typeof raw !== 'string') return 'sem_categoria'
  const s = raw
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .trim()
  if (!s) return 'sem_categoria'
  if (s.includes('empresa')) return 'empresa'
  if (s.includes('pessoa') || s.includes('fisica') || s === 'pf' || s.includes('pf')) {
    return 'pessoa_fisica'
  }
  return 'sem_categoria'
}

/**
 * Migração v2 → v3 (roda uma única vez):
 * converte a categoria de texto livre de todos os lançamentos para a lista fixa,
 * sem apagar nenhum registro.
 */
export async function migrateToV3(tx: Transaction): Promise<void> {
  await tx
    .table('lancamentos')
    .toCollection()
    .modify((l: Record<string, unknown>) => {
      l.categoria = normalizeCategoria(l.categoria)
    })
}
