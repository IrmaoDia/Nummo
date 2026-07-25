import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { EntryModal } from '../components/entry/EntryModal'
import { useToast } from '../components/ui/Toast'
import { useProfile } from '../contexts/ProfileContext'
import { toISODate } from '../lib/format'
import type { LancamentoFormValues } from '../lib/schema'
import type { Lancamento, Tipo } from '../types'
import { useLancamentos } from './useLancamentos'

interface OpenNewOptions {
  data?: string
  tipo?: Tipo
}

interface EntryModalContextValue {
  openNew: (options?: OpenNewOptions) => void
  openEdit: (lancamento: Lancamento) => void
  isOpen: boolean
}

const EntryModalContext = createContext<EntryModalContextValue | null>(null)

type ModalState =
  | { mode: 'closed' }
  | { mode: 'new'; options: OpenNewOptions }
  | { mode: 'edit'; lancamento: Lancamento }

function toFormValues(state: ModalState): LancamentoFormValues {
  if (state.mode === 'edit') {
    const l = state.lancamento
    return {
      titulo: l.titulo,
      data: l.data,
      tipo: l.tipo,
      valor: l.valor,
      categoria: l.categoria,
      observacao: l.observacao ?? '',
    }
  }
  const opts = state.mode === 'new' ? state.options : {}
  return {
    titulo: '',
    data: opts.data ?? toISODate(new Date()),
    tipo: opts.tipo ?? 'gasto',
    valor: 0,
    categoria: 'sem_categoria',
    observacao: '',
  }
}

export function EntryModalProvider({ children }: { children: ReactNode }) {
  const { create, update, remove, restore } = useLancamentos()
  const { perfis, active, isAll, setActive } = useProfile()
  const { showToast } = useToast()
  const [state, setState] = useState<ModalState>({ mode: 'closed' })
  const [submitting, setSubmitting] = useState(false)

  const close = useCallback(() => setState({ mode: 'closed' }), [])

  const openNew = useCallback(
    (options: OpenNewOptions = {}) => {
      // No modo "Todos os perfis" não há perfil-alvo: troca para o primeiro
      // perfil antes de abrir o modal (senão o "adicionar" não faria nada).
      if (isAll) {
        const alvo = perfis[0]
        if (!alvo) return
        setActive(alvo.id)
      }
      setState({ mode: 'new', options })
    },
    [isAll, perfis, setActive],
  )

  const openEdit = useCallback((lancamento: Lancamento) => {
    setState({ mode: 'edit', lancamento })
  }, [])

  const handleSubmit = useCallback(
    async (values: LancamentoFormValues) => {
      setSubmitting(true)
      try {
        const payload = {
          ...values,
          observacao: values.observacao?.trim() || undefined,
        }
        if (state.mode === 'edit') {
          await update(state.lancamento.id, payload)
        } else {
          await create(payload)
        }
        close()
      } finally {
        setSubmitting(false)
      }
    },
    [state, update, create, close],
  )

  const handleDelete = useCallback(async () => {
    if (state.mode !== 'edit') return
    const snapshot = state.lancamento
    await remove(snapshot.id)
    close()
    showToast({
      message: 'Lançamento excluído',
      actionLabel: 'Desfazer',
      onAction: () => void restore(snapshot),
    })
  }, [state, remove, restore, close, showToast])

  const handleMove = useCallback(
    async (perfilId: string) => {
      if (state.mode !== 'edit') return
      await update(state.lancamento.id, { perfilId })
      const destino = perfis.find((p) => p.id === perfilId)
      close()
      showToast({ message: `Lançamento movido para ${destino?.nome ?? 'outro perfil'}` })
    },
    [state, update, perfis, close, showToast],
  )

  const isEditing = state.mode === 'edit'
  const outrosPerfis = useMemo(
    () => perfis.filter((p) => p.id !== active?.id),
    [perfis, active],
  )

  const ctx = useMemo(
    () => ({ openNew, openEdit, isOpen: state.mode !== 'closed' }),
    [openNew, openEdit, state.mode],
  )

  const formKey =
    state.mode === 'edit'
      ? `edit-${state.lancamento.id}-${state.lancamento.atualizadoEm}`
      : state.mode === 'new'
        ? `new-${state.options.data ?? 'hoje'}-${state.options.tipo ?? ''}-${Date.now()}`
        : 'closed'

  return (
    <EntryModalContext.Provider value={ctx}>
      {children}
      <EntryModal
        open={state.mode !== 'closed'}
        isEditing={isEditing}
        defaultValues={toFormValues(state)}
        submitting={submitting}
        formKey={formKey}
        outrosPerfis={outrosPerfis}
        onSubmit={handleSubmit}
        onClose={close}
        onDelete={isEditing ? handleDelete : undefined}
        onMove={isEditing ? handleMove : undefined}
      />
    </EntryModalContext.Provider>
  )
}

export function useEntryModal(): EntryModalContextValue {
  const ctx = useContext(EntryModalContext)
  if (!ctx) throw new Error('useEntryModal deve ser usado dentro de <EntryModalProvider>')
  return ctx
}
