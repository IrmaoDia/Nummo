import { AlertTriangle, FileJson } from 'lucide-react'
import { formatCurrency, formatDateShort } from '../../lib/format'
import type { Lancamento } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ImportPreviewModalProps {
  open: boolean
  lancamentos: Lancamento[]
  novosPerfis: number
  invalidos: number
  onConfirm: () => void
  onClose: () => void
}

export function ImportPreviewModal({
  open,
  lancamentos,
  novosPerfis,
  invalidos,
  onConfirm,
  onClose,
}: ImportPreviewModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={440}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-acento/10 text-acento">
            <FileJson className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-section font-semibold text-ink">Importar dados</h2>
            <p className="text-legend text-subtle">
              {lancamentos.length} lançamento(s)
              {novosPerfis > 0 && ` · ${novosPerfis} novo(s) perfil(is)`}
              {invalidos > 0 && ` · ${invalidos} ignorado(s)`}
            </p>
          </div>
        </div>

        {invalidos > 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-orange-500/10 p-3 text-legend text-pessoa">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--orange)' }} />
            <span style={{ color: 'var(--orange)' }}>
              {invalidos} registro(s) foram ignorados por não corresponderem ao formato esperado.
            </span>
          </div>
        )}

        {lancamentos.length > 0 && (
          <div className="max-h-52 overflow-y-auto rounded-xl border border-hairline">
            {lancamentos.slice(0, 30).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-body text-ink">{l.titulo}</span>
                  <span className="tabular text-legend text-subtle">{formatDateShort(l.data)}</span>
                </div>
                <span
                  className="tabular shrink-0 text-body font-medium"
                  style={{ color: l.tipo === 'entrada' ? 'var(--green)' : 'var(--red)' }}
                >
                  {formatCurrency(l.valor)}
                </span>
              </div>
            ))}
            {lancamentos.length > 30 && (
              <div className="px-3 py-2 text-legend text-subtle">
                +{lancamentos.length - 30} mais…
              </div>
            )}
          </div>
        )}

        <p className="text-legend text-subtle">
          Itens com o mesmo id substituem os existentes; os demais são adicionados.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={lancamentos.length === 0 && novosPerfis === 0}
          >
            Importar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
