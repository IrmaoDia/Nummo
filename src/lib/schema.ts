import { z } from 'zod'
import { normalizeCategoria } from './migrations'
import type { Lancamento, Perfil } from '../types'

/** Schema do formulário de lançamento (novo/editar) — sem perfilId (injetado). */
export const lancamentoFormSchema = z.object({
  titulo: z.string().trim().min(1, 'Informe um título'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  tipo: z.enum(['entrada', 'gasto']),
  valor: z.number({ message: 'Informe um valor' }).positive('O valor deve ser maior que zero'),
  categoria: z.enum(['empresa', 'pessoa_fisica', 'sem_categoria']),
  observacao: z.string().trim().optional(),
})

export type LancamentoFormValues = z.infer<typeof lancamentoFormSchema>

const COR = z.enum(['blue', 'purple', 'orange', 'pink', 'teal', 'indigo', 'green'])

const perfilSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  emoji: z.string().min(1),
  cor: COR,
  criadoEm: z.string(),
  atualizadoEm: z.string(),
})

// Lançamento importado: perfilId opcional (v2) — campos desconhecidos (ex.: origem legado) são descartados.
const lancamentoImportSchema = z.object({
  id: z.string().min(1),
  perfilId: z.string().optional(),
  titulo: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo: z.enum(['entrada', 'gasto']),
  valor: z.number().nonnegative(),
  categoria: z.unknown().optional(), // normalizada na importação
  observacao: z.string().optional(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
})

export interface ImportResult {
  lancamentos: Lancamento[]
  novosPerfis: Perfil[]
  invalidos: number
}

/**
 * Valida dados importados. Aceita:
 *  - array de lançamentos (formato v1) → todos vão para o perfil atual;
 *  - objeto { perfis, lancamentos } (v2) → recria perfis inexistentes casando por nome.
 */
export function parseImport(
  raw: unknown,
  existingPerfis: Perfil[],
  fallbackPerfilId: string,
): ImportResult {
  let rawPerfis: unknown[] = []
  let rawLanc: unknown[] = []
  if (Array.isArray(raw)) {
    rawLanc = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    rawPerfis = Array.isArray(obj.perfis) ? obj.perfis : []
    rawLanc = Array.isArray(obj.lancamentos) ? obj.lancamentos : []
  }

  // Perfis importados → casa por nome; cria os que faltam.
  const byName = new Map(existingPerfis.map((p) => [p.nome.trim().toLowerCase(), p]))
  const idRemap = new Map<string, string>()
  const novosPerfis: Perfil[] = []
  for (const p of rawPerfis) {
    const parsed = perfilSchema.safeParse(p)
    if (!parsed.success) continue
    const existing = byName.get(parsed.data.nome.trim().toLowerCase())
    if (existing) {
      idRemap.set(parsed.data.id, existing.id)
    } else {
      idRemap.set(parsed.data.id, parsed.data.id)
      novosPerfis.push(parsed.data)
    }
  }

  const lancamentos: Lancamento[] = []
  let invalidos = 0
  for (const item of rawLanc) {
    const parsed = lancamentoImportSchema.safeParse(item)
    if (!parsed.success) {
      invalidos++
      continue
    }
    const d = parsed.data
    let perfilId = fallbackPerfilId
    if (d.perfilId) {
      if (idRemap.has(d.perfilId)) perfilId = idRemap.get(d.perfilId)!
      else if (existingPerfis.some((p) => p.id === d.perfilId)) perfilId = d.perfilId
    }
    lancamentos.push({
      id: d.id,
      perfilId,
      titulo: d.titulo,
      data: d.data,
      tipo: d.tipo,
      valor: d.valor,
      categoria: normalizeCategoria(d.categoria),
      observacao: d.observacao,
      criadoEm: d.criadoEm,
      atualizadoEm: d.atualizadoEm,
    })
  }

  return { lancamentos, novosPerfis, invalidos }
}
