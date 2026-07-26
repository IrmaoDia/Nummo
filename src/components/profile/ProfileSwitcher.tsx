import { ChevronsUpDown, Layers } from 'lucide-react'
import { useState } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { cn } from '../../lib/cn'
import { Popover } from '../ui/Popover'
import { ManageProfilesModal } from './ManageProfilesModal'
import { ProfileAvatar } from './ProfileAvatar'
import { ProfilePopover } from './ProfilePopover'

interface ProfileSwitcherProps {
  collapsed?: boolean
  align?: 'left' | 'right'
  /** Versão de 40px, para o header do mobile — onde 48px não cabe. */
  compact?: boolean
}

export function ProfileSwitcher({ collapsed, align = 'left', compact }: ProfileSwitcherProps) {
  const { perfis, counts, activeId, active, isAll, activeColor, setActive } = useProfile()
  const [manage, setManage] = useState<{ open: boolean; create: boolean }>({
    open: false,
    create: false,
  })

  const nome = isAll ? 'Todos os perfis' : (active?.nome ?? 'Perfil')

  const avatar = isAll ? (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-subtle',
        compact ? 'h-6 w-6' : 'h-7 w-7',
      )}
      style={{ boxShadow: '0 0 0 2px var(--border)' }}
    >
      <Layers className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
    </span>
  ) : (
    <ProfileAvatar
      emoji={active?.emoji ?? '🏠'}
      color={activeColor}
      size={compact ? 24 : 28}
      ring
    />
  )

  return (
    <>
      <Popover
        className="w-full"
        align={align}
        panelClassName="w-[260px]"
        trigger={({ toggle, open }) => (
          <button
            type="button"
            onClick={toggle}
            data-profile-switcher
            aria-label="Trocar de perfil"
            className={cn(
              'flex items-center gap-2.5 rounded-xl border border-hairline bg-surface transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]',
              compact ? 'h-10' : 'h-12',
              collapsed
                ? cn('justify-center px-0', compact ? 'w-10' : 'w-12')
                : 'w-full px-2.5',
              open && 'ring-2 ring-acento/30',
            )}
          >
            {avatar}
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-left text-body font-semibold text-ink">
                  {nome}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-subtle" />
              </>
            )}
          </button>
        )}
      >
        {(close) => (
          <ProfilePopover
            perfis={perfis}
            counts={counts}
            activeId={activeId}
            onSelect={setActive}
            onNew={() => setManage({ open: true, create: true })}
            onManage={() => setManage({ open: true, create: false })}
            close={close}
          />
        )}
      </Popover>

      <ManageProfilesModal
        open={manage.open}
        initialCreate={manage.create}
        onClose={() => setManage((m) => ({ ...m, open: false }))}
      />
    </>
  )
}
