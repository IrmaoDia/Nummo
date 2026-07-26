import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { parseInter } from '../lib/csv/parseInter'
import type { LinhaImportada, LinhaPreview, ResultadoParse } from '../lib/csv/types'
import { parseImport } from '../lib/schema'
import { repository } from '../lib/repository'
import type { Perfil } from '../types'

export const ERRO_NAO_CSV = 'Envie um arquivo .csv do seu banco ou um backup .json do Nummo.'
export const ERRO_SEM_LINHAS =
  'Não encontramos lançamentos neste arquivo. Confira se é o extrato em CSV.'
export const ERRO_JSON_INVALIDO = 'Este arquivo não é um backup válido do Nummo.'
export const ERRO_GRAVAR = 'Não foi possível importar. Tente novamente.'

// TODO: importar PDF do Inter (aguardando layout de exemplo)

type Etapa = 'arquivo' | 'preview' | 'gravando'

/** Chave de comparação para duplicatas: data + valor + título. */
function chaveDup(data: string, valor: number, titulo: string): string {
  return `${data}|${valor.toFixed(2)}|${titulo.trim().toLowerCase()}`
}

/** Backup do Nummo → mesmas linhas de conferência do extrato bancário. */
function parseBackup(texto: string, perfis: Perfil[], perfilId: string): ResultadoParse {
  const vazio: ResultadoParse = { linhas: [], ignoradas: 0, inicio: null, fim: null }
  let raw: unknown
  try {
    raw = JSON.parse(texto)
  } catch {
    return vazio
  }
  const r = parseImport(raw, perfis, perfilId)
  // Perfis do backup são ignorados de propósito: o modal promete gravar tudo
  // no perfil ativo, e é isso que a conferência mostra.
  const linhas: LinhaImportada[] = r.lancamentos.map((l) => ({
    data: l.data,
    titulo: l.titulo,
    tipo: l.tipo,
    valor: l.valor,
    categoria: l.categoria,
    historico: l.observacao ?? '',
  }))
  const datas = linhas.map((l) => l.data).sort()
  return {
    linhas,
    ignoradas: r.invalidos,
    inicio: datas[0] ?? null,
    fim: datas[datas.length - 1] ?? null,
  }
}

export function useImportCsv() {
  const { activeId, isAll, active, perfis } = useProfile()
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
      const nome = file.name.toLowerCase()
      const backup = nome.endsWith('.json')
      if (!backup && !nome.endsWith('.csv')) {
        setErro(ERRO_NAO_CSV)
        return
      }
      setNomeArquivo(file.name)

      const texto = await file.text()
      const r = backup ? parseBackup(texto, perfis, activeId) : parseInter(texto)
      if (!r.linhas.length || !r.inicio || !r.fim) {
        setErro(backup ? ERRO_JSON_INVALIDO : ERRO_SEM_LINHAS)
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
    [activeId, perfis],
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
      // Sem await: `invalidateQueries` só resolve quando o refetch termina, e
      // esperar por isso deixaria o botão preso em "Importando…" mesmo com os
      // dados já gravados. A tela se atualiza sozinha quando o refetch chegar.
      void qc.invalidateQueries({ queryKey: ['lancamentos', user?.id] })
      void qc.invalidateQueries({ queryKey: ['perfis-agg', user?.id] })
      return { ids, ultimaData }
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : ''
      setErro(detalhe ? `${ERRO_GRAVAR} (${detalhe})` : ERRO_GRAVAR)
      setEtapa('preview') // mantém a pré-visualização aberta
      return null
    }
  }, [selecionadas, podeImportar, activeId, qc, user?.id])

  /** Desfaz o lote recém-importado. */
  const desfazer = useCallback(
    async (ids: string[]) => {
      await repository.excluirLote(ids)
      void qc.invalidateQueries({ queryKey: ['lancamentos', user?.id] })
      void qc.invalidateQueries({ queryKey: ['perfis-agg', user?.id] })
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
