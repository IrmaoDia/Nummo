import type { Categoria, Tipo } from '../types'

export const TIPO_LABEL: Record<Tipo, string> = {
  entrada: 'Entrada',
  gasto: 'Gasto',
}

/** Cor CSS do texto/acento por tipo. */
export const TIPO_COLOR: Record<Tipo, string> = {
  entrada: 'var(--green)',
  gasto: 'var(--red)',
}

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  empresa: 'Empresa',
  pessoa_fisica: 'Pessoa Física',
  sem_categoria: 'Sem categoria',
}

/** Cor CSS por categoria. */
export const CATEGORIA_COLOR: Record<Categoria, string> = {
  empresa: 'var(--purple)',
  pessoa_fisica: 'var(--orange)',
  sem_categoria: 'var(--text-secondary)',
}

/** Ordem canônica das categorias (para selects, filtros, gráficos). */
export const CATEGORIA_ORDER: Categoria[] = ['empresa', 'pessoa_fisica', 'sem_categoria']

/** Sinal aplicado ao valor conforme o tipo (+entrada / −gasto). */
export function valorComSinal(tipo: Tipo, valor: number): number {
  return tipo === 'entrada' ? valor : -valor
}
