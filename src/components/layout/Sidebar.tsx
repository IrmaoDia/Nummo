import {
  CalendarDays,
  ChartPie,
  Columns3,
  FileUp,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Sun,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../contexts/ProfileContext'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'
import type { Theme, View } from '../../types'
import { ManageProfilesModal } from '../profile/ManageProfilesModal'
import { ProfileSwitcher } from '../profile/ProfileSwitcher'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { Modal } from '../ui/Modal'
import { Popover } from '../ui/Popover'
import { Tooltip } from '../ui/Tooltip'
import { SidebarNavItem } from './SidebarNavItem'

const NAV: { view: View; label: string; icon: typeof CalendarDays }[] = [
  { view: 'dia', label: 'Por Dia', icon: CalendarDays },
  { view: 'tipo', label: 'Por Tipo', icon: Columns3 },
  { view: 'resumo', label: 'Resumo', icon: ChartPie },
]

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

interface SidebarProps {
  view: View
  onViewChange: (v: View) => void
  collapsed: boolean
  onToggleCollapse: () => void
  onImportCsv?: () => void
}

function FooterRow({
  icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  collapsed: boolean
  onClick?: () => void
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 items-center rounded-lg text-[14px] font-medium text-subtle transition-colors hover:bg-black/[0.04] hover:text-ink dark:hover:bg-white/[0.06]',
        collapsed ? 'w-9 justify-center px-0' : 'w-full gap-2.5 px-2.5',
      )}
    >
      {icon}
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

function ThemeRow({ collapsed }: { collapsed: boolean }) {
  const { theme, resolved, setTheme } = useTheme()
  const Icon = resolved === 'dark' ? Moon : Sun
  return (
    <Popover
      className={collapsed ? '' : 'w-full'}
      align="left"
      panelClassName="w-40"
      trigger={({ toggle }) => {
        const btn = (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-9 items-center rounded-lg text-[14px] font-medium text-subtle transition-colors hover:bg-black/[0.04] hover:text-ink dark:hover:bg-white/[0.06]',
              collapsed ? 'w-9 justify-center px-0' : 'w-full gap-2.5 px-2.5',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Tema</span>}
          </button>
        )
        return collapsed ? (
          <Tooltip label="Tema" side="right">
            {btn}
          </Tooltip>
        ) : (
          btn
        )
      }}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          {THEME_OPTIONS.map(({ value, label, icon: OptIcon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value)
                close()
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-body transition-colors',
                theme === value
                  ? 'bg-acento/10 font-medium text-acento'
                  : 'text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
              )}
            >
              <OptIcon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const label = collapsed ? 'Abrir barra lateral' : 'Fechar barra lateral'
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose
  return (
    <Tooltip label={label} side={collapsed ? 'right' : 'bottom'}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-black/[0.05] hover:text-ink dark:hover:bg-white/[0.07]"
      >
        <Icon className="h-[18px] w-[18px]" />
      </button>
    </Tooltip>
  )
}

export function Sidebar({
  view,
  onViewChange,
  collapsed,
  onToggleCollapse,
  onImportCsv,
}: SidebarProps) {
  const { activeColor } = useProfile()
  const { signOut } = useAuth()
  const [manageOpen, setManageOpen] = useState(false)
  const [confirmSair, setConfirmSair] = useState(false)

  return (
    <aside
      style={{ width: collapsed ? 68 : 264 }}
      className="flex h-full shrink-0 flex-col border-r border-hairline bg-surface-2 transition-[width] duration-200 ease-apple"
    >
      {/* Topo: logo + botão de recolher + seletor de perfil */}
      <div className="flex flex-col gap-3 p-3">
        {collapsed ? (
          <div className="flex h-7 items-center justify-center">
            <CollapseButton collapsed onClick={onToggleCollapse} />
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <Logo showText size={28} />
            <CollapseButton collapsed={false} onClick={onToggleCollapse} />
          </div>
        )}
        <ProfileSwitcher collapsed={collapsed} />
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-0.5 px-3">
        {!collapsed && (
          <div className="px-2 pb-1 pt-2 text-micro font-medium uppercase tracking-wide text-subtle">
            Visualizações
          </div>
        )}
        {NAV.map((item) => (
          <SidebarNavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            active={view === item.view}
            collapsed={collapsed}
            activeColor={activeColor}
            onClick={() => onViewChange(item.view)}
          />
        ))}
      </nav>

      <div className="flex-1" />

      {/* Rodapé */}
      <div className="flex flex-col gap-0.5 border-t border-hairline p-3">
        <ThemeRow collapsed={collapsed} />
        <FooterRow
          icon={<FileUp className="h-[18px] w-[18px] shrink-0" />}
          label="Importar extrato"
          collapsed={collapsed}
          onClick={() => onImportCsv?.()}
        />
        <FooterRow
          icon={<Settings2 className="h-[18px] w-[18px] shrink-0" />}
          label="Configurações"
          collapsed={collapsed}
          onClick={() => setManageOpen(true)}
        />
        <FooterRow
          icon={<LogOut className="h-[18px] w-[18px] shrink-0" />}
          label="Sair"
          collapsed={collapsed}
          onClick={() => setConfirmSair(true)}
        />
      </div>

      <ManageProfilesModal open={manageOpen} onClose={() => setManageOpen(false)} />

      <Modal open={confirmSair} onClose={() => setConfirmSair(false)} maxWidth={380}>
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-section font-semibold text-ink">Sair da conta?</h2>
          <p className="text-body text-subtle">
            Seus dados ficam salvos na nuvem. Você precisará entrar novamente para acessá-los.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmSair(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  )
}
