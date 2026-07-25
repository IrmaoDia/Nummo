import { useCallback, useMemo, useState } from 'react'
import type { Categoria, Filtros, Lancamento } from '../types'
import { FILTROS_VAZIOS } from '../types'

/** Estado dos filtros + aplicação sobre uma lista de lançamentos. */
export function useFilters() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)

  const setPartial = useCallback((patch: Partial<Filtros>) => {
    setFiltros((f) => ({ ...f, ...patch }))
  }, [])

  const toggleCategoria = useCallback((categoria: Categoria) => {
    setFiltros((f) => ({
      ...f,
      categorias: f.categorias.includes(categoria)
        ? f.categorias.filter((c) => c !== categoria)
        : [...f.categorias, categoria],
    }))
  }, [])

  const reset = useCallback(() => setFiltros(FILTROS_VAZIOS), [])

  const activeCount = useMemo(() => {
    let n = 0
    if (filtros.tipo !== 'todos') n++
    if (filtros.categorias.length) n++
    if (filtros.busca.trim()) n++
    return n
  }, [filtros])

  const apply = useCallback(
    (lancamentos: Lancamento[]): Lancamento[] => {
      const busca = filtros.busca.trim().toLowerCase()
      return lancamentos.filter((l) => {
        if (filtros.tipo !== 'todos' && l.tipo !== filtros.tipo) return false
        if (filtros.categorias.length && !filtros.categorias.includes(l.categoria)) return false
        if (busca && !l.titulo.toLowerCase().includes(busca)) return false
        return true
      })
    },
    [filtros],
  )

  return { filtros, setPartial, toggleCategoria, reset, activeCount, apply }
}
