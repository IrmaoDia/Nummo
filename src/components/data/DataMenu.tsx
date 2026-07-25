import {
  Download,
  FileSpreadsheet,
  MoreHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { useLancamentos } from '../../hooks/useLancamentos'
import { usePerfis } from '../../hooks/usePerfis'
import { exportCSV, exportJSON, readFileAsJSON } from '../../lib/io'
import { repository } from '../../lib/repository'
import { parseImport, type ImportResult } from '../../lib/schema'
import { generateSampleData } from '../../lib/sampleData'
import { cn } from '../../lib/cn'
import { IconButton } from '../ui/Button'
import { Popover } from '../ui/Popover'
import { useToast } from '../ui/Toast'
import { ImportPreviewModal } from './ImportPreviewModal'

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

export function DataMenu() {
  const { perfis, active, isAll } = useProfile()
  const { all, importItems, clearActive } = useLancamentos()
  const { bulkPutPerfis } = usePerfis()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportResult | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)

  const nada = perfis.length === 0
  const perfilVazio = all.length === 0

  const doExportJSON = async () => {
    const items = await repository.listarLancamentos()
    exportJSON(perfis, items)
  }

  const doExportCSV = async () => {
    const items = await repository.listarLancamentos()
    const nomePorPerfil = Object.fromEntries(perfis.map((p) => [p.id, p.nome]))
    exportCSV(items, nomePorPerfil)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const raw = await readFileAsJSON(file)
      const fallback = active?.id ?? perfis[0]?.id ?? ''
      const result = parseImport(raw, perfis, fallback)
      if (result.lancamentos.length === 0 && result.novosPerfis.length === 0) {
        showToast({ message: 'Arquivo sem dados válidos' })
        return
      }
      setPreview(result)
    } catch {
      showToast({ message: 'Não foi possível ler o arquivo JSON' })
    }
  }

  const confirmImport = async () => {
    if (!preview) return
    if (preview.novosPerfis.length) await bulkPutPerfis(preview.novosPerfis)
    await importItems(preview.lancamentos)
    const n = preview.lancamentos.length
    setPreview(null)
    showToast({ message: `${n} lançamento(s) importado(s)` })
  }

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
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      <Popover
        align="right"
        panelClassName="w-56"
        trigger={({ toggle }) => (
          <IconButton label="Mais opções" onClick={toggle}>
            <MoreHorizontal className="h-5 w-5" />
          </IconButton>
        )}
      >
        {(close) => (
          <div className="flex flex-col gap-0.5" onMouseLeave={() => setConfirmingClear(false)}>
            <MenuItem
              icon={<Download className="h-4 w-4" />}
              label="Exportar JSON"
              disabled={nada}
              onClick={() => {
                void doExportJSON()
                close()
              }}
            />
            <MenuItem
              icon={<FileSpreadsheet className="h-4 w-4" />}
              label="Exportar CSV"
              disabled={nada}
              onClick={() => {
                void doExportCSV()
                close()
              }}
            />
            <MenuItem
              icon={<Upload className="h-4 w-4" />}
              label="Importar JSON"
              onClick={() => {
                close()
                fileRef.current?.click()
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

      <ImportPreviewModal
        open={preview !== null}
        lancamentos={preview?.lancamentos ?? []}
        novosPerfis={preview?.novosPerfis.length ?? 0}
        invalidos={preview?.invalidos ?? 0}
        onConfirm={confirmImport}
        onClose={() => setPreview(null)}
      />
    </>
  )
}
