import { db } from './db'
import { repository } from './repository'
import type { Lancamento, Perfil } from '../types'

const FLAG = 'migracao_supabase'

export const migracaoConcluida = () => localStorage.getItem(FLAG) === 'concluida'
export const marcarMigracaoConcluida = () => localStorage.setItem(FLAG, 'concluida')

/** Quantos lançamentos existem no Dexie (backup local). */
export async function contarDexie(): Promise<number> {
  try {
    return await db.lancamentos.count()
  } catch {
    return 0
  }
}

async function lerDexie(): Promise<{ perfis: Perfil[]; lancamentos: Lancamento[] }> {
  const [perfis, lancamentos] = await Promise.all([
    db.perfis.toArray(),
    db.lancamentos.toArray(),
  ])
  return { perfis, lancamentos }
}

/**
 * Envia perfis (casando por nome com os já existentes na nuvem) e depois os
 * lançamentos remapeados, em lotes. Não apaga o Dexie (fica como backup).
 * Retorna quantos lançamentos foram enviados.
 */
export async function migrarParaSupabase(existingPerfis: Perfil[]): Promise<number> {
  const { perfis, lancamentos } = await lerDexie()

  const porNome = new Map(existingPerfis.map((p) => [p.nome.trim().toLowerCase(), p]))
  const idMap = new Map<string, string>()
  const novos: Perfil[] = []
  for (const p of perfis) {
    const existente = porNome.get(p.nome.trim().toLowerCase())
    if (existente) idMap.set(p.id, existente.id)
    else {
      idMap.set(p.id, p.id)
      novos.push(p)
    }
  }

  if (novos.length) await repository.bulkInserirPerfis(novos)

  const fallback = existingPerfis[0]?.id
  const remapeados = lancamentos.map((l) => ({
    ...l,
    perfilId: idMap.get(l.perfilId) ?? fallback ?? l.perfilId,
  }))

  await repository.bulkInserirLancamentos(remapeados) // upsert em lotes de 100
  marcarMigracaoConcluida()
  return remapeados.length
}
