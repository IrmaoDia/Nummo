import { FileDown, FileUp, MoreHorizontal, Sparkles, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { useLancamentos } from '../../hooks/useLancamentos'
import { generateSampleData } from '../../lib/sampleData'
import { cn } from '../../lib/cn'
import { IconButton } from '../ui/Button'
import { Popover } from '../ui/Popover'
import { useToast } from '../ui/Toast'
import { ExportModal } from './ExportModal'

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body transition-colors disabled:opacity-40',
        danger
          ? 'text-gasto hover:bg-gasto/10'
          : 'text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

interface DataMenuProps {
  onImportCsv?: () => void
}

export function DataMenu({ onImportCsv }: DataMenuProps = {}) {
  const { perfis, active, isAll } = useProfile()
  const { all, importItems, clearActive } = useLancamentos()
  const { showToast } = useToast()
  const [exportOpen, setExportOpen] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)

  const nada = perfis.length === 0
  const perfilVazio = all.length === 0

  const loadSample = async (close: () => void) => {
    if (!active) return
    await importItems(generateSampleData(active.id))
    close()
    showToast({ message: 'Dados de exemplo carregados' })
  }

  const doClear = async (close: () => void) => {
    const snapshot = all
    await clearActive()
    setConfirmingClear(false)
    close()
    showToast({
      message: `Lançamentos de ${active?.nome ?? 'perfil'} apagados`,
      actionLabel: 'Desfazer',
      onAction: () => void importItems(snapshot),
    })
  }

  return (
    <>
      <Popover
        align="right"
        // Largo o bastante para "Apagar lançamentos do perfil" caber em 1 linha.
        panelClassName="w-72"
        trigger={({ toggle }) => (
          <IconButton label="Mais opções" onClick={toggle}>
            <MoreHorizontal className="h-5 w-5" />
          </IconButton>
        )}
      >
        {(close) => (
          <div className="flex flex-col gap-0.5" onMouseLeave={() => setConfirmingClear(false)}>
            <MenuItem
              icon={<FileDown className="h-4 w-4" />}
              label="Exportar extrato bancário"
              disabled={nada}
              onClick={() => {
                close()
                setExportOpen(true)
              }}
            />
            <MenuItem
              icon={<FileUp className="h-4 w-4" />}
              label="Importar extrato"
              onClick={() => {
                close()
                onImportCsv?.()
              }}
            />
            {!isAll && (
              <>
                <div className="my-1 h-px bg-hairline" />
                <MenuItem
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Carregar dados de exemplo"
                  onClick={() => void loadSample(close)}
                />
                {confirmingClear ? (
                  <div className="flex flex-col gap-1 rounded-lg bg-gasto/10 p-2">
                    <span className="px-1 text-legend text-ink">Apagar deste perfil?</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void doClear(close)}
                        className="flex-1 rounded-md bg-gasto px-2 py-1.5 text-legend font-medium text-white"
                      >
                        Apagar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingClear(false)}
                        className="flex-1 rounded-md bg-surface-2 px-2 py-1.5 text-legend font-medium text-ink"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <MenuItem
                    icon={<Trash2 className="h-4 w-4" />}
                    label="Apagar lançamentos do perfil"
                    danger
                    disabled={perfilVazio}
                    onClick={() => setConfirmingClear(true)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Popover>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  )
}
