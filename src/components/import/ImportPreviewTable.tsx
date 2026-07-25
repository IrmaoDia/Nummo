import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatCurrency, formatDateShort } from '../../lib/format'
import { TIPO_COLOR, TIPO_LABEL } from '../../lib/labels'
import type { LinhaPreview } from '../../lib/csv/types'

interface ImportPreviewTableProps {
  linhas: LinhaPreview[]
  travada?: boolean
  onToggle: (id: string) => void
  onMarcarTodas: (valor: boolean) => void
}

function Caixa({ marcada }: { marcada: boolean }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        marcada ? 'border-acento bg-acento text-white' : 'border-hairline',
      )}
    >
      {marcada && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  )
}

/** Tabela de conferência: o usuário desmarca o que não quer importar. */
export function ImportPreviewTable({
  linhas,
  travada,
  onToggle,
  onMarcarTodas,
}: ImportPreviewTableProps) {
  const todasMarcadas = linhas.length > 0 && linhas.every((l) => l.selecionada)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-hairline', travada && 'opacity-60')}>
      {/* Selecionar todos / nenhum */}
      <div className="flex items-center gap-3 border-b border-hairline bg-surface-2 px-3 py-2">
        <button
          type="button"
          disabled={travada}
          onClick={() => onMarcarTodas(!todasMarcadas)}
          className="flex items-center gap-2 text-legend font-medium text-ink"
        >
          <Caixa marcada={todasMarcadas} />
          {todasMarcadas ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
        <span className="ml-auto text-legend text-subtle">
          {linhas.filter((l) => l.selecionada).length} de {linhas.length}
        </span>
      </div>

      <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
        <ul className="flex flex-col">
          {linhas.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                disabled={travada}
                onClick={() => onToggle(l.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-hairline px-3 py-2 text-left transition-colors last:border-b-0',
                  l.duplicada
                    ? 'bg-amber-500/[0.08] hover:bg-amber-500/[0.12]'
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]',
                )}
              >
                <Caixa marcada={l.selecionada} />

                <span className="tabular w-12 shrink-0 text-legend text-subtle">
                  {formatDateShort(l.data)}
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-legend text-ink">{l.titulo}</span>
                  {l.duplicada && (
                    <span className="text-[11px] font-medium" style={{ color: 'var(--orange)' }}>
                      Já existe
                    </span>
                  )}
                </span>

                <span className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: TIPO_COLOR[l.tipo] }}
                  />
                  <span className="hidden text-legend text-subtle sm:inline">
                    {TIPO_LABEL[l.tipo]}
                  </span>
                </span>

                <span
                  className="tabular w-24 shrink-0 text-right text-legend font-semibold"
                  style={{ color: TIPO_COLOR[l.tipo] }}
                >
                  {formatCurrency(l.valor)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
