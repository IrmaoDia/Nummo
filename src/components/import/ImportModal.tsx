import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { useImportCsv } from '../../hooks/useImportCsv'
import { pluralizar } from '../../lib/format'
import { PROFILE_COLORS } from '../../types/perfil'
import { ProfileAvatar } from '../profile/ProfileAvatar'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { ImportDropzone } from './ImportDropzone'
import { ImportPreviewTable } from './ImportPreviewTable'
import { ImportSummary } from './ImportSummary'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  /** Leva o calendário para o mês do lançamento mais recente importado. */
  onImported?: (ultimaData: string) => void
}

export function ImportModal({ open, onClose, onImported }: ImportModalProps) {
  const imp = useImportCsv()
  const { showToast } = useToast()

  // Cada abertura começa do zero.
  useEffect(() => {
    if (open) imp.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const gravando = imp.etapa === 'gravando'

  const confirmar = async () => {
    const r = await imp.importar()
    if (!r) return
    const qtd = r.ids.length
    onClose()
    if (r.ultimaData) onImported?.(r.ultimaData)
    showToast({
      message: `${pluralizar(qtd, 'lançamento importado', 'lançamentos importados')}`,
      actionLabel: 'Desfazer',
      onAction: () => void imp.desfazer(r.ids),
      duration: 8000,
    })
  }

  return (
    <Modal open={open} onClose={gravando ? () => {} : onClose} maxWidth={640}>
      <div className="overflow-x-clip">
        <div className="border-b border-hairline p-6">
          <h2 className="text-section font-semibold text-ink">Importar extrato (CSV)</h2>
          <p className="mt-1 text-legend text-subtle">
            Extrato do Banco Inter. Nada é salvo antes de você conferir.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {/* Perfil de destino */}
          {imp.podeImportar ? (
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
              <span className="text-legend text-subtle">Os lançamentos entrarão no perfil:</span>
              {imp.perfilAtivo && (
                <span className="flex items-center gap-1.5">
                  <ProfileAvatar
                    emoji={imp.perfilAtivo.emoji}
                    color={PROFILE_COLORS[imp.perfilAtivo.cor]}
                    size={20}
                  />
                  <span className="text-legend font-semibold text-ink">
                    {imp.perfilAtivo.nome}
                  </span>
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: 'var(--orange)' }}
              />
              <span className="text-legend" style={{ color: 'var(--orange)' }}>
                Selecione um perfil específico antes de importar.
              </span>
            </div>
          )}

          {imp.erro && <p className="text-legend text-gasto">{imp.erro}</p>}

          {imp.etapa === 'arquivo' ? (
            <ImportDropzone
              disabled={!imp.podeImportar}
              onFile={(f) => void imp.carregarArquivo(f)}
            />
          ) : (
            <>
              <ImportSummary
                total={imp.linhas.length}
                entradas={imp.totais.entradas}
                gastos={imp.totais.gastos}
                inicio={imp.intervalo?.inicio ?? ''}
                fim={imp.intervalo?.fim ?? ''}
                duplicadas={imp.duplicadas}
                ignoradas={imp.ignoradas}
              />
              <ImportPreviewTable
                linhas={imp.linhas}
                travada={gravando}
                onToggle={imp.alternarLinha}
                onMarcarTodas={imp.marcarTodas}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline p-6">
          <span className="truncate text-legend text-subtle">{imp.nomeArquivo}</span>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={gravando}>
              Cancelar
            </Button>
            {imp.etapa !== 'arquivo' && (
              <Button
                variant="primary"
                onClick={() => void confirmar()}
                disabled={gravando || imp.selecionadas.length === 0}
              >
                {gravando
                  ? 'Importando…'
                  : `Importar ${pluralizar(imp.selecionadas.length, 'lançamento', 'lançamentos')}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
