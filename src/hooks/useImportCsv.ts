import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { parseInter } from '../lib/csv/parseInter'
import type { LinhaPreview } from '../lib/csv/types'
import { repository } from '../lib/repository'

export const ERRO_NAO_CSV = 'Envie um arquivo .csv exportado do seu banco.'
export const ERRO_SEM_LINHAS =
  'Não encontramos lançamentos neste arquivo. Confira se é o extrato em CSV.'
export const ERRO_GRAVAR = 'Não foi possível importar. Tente novamente.'

type Etapa = 'arquivo' | 'preview' | 'gravando'

/** Chave de comparação para duplicatas: data + valor + título. */
function chaveDup(data: string, valor: number, titulo: string): string {
  return `${data}|${valor.toFixed(2)}|${titulo.trim().toLowerCase()}`
}

export function useImportCsv() {
  const { activeId, isAll, active } = useProfile()
  const { user } = useAuth()
  const qc = useQueryClient()

  const [etapa, setEtapa] = useState<Etapa>('arquivo')
  const [erro, setErro] = useState('')
  const [linhas, setLinhas] = useState<LinhaPreview[]>([])
  const [intervalo, setIntervalo] = useState<{ inicio: string; fim: string } | null>(null)
  const [ignoradas, setIgnoradas] = useState(0)
  const [nomeArquivo, setNomeArquivo] = useState('')

  const podeImportar = !isAll && !!activeId

  const reset = useCallback(() => {
    setEtapa('arquivo')
    setErro('')
    setLinhas([])
    setIntervalo(null)
    setIgnoradas(0)
    setNomeArquivo('')
  }, [])

  /** Lê o arquivo, interpreta e marca duplicatas contra o que já existe. */
  const carregarArquivo = useCallback(
    async (file: File) => {
      setErro('')
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErro(ERRO_NAO_CSV)
        return
      }
      setNomeArquivo(file.name)

      const texto = await file.text()
      const r = parseInter(texto)
      if (!r.linhas.length || !r.inicio || !r.fim) {
        setErro(ERRO_SEM_LINHAS)
        return
      }

      // Duplicatas: compara com os lançamentos já existentes no intervalo.
      let existentes = new Set<string>()
      try {
        const jaGravados = await repository.listarParaConferencia(activeId, r.inicio, r.fim)
        existentes = new Set(jaGravados.map((l) => chaveDup(l.data, l.valor, l.titulo)))
      } catch {
        // Sem conferência de duplicatas, a importação ainda é possível.
        existentes = new Set()
      }

      setLinhas(
        r.linhas.map((l, i) => {
          const duplicada = existentes.has(chaveDup(l.data, l.valor, l.titulo))
          return {
            ...l,
            id: `${i}-${l.data}-${l.valor}`,
            duplicada,
            selecionada: !duplicada, // duplicatas vêm desmarcadas
          }
        }),
      )
      setIntervalo({ inicio: r.inicio, fim: r.fim })
      setIgnoradas(r.ignoradas)
      setEtapa('preview')
    },
    [activeId],
  )

  const alternarLinha = useCallback((id: string) => {
    setLinhas((old) =>
      old.map((l) => (l.id === id ? { ...l, selecionada: !l.selecionada } : l)),
    )
  }, [])

  const marcarTodas = useCallback((valor: boolean) => {
    setLinhas((old) => old.map((l) => ({ ...l, selecionada: valor })))
  }, [])

  const selecionadas = useMemo(() => linhas.filter((l) => l.selecionada), [linhas])
  const duplicadas = useMemo(() => linhas.filter((l) => l.duplicada).length, [linhas])

  const totais = useMemo(() => {
    let entradas = 0
    let gastos = 0
    for (const l of linhas) {
      if (l.tipo === 'entrada') entradas += l.valor
      else gastos += l.valor
    }
    return { entradas, gastos }
  }, [linhas])

  /**
   * Grava as linhas marcadas. Devolve os ids criados e a data mais recente,
   * ou null em caso de falha (nada é gravado pela metade).
   */
  const importar = useCallback(async (): Promise<{ ids: string[]; ultimaData: string } | null> => {
    if (!selecionadas.length || !podeImportar) return null
    setEtapa('gravando')
    setErro('')
    try {
      const itens = selecionadas.map((l) => ({
        titulo: l.titulo,
        data: l.data,
        tipo: l.tipo,
        valor: l.valor,
        categoria: l.categoria,
      }))
      const ids = await repository.inserirLancamentosEmLote(activeId, itens)
      const ultimaData = selecionadas.map((l) => l.data).sort().at(-1) ?? ''
      await qc.invalidateQueries({ queryKey: ['lancamentos', user?.id] })
      await qc.invalidateQueries({ queryKey: ['perfis-agg', user?.id] })
      return { ids, ultimaData }
    } catch {
      setErro(ERRO_GRAVAR)
      setEtapa('preview') // mantém a pré-visualização aberta
      return null
    }
  }, [selecionadas, podeImportar, activeId, qc, user?.id])

  /** Desfaz o lote recém-importado. */
  const desfazer = useCallback(
    async (ids: string[]) => {
      await repository.excluirLote(ids)
      await qc.invalidateQueries({ queryKey: ['lancamentos', user?.id] })
      await qc.invalidateQueries({ queryKey: ['perfis-agg', user?.id] })
    },
    [qc, user?.id],
  )

  return {
    etapa,
    erro,
    linhas,
    intervalo,
    ignoradas,
    nomeArquivo,
    podeImportar,
    perfilAtivo: active,
    selecionadas,
    duplicadas,
    totais,
    carregarArquivo,
    alternarLinha,
    marcarTodas,
    importar,
    desfazer,
    reset,
    setErro,
  }
}
