import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePerfis } from '../hooks/usePerfis'
import {
  ALL_PROFILES,
  PROFILE_COLORS,
  type ActiveProfileId,
  type Perfil,
  type PerfilInput,
} from '../types/perfil'

const STORAGE_KEY = 'financas.perfilAtivo'

const PERFIL_PADRAO: PerfilInput = { nome: 'Pessoal', emoji: '🏠', cor: 'blue' }

interface ProfileContextValue {
  perfis: Perfil[]
  counts: Record<string, number>
  saldos: Record<string, number>
  colorById: Record<string, string> // perfilId → cor CSS
  activeId: ActiveProfileId
  active: Perfil | null // null quando no modo "Todos os perfis"
  isAll: boolean
  activeColor: string // cor CSS de acento do perfil ativo
  ready: boolean
  setActive: (id: ActiveProfileId) => void
  createPerfil: (input: PerfilInput) => Promise<Perfil>
  updatePerfil: (id: string, patch: Partial<PerfilInput>) => Promise<Perfil>
  removePerfil: (id: string) => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { perfis, counts, saldos, loading, createPerfil, updatePerfil, removePerfil } = usePerfis()
  const [activeId, setActiveIdState] = useState<ActiveProfileId>(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || '',
  )
  const ensuring = useRef(false)

  const setActive = useCallback((id: ActiveProfileId) => {
    setActiveIdState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  // Garante ao menos um perfil e um perfil ativo válido.
  useEffect(() => {
    if (loading) return
    if (perfis.length === 0) {
      if (ensuring.current) return
      ensuring.current = true
      void createPerfil(PERFIL_PADRAO).then((p) => setActive(p.id))
      return
    }
    if (activeId !== ALL_PROFILES && !perfis.some((p) => p.id === activeId)) {
      setActive(perfis[0].id)
    }
  }, [loading, perfis, activeId, createPerfil, setActive])

  const isAll = activeId === ALL_PROFILES
  const active = isAll ? null : (perfis.find((p) => p.id === activeId) ?? null)
  const activeColor = active ? PROFILE_COLORS[active.cor] : 'var(--blue)'
  const ready = !loading && (isAll || active !== null)
  const colorById = useMemo(
    () => Object.fromEntries(perfis.map((p) => [p.id, PROFILE_COLORS[p.cor]])),
    [perfis],
  )

  const handleCreate = useCallback(
    async (input: PerfilInput) => {
      const p = await createPerfil(input)
      setActive(p.id) // alterna automaticamente para o novo perfil
      return p
    },
    [createPerfil, setActive],
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      perfis,
      counts,
      saldos,
      colorById,
      activeId,
      active,
      isAll,
      activeColor,
      ready,
      setActive,
      createPerfil: handleCreate,
      updatePerfil,
      removePerfil,
    }),
    [perfis, counts, saldos, colorById, activeId, active, isAll, activeColor, ready, setActive, handleCreate, updatePerfil, removePerfil],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile deve ser usado dentro de <ProfileProvider>')
  return ctx
}
