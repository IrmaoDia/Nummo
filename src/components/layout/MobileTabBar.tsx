import { CalendarDays, ChartPie, Columns3 } from 'lucide-react'
import { useProfile } from '../../contexts/ProfileContext'
import { cn } from '../../lib/cn'
import type { View } from '../../types'

const NAV: { view: View; label: string; icon: typeof CalendarDays }[] = [
  { view: 'dia', label: 'Por Dia', icon: CalendarDays },
  { view: 'tipo', label: 'Por Tipo', icon: Columns3 },
  { view: 'resumo', label: 'Resumo', icon: ChartPie },
]

interface MobileTabBarProps {
  view: View
  onViewChange: (v: View) => void
}

/** Tab bar inferior estilo iOS (translúcida). Usada abaixo de 768px. */
export function MobileTabBar({ view, onViewChange }: MobileTabBarProps) {
  const { activeColor } = useProfile()
  return (
    <nav className="glass z-30 flex shrink-0 items-stretch border-t border-hairline bg-white/72 dark:bg-black/60">
      {NAV.map(({ view: v, label, icon: Icon }) => {
        const active = view === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
              !active && 'text-subtle',
            )}
            style={{ color: active ? activeColor : undefined }}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
