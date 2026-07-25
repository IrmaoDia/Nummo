import { formatCurrency, formatDateShort, pluralizar } from '../../lib/format'

interface ImportSummaryProps {
  total: number
  entradas: number
  gastos: number
  inicio: string
  fim: string
  duplicadas: number
  ignoradas: number
}

/** Cabeçalho da conferência: quantos, quanto e de que período. */
export function ImportSummary({
  total,
  entradas,
  gastos,
  inicio,
  fim,
  duplicadas,
  ignoradas,
}: ImportSummaryProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
          <span className="text-micro font-medium uppercase text-subtle">Encontrados</span>
          <span className="tabular text-body font-semibold text-ink">{total}</span>
        </div>
        <div className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
          <span className="text-micro font-medium uppercase text-subtle">Entradas</span>
          <span className="tabular text-body font-semibold" style={{ color: 'var(--green)' }}>
            {formatCurrency(entradas)}
          </span>
        </div>
        <div className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
          <span className="text-micro font-medium uppercase text-subtle">Gastos</span>
          <span className="tabular text-body font-semibold" style={{ color: 'var(--red)' }}>
            {formatCurrency(gastos)}
          </span>
        </div>
      </div>

      <p className="text-legend text-subtle">
        Período detectado:{' '}
        <span className="font-medium text-ink">
          {formatDateShort(inicio)} a {formatDateShort(fim)}
        </span>
      </p>

      {duplicadas > 0 && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-legend" style={{ color: 'var(--orange)' }}>
          {pluralizar(duplicadas, 'lançamento já existe', 'lançamentos já existem')} neste perfil e{' '}
          {duplicadas === 1 ? 'foi desmarcado' : 'foram desmarcados'}.
        </p>
      )}

      {ignoradas > 0 && (
        <p className="text-legend text-subtle">
          {pluralizar(ignoradas, 'linha ignorada', 'linhas ignoradas')} por não ter valor válido.
        </p>
      )}
    </div>
  )
}
