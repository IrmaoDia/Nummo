import { Modal } from '../ui/Modal'
import { EntryForm } from './EntryForm'
import type { LancamentoFormValues } from '../../lib/schema'
import type { Perfil } from '../../types'

interface EntryModalProps {
  open: boolean
  isEditing: boolean
  defaultValues: LancamentoFormValues
  submitting?: boolean
  formKey: string
  outrosPerfis?: Perfil[]
  onSubmit: (values: LancamentoFormValues) => void
  onClose: () => void
  onDelete?: () => void
  onMove?: (perfilId: string) => void
}

export function EntryModal({
  open,
  isEditing,
  defaultValues,
  submitting,
  formKey,
  outrosPerfis,
  onSubmit,
  onClose,
  onDelete,
  onMove,
}: EntryModalProps) {
  const titleId = 'entry-modal-title'
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <div className="border-b border-hairline px-6 pb-3 pt-4">
        <h2 id={titleId} className="text-legend font-medium text-subtle">
          {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>
      </div>
      {/* key força reset do formulário ao trocar de alvo */}
      <EntryForm
        key={formKey}
        defaultValues={defaultValues}
        isEditing={isEditing}
        submitting={submitting}
        outrosPerfis={outrosPerfis}
        onSubmit={onSubmit}
        onCancel={onClose}
        onDelete={onDelete}
        onMove={onMove}
        titleId={titleId}
      />
    </Modal>
  )
}
