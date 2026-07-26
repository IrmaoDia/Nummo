import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { formatMonthLong } from '../../lib/format'
import type { Periodo, View } from '../../types'
import { ProfileSwitcher } from '../profile/ProfileSwitcher'
import { Button, IconButton } from '../ui/Button'
import { PeriodSelector } from './PeriodSelector'

// O nome da visão não aparece aqui: a sidebar já indica qual está ativa.

interface HeaderProps {
  view: View
  month: Date
  periodo: Periodo
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onPeriodChange: (p: Periodo) => void
  filtersSlot?: ReactNode
  activeChips?: ReactNode
  actionsSlot?: ReactNode
  showProfileAvatar?: boolean // mobile
}

export function Header({
  view,
  month,
  periodo,
  onPrev,
  onNext,
  onToday,
  onPeriodChange,
  filtersSlot,
  activeChips,
  actionsSlot,
  showProfileAvatar,
}: HeaderProps) {
  return (
    <header
      className="glass sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b border-hairline bg-white/72 py-2 dark:bg-black/60 sm:gap-3"
      // Respiro fixo de 16px + a safe area do aparelho (notch em paisagem).
      style={{
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
      }}
    >
      {showProfileAvatar && (
        <div className="shrink-0">
          <ProfileSwitcher collapsed compact align="left" />
        </div>
      )}

      {view === 'resumo' ? (
        <PeriodSelector value={periodo} onChange={onPeriodChange} />
      ) : (
        // -ml-2 sem o avatar: alinha o glifo do chevron (recuado dentro do
        // botão de 36px) com o padding do header, em vez do canto do botão.
        <div className={cn('flex min-w-0 items-center gap-1', !showProfileAvatar && '-ml-2')}>
          <IconButton label="Mês anterior" onClick={onPrev} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          {/* 13px no mobile: a 15px, "Novembro de 2026" não cabe junto com o
              avatar e as ações numa tela de 360px e quebra em duas linhas. */}
          <span className="min-w-[116px] whitespace-nowrap text-center text-legend font-medium text-ink first-letter:uppercase sm:min-w-[150px] sm:text-body">
            {formatMonthLong(month)}
          </span>
          <IconButton label="Próximo mês" onClick={onNext} className="shrink-0">
            <ChevronRight className="h-5 w-5" />
          </IconButton>
          <Button size="sm" variant="secondary" onClick={onToday} className="ml-1 hidden sm:inline-flex">
            Hoje
          </Button>
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {activeChips}
        {filtersSlot}
        {actionsSlot}
      </div>
    </header>
  )
}
