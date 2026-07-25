import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Tooltip } from '../ui/Tooltip'

interface SidebarNavItemProps {
  icon: LucideIcon
  label: string
  active: boolean
  collapsed: boolean
  activeColor: string
  onClick: () => void
}

export function SidebarNavItem({
  icon: Icon,
  label,
  active,
  collapsed,
  activeColor,
  onClick,
}: SidebarNavItemProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex h-9 items-center rounded-lg text-[14px] font-medium transition-colors',
        collapsed ? 'w-9 justify-center px-0' : 'w-full gap-2.5 px-2.5',
        active ? 'text-ink' : 'text-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
      )}
    >
      {active && (
        <>
          <motion.span
            layoutId="sidebar-active-bg"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute inset-0 -z-10 rounded-lg bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          />
          <motion.span
            layoutId="sidebar-active-bar"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full"
            style={{ backgroundColor: activeColor }}
          />
        </>
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )

  return collapsed ? (
    <Tooltip label={label} side="right">
      {button}
    </Tooltip>
  ) : (
    button
  )
}
