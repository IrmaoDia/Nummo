import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { repository } from '../lib/repository'
import type { Perfil, PerfilInput } from '../types'

/**
 * Perfis + agregados (contagem/saldo por perfil) via TanStack Query.
 * Mantém a mesma interface de antes; as escritas passam pelo repository e
 * invalidam o cache.
 */
export function usePerfis() {
  const { user } = useAuth()
  const userId = user?.id
  const qc = useQueryClient()

  const perfisQuery = useQuery({
    queryKey: ['perfis', userId],
    queryFn: () => repository.listarPerfis(),
    enabled: !!userId,
  })

  const aggQuery = useQuery({
    queryKey: ['perfis-agg', userId],
    queryFn: () => repository.agregadoPorPerfil(),
    enabled: !!userId,
  })

  const invalidatePerfis = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['perfis', userId] })
    void qc.invalidateQueries({ queryKey: ['perfis-agg', userId] })
  }, [qc, userId])

  const createPerfil = useCallback(
    async (input: PerfilInput) => {
      const p = await repository.criarPerfil(input)
      invalidatePerfis()
      return p
    },
    [invalidatePerfis],
  )

  const updatePerfil = useCallback(
    async (id: string, patch: Partial<PerfilInput>) => {
      const p = await repository.atualizarPerfil(id, patch)
      invalidatePerfis()
      return p
    },
    [invalidatePerfis],
  )

  const removePerfil = useCallback(
    async (id: string) => {
      await repository.excluirPerfil(id)
      invalidatePerfis()
      void qc.invalidateQueries({ queryKey: ['lancamentos', userId] })
    },
    [invalidatePerfis, qc, userId],
  )

  const bulkPutPerfis = useCallback(
    async (perfis: Perfil[]) => {
      await repository.bulkInserirPerfis(perfis)
      invalidatePerfis()
    },
    [invalidatePerfis],
  )

  return useMemo(
    () => ({
      perfis: perfisQuery.data ?? [],
      counts: aggQuery.data?.counts ?? {},
      saldos: aggQuery.data?.saldos ?? {},
      loading: perfisQuery.isLoading,
      createPerfil,
      updatePerfil,
      removePerfil,
      bulkPutPerfis,
    }),
    [
      perfisQuery.data,
      perfisQuery.isLoading,
      aggQuery.data,
      createPerfil,
      updatePerfil,
      removePerfil,
      bulkPutPerfis,
    ],
  )
}
