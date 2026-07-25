import Dexie, { type Table } from 'dexie'
import type { Lancamento, Perfil } from '../types'
import { migrateToV2, migrateToV3 } from './migrations'

/**
 * Banco local (IndexedDB) via Dexie.
 * v2: tabela `perfis` + índice `perfilId` (e composto `[perfilId+data]`) em lançamentos.
 */
export class FinancasDB extends Dexie {
  lancamentos!: Table<Lancamento, string>
  perfis!: Table<Perfil, string>

  constructor() {
    super('financas')

    // v1 (legado) — mantido para permitir o upgrade incremental.
    this.version(1).stores({
      lancamentos: 'id, data, tipo, origem, categoria, criadoEm',
    })

    // v2 — perfis + perfilId; remove o índice de origem.
    this.version(2)
      .stores({
        lancamentos: 'id, data, tipo, categoria, criadoEm, perfilId, [perfilId+data]',
        perfis: 'id, nome, criadoEm',
      })
      .upgrade((tx) => migrateToV2(tx))

    // v3 — categoria vira lista fixa (empresa | pessoa_fisica | sem_categoria).
    this.version(3)
      .stores({
        lancamentos: 'id, data, tipo, categoria, criadoEm, perfilId, [perfilId+data]',
        perfis: 'id, nome, criadoEm',
      })
      .upgrade((tx) => migrateToV3(tx))
  }
}

export const db = new FinancasDB()
