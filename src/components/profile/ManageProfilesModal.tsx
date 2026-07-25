import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { formatCurrency, pluralizar } from '../../lib/format'
import { PROFILE_COLORS, type Perfil, type PerfilInput } from '../../types/perfil'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Tooltip } from '../ui/Tooltip'
import { ProfileAvatar } from './ProfileAvatar'
import { ProfileForm } from './ProfileForm'

interface ManageProfilesModalProps {
  open: boolean
  initialCreate?: boolean
  /** Só o formulário "Novo perfil" — criar ou cancelar fecha o modal (fluxo de boas-vindas). */
  createOnly?: boolean
  onClose: () => void
  onCreated?: () => void
}

type Screen = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; perfil: Perfil }

export function ManageProfilesModal({
  open,
  initialCreate,
  createOnly,
  onClose,
  onCreated,
}: ManageProfilesModalProps) {
  const { perfis, counts, saldos, createPerfil, updatePerfil, removePerfil } = useProfile()
  const [screen, setScreen] = useState<Screen>({ mode: 'list' })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setScreen(initialCreate ? { mode: 'create' } : { mode: 'list' })
      setConfirmDelete(null)
    }
  }, [open, initialCreate])

  const handleCreate = async (input: PerfilInput) => {
    await createPerfil(input)
    if (createOnly) {
      onClose()
      onCreated?.()
    } else {
      setScreen({ mode: 'list' })
    }
  }
  const handleEdit = async (id: string, input: PerfilInput) => {
    await updatePerfil(id, input)
    setScreen({ mode: 'list' })
  }
  const handleDelete = async (id: string) => {
    await removePerfil(id)
    setConfirmDelete(null)
  }

  const title = createOnly
    ? 'Novo perfil'
    : screen.mode === 'create'
      ? 'Novo perfil'
      : screen.mode === 'edit'
        ? 'Editar perfil'
        : 'Gerenciar perfis'

  return (
    <Modal open={open} onClose={onClose} maxWidth={480}>
      <div className="overflow-x-clip">
        <div className="flex items-center justify-between gap-3 border-b border-hairline p-6">
          <h2 className="text-section font-semibold text-ink">{title}</h2>
          {!createOnly && screen.mode === 'list' && (
            <Button size="sm" variant="secondary" onClick={() => setScreen({ mode: 'create' })}>
              <Plus className="h-4 w-4" /> Novo
            </Button>
          )}
        </div>

        <div className="p-6">
          {createOnly && <ProfileForm onSubmit={handleCreate} onCancel={onClose} />}

          {!createOnly && screen.mode === 'create' && (
            <ProfileForm onSubmit={handleCreate} onCancel={() => setScreen({ mode: 'list' })} />
          )}

          {!createOnly && screen.mode === 'edit' && (
            <ProfileForm
              initial={screen.perfil}
              onSubmit={(input) => handleEdit(screen.perfil.id, input)}
              onCancel={() => setScreen({ mode: 'list' })}
            />
          )}

          {!createOnly && screen.mode === 'list' && (
            <div className="-mx-1 flex max-h-[60vh] flex-col gap-2 overflow-y-auto overscroll-contain px-1">
              {perfis.map((p) => {
                const count = counts[p.id] ?? 0
                const saldo = saldos[p.id] ?? 0
                const isLast = perfis.length === 1
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-2 p-3"
                  >
                    <ProfileAvatar emoji={p.emoji} color={PROFILE_COLORS[p.cor]} size={36} ring />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body font-semibold text-ink">{p.nome}</span>
                      <span className="text-legend text-subtle">
                        {pluralizar(count, 'lançamento', 'lançamentos')} ·{' '}
                        <span style={{ color: saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {formatCurrency(saldo)}
                        </span>
                      </span>
                    </div>

                    {confirmDelete === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="danger" onClick={() => void handleDelete(p.id)}>
                          Apagar{count > 0 ? ` ${pluralizar(count, 'lançamento', 'lançamentos')}` : ''}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Editar"
                          onClick={() => setScreen({ mode: 'edit', perfil: p })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-black/[0.05] hover:text-ink dark:hover:bg-white/[0.08]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {isLast ? (
                          <Tooltip label="Mantenha ao menos um perfil" side="top">
                            <button
                              type="button"
                              aria-disabled="true"
                              aria-label="Excluir"
                              onClick={(e) => e.preventDefault()}
                              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg text-subtle opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        ) : (
                          <button
                            type="button"
                            aria-label="Excluir"
                            onClick={() => setConfirmDelete(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gasto transition-colors hover:bg-gasto/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
