import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { repository } from '../lib/repository'
import type { Lancamento, LancamentoDraft } from '../types'

const now = () => new Date().toISOString()
const tempId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'tmp-' + Math.random().toString(36).slice(2)

const ERRO_SALVAR = 'Não foi possível salvar. Tente novamente.'

/**
 * Lançamentos do perfil ativo (ou de todos), via TanStack Query.
 * Criar/editar/excluir/mover são otimistas: a UI muda na hora e reverte com
 * toast em caso de erro. Mantém a mesma interface consumida pelas telas.
 */
export function useLancamentos() {
  const { activeId, isAll } = useProfile()
  const { user } = useAuth()
  const userId = user?.id
  const qc = useQueryClient()
  const { showToast } = useToast()

  const lancKey = useMemo(
    () => ['lancamentos', userId, isAll ? 'all' : activeId] as const,
    [userId, isAll, activeId],
  )

  const query = useQuery({
    queryKey: lancKey,
    queryFn: () => repository.listarLancamentos(isAll ? undefined : activeId),
    enabled: !!userId && (isAll || !!activeId),
  })

  const invalidateAgg = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['perfis-agg', userId] })
  }, [qc, userId])

  const snapshot = useCallback(async () => {
    await qc.cancelQueries({ queryKey: lancKey })
    return qc.getQueryData<Lancamento[]>(lancKey)
  }, [qc, lancKey])

  const create = useCallback(
    async (draft: LancamentoDraft) => {
      if (isAll) return
      const optimistic: Lancamento = {
        ...draft,
        id: tempId(),
        perfilId: activeId,
        criadoEm: now(),
        atualizadoEm: now(),
      }
      const prev = await snapshot()
      qc.setQueryData<Lancamento[]>(lancKey, (old = []) => [...old, optimistic])
      try {
        const created = await repository.criarLancamento({ ...draft, perfilId: activeId })
        qc.setQueryData<Lancamento[]>(lancKey, (old = []) =>
          old.map((l) => (l.id === optimistic.id ? created : l)),
        )
      } catch {
        qc.setQueryData(lancKey, prev)
        showToast({ message: ERRO_SALVAR })
      } finally {
        invalidateAgg()
      }
    },
    [isAll, activeId, snapshot, qc, lancKey, showToast, invalidateAgg],
  )

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Lancamento, 'id'>>) => {
      const movesOut = !isAll && !!patch.perfilId && patch.perfilId !== activeId
      const prev = await snapshot()
      qc.setQueryData<Lancamento[]>(lancKey, (old = []) =>
        movesOut
          ? old.filter((l) => l.id !== id)
          : old.map((l) => (l.id === id ? { ...l, ...patch, atualizadoEm: now() } : l)),
      )
      try {
        await repository.atualizarLancamento(id, patch)
      } catch {
        qc.setQueryData(lancKey, prev)
        showToast({ message: ERRO_SALVAR })
      } finally {
        invalidateAgg()
        if (movesOut) void qc.invalidateQueries({ queryKey: ['lancamentos', userId] })
      }
    },
    [isAll, activeId, snapshot, qc, lancKey, userId, showToast, invalidateAgg],
  )

  const remove = useCallback(
    async (id: string) => {
      const prev = await snapshot()
      qc.setQueryData<Lancamento[]>(lancKey, (old = []) => old.filter((l) => l.id !== id))
      try {
        await repository.excluirLancamento(id)
      } catch {
        qc.setQueryData(lancKey, prev)
        showToast({ message: ERRO_SALVAR })
      } finally {
        invalidateAgg()
      }
    },
    [snapshot, qc, lancKey, showToast, invalidateAgg],
  )

  const restore = useCallback(
    async (item: Lancamento) => {
      qc.setQueryData<Lancamento[]>(lancKey, (old = []) =>
        isAll || item.perfilId === activeId ? [...old, item] : old,
      )
      try {
        await repository.inserirLancamento(item)
      } catch {
        showToast({ message: ERRO_SALVAR })
      } finally {
        invalidateAgg()
        void qc.invalidateQueries({ queryKey: lancKey })
      }
    },
    [isAll, activeId, qc, lancKey, showToast, invalidateAgg],
  )

  const importItems = useCallback(
    async (items: Lancamento[]) => {
      await repository.bulkInserirLancamentos(items)
      void qc.invalidateQueries({ queryKey: ['lancamentos', userId] })
      invalidateAgg()
    },
    [qc, userId, invalidateAgg],
  )

  const clearActive = useCallback(async () => {
    if (isAll) return
    await repository.limparPerfil(activeId)
    void qc.invalidateQueries({ queryKey: ['lancamentos', userId] })
    invalidateAgg()
  }, [isAll, activeId, qc, userId, invalidateAgg])

  return {
    all: query.data ?? [],
    loading: query.isLoading,
    create,
    update,
    remove,
    restore,
    importItems,
    clearActive,
  }
}
