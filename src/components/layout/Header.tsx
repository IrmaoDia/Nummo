import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatMonthLong } from '../../lib/format'
import type { Periodo, View } from '../../types'
import { ProfileSwitcher } from '../profile/ProfileSwitcher'
import { Button, IconButton } from '../ui/Button'
import { PeriodSelector } from './PeriodSelector'

const VIEW_TITLE: Record<View, string> = {
  dia: 'Por Dia',
  tipo: 'Por Tipo',
  resumo: 'Resumo',
}

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
    <header className="glass sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-hairline bg-white/72 px-4 py-2 dark:bg-black/60">
      {showProfileAvatar && (
        <div className="shrink-0">
          <ProfileSwitcher collapsed align="left" />
        </div>
      )}

      <h1 className="shrink-0 text-section font-semibold text-ink">{VIEW_TITLE[view]}</h1>

      {view === 'resumo' ? (
        <PeriodSelector value={periodo} onChange={onPeriodChange} />
      ) : (
        <div className="flex items-center gap-1">
          <IconButton label="Mês anterior" onClick={onPrev}>
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <span className="min-w-[132px] text-center text-body font-medium text-ink first-letter:uppercase sm:min-w-[150px]">
            {formatMonthLong(month)}
          </span>
          <IconButton label="Próximo mês" onClick={onNext}>
            <ChevronRight className="h-5 w-5" />
          </IconButton>
          <Button size="sm" variant="secondary" onClick={onToday} className="ml-1 hidden sm:inline-flex">
            Hoje
          </Button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {activeChips}
        {filtersSlot}
        {actionsSlot}
      </div>
    </header>
  )
}
