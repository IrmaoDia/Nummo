import { cn } from '../../lib/cn'
import type { Totais } from '../../lib/stats'
import { AnimatedCurrency } from '../ui/AnimatedNumber'

interface SummaryBarProps {
  totais: Totais
}

/** Barra fixa no rodapé com os totais do mês. Saldo troca de cor pelo sinal. */
export function SummaryBar({ totais }: SummaryBarProps) {
  const saldoColor = totais.saldo >= 0 ? 'var(--green)' : 'var(--red)'

  return (
    <div data-summary-bar className="glass sticky bottom-0 z-30 border-t border-hairline bg-white/72 dark:bg-black/60">
      <div className="mx-auto flex max-w-5xl items-stretch justify-between py-2.5">
        <div
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2"
          style={{ color: 'var(--green)' }}
        >
          <span className="text-micro font-medium uppercase text-subtle">Entradas</span>
          <AnimatedCurrency
            value={totais.entradas}
            className="tabular truncate text-body font-semibold sm:text-section"
          />
        </div>
        <div className="w-px self-center bg-hairline" style={{ height: 32 }} />
        <div
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2"
          style={{ color: 'var(--red)' }}
        >
          <span className="text-micro font-medium uppercase text-subtle">Gastos</span>
          <AnimatedCurrency
            value={totais.gastos}
            className="tabular truncate text-body font-semibold sm:text-section"
          />
        </div>
        <div className="w-px self-center bg-hairline" style={{ height: 32 }} />
        <div
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2"
          style={{ color: saldoColor }}
        >
          <span className="text-micro font-medium uppercase text-subtle">Saldo</span>
          <AnimatedCurrency
            value={totais.saldo}
            className={cn('tabular truncate text-body font-semibold sm:text-section')}
          />
        </div>
      </div>
    </div>
  )
}
