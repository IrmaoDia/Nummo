import { format } from 'date-fns'
import { Braces, Check, FileSpreadsheet, FileText } from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { useLancamentos } from '../../hooks/useLancamentos'
import { cn } from '../../lib/cn'
import { toDate } from '../../lib/format'
import {
  EXPORT_PERIODOS,
  exportCSV,
  exportJSON,
  downloadBlob,
  filtrarPorPeriodo,
  intervaloDoPeriodo,
  slugify,
  sufixoPeriodo,
  type ExportPeriodo,
} from '../../lib/io'
import { repository } from '../../lib/repository'
import { PROFILE_COLORS } from '../../types/perfil'
import { ProfileAvatar } from '../profile/ProfileAvatar'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

type Formato = 'csv' | 'pdf' | 'json'

const FORMATOS: {
  value: Formato
  label: string
  descricao: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { value: 'csv', label: 'CSV', descricao: 'Planilha, para Excel ou outro app', icon: FileSpreadsheet },
  { value: 'pdf', label: 'PDF', descricao: 'Relatório pronto para imprimir', icon: FileText },
  { value: 'json', label: 'JSON', descricao: 'Backup completo, para reimportar', icon: Braces },
]

const dm = (iso: string) => format(toDate(iso), 'dd/MM/yyyy')

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { perfis, active } = useProfile()
  const { all } = useLancamentos()
  const { showToast } = useToast()

  const [periodo, setPeriodo] = useState<ExportPeriodo>('mes')
  const [formato, setFormato] = useState<Formato>('csv')
  const [gerando, setGerando] = useState(false)

  // Cada abertura começa do padrão (mês atual + CSV).
  useEffect(() => {
    if (open) {
      setPeriodo('mes')
      setFormato('csv')
      setGerando(false)
    }
  }, [open])

  const perfilNome = active?.nome ?? 'Todos os perfis'
  const selecionados = useMemo(() => filtrarPorPeriodo(all, periodo), [all, periodo])

  /** "01/07/2026 a 31/07/2026" — em "Tudo", o intervalo real dos lançamentos. */
  const rotuloIntervalo = useMemo(() => {
    const { inicio, fim } = intervaloDoPeriodo(periodo)
    if (inicio && fim) return `${dm(inicio)} a ${dm(fim)}`
    if (!selecionados.length) return 'Todo o período'
    return `${dm(selecionados[0].data)} a ${dm(selecionados[selecionados.length - 1].data)}`
  }, [periodo, selecionados])

  const exportar = async () => {
    setGerando(true)
    try {
      const arquivo = `${slugify(perfilNome)}-${sufixoPeriodo(periodo)}`
      if (formato === 'json') {
        // Backup completo: todos os perfis e todo o histórico, sem recorte.
        const items = await repository.listarLancamentos()
        exportJSON(perfis, items)
      } else if (formato === 'csv') {
        exportCSV(selecionados, `nummo-${arquivo}.csv`)
      } else {
        // jspdf só entra no bundle quando o usuário escolhe PDF.
        const { gerarExtratoPDF } = await import('../../lib/pdf')
        const blob = gerarExtratoPDF(selecionados, perfilNome, rotuloIntervalo)
        downloadBlob(`nummo-extrato-${arquivo}.pdf`, blob)
      }
      onClose()
      showToast({ message: 'Extrato exportado' })
    } catch {
      showToast({ message: 'Não foi possível exportar. Tente novamente.' })
    } finally {
      setGerando(false)
    }
  }

  const backupCompleto = formato === 'json'

  return (
    <Modal open={open} onClose={gerando ? () => {} : onClose} maxWidth={640}>
      <div className="overflow-x-clip">
        <div className="border-b border-hairline p-6">
          <h2 className="text-section font-semibold text-ink">Exportar extrato bancário</h2>
          <p className="mt-1 text-legend text-subtle">Exporta os lançamentos do perfil ativo.</p>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {/* Perfil de origem */}
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <span className="text-legend text-subtle">Exportando o perfil:</span>
            <span className="flex items-center gap-1.5">
              {active && (
                <ProfileAvatar
                  emoji={active.emoji}
                  color={PROFILE_COLORS[active.cor]}
                  size={20}
                />
              )}
              <span className="text-legend font-semibold text-ink">{perfilNome}</span>
            </span>
          </div>

          {/* Período */}
          <div className={cn('flex flex-col gap-2', backupCompleto && 'opacity-50')}>
            <span className="text-legend font-medium text-ink">Período</span>
            <div className="flex flex-wrap gap-2">
              {EXPORT_PERIODOS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  disabled={backupCompleto}
                  onClick={() => setPeriodo(p.value)}
                  className={cn(
                    'h-9 rounded-xl border px-3 text-legend font-medium transition-colors',
                    periodo === p.value
                      ? 'border-acento bg-acento/10 text-acento'
                      : 'border-hairline bg-surface-2 text-ink hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formato */}
          <div className="flex flex-col gap-2">
            <span className="text-legend font-medium text-ink">Formato</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FORMATOS.map((f) => {
                const ativo = formato === f.value
                const Icon = f.icon
                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFormato(f.value)}
                    className={cn(
                      'relative flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-colors',
                      ativo
                        ? 'border-acento bg-acento/[0.06]'
                        : 'border-hairline bg-surface-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
                    )}
                  >
                    {ativo && (
                      <Check className="absolute right-2.5 top-2.5 h-4 w-4 text-acento" />
                    )}
                    <Icon className={cn('h-5 w-5', ativo ? 'text-acento' : 'text-subtle')} />
                    <span className="text-body font-semibold text-ink">{f.label}</span>
                    <span className="text-micro leading-snug text-subtle">{f.descricao}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-legend text-subtle">
            {backupCompleto
              ? 'O backup JSON inclui todos os perfis e todo o histórico, sem recorte de período.'
              : `${selecionados.length === 1 ? '1 lançamento' : `${selecionados.length} lançamentos`} · ${rotuloIntervalo}`}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hairline p-6">
          <Button variant="ghost" onClick={onClose} disabled={gerando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void exportar()} disabled={gerando}>
            {gerando ? 'Exportando…' : 'Exportar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
