import { Check, Layers, Plus, Settings2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ALL_PROFILES, PROFILE_COLORS, type ActiveProfileId, type Perfil } from '../../types/perfil'
import { ProfileAvatar } from './ProfileAvatar'

interface ProfilePopoverProps {
  perfis: Perfil[]
  counts: Record<string, number>
  activeId: ActiveProfileId
  onSelect: (id: ActiveProfileId) => void
  onNew: () => void
  onManage: () => void
  close: () => void
}

export function ProfilePopover({
  perfis,
  counts,
  activeId,
  onSelect,
  onNew,
  onManage,
  close,
}: ProfilePopoverProps) {
  const select = (id: ActiveProfileId) => {
    onSelect(id)
    close()
  }

  return (
    <div className="flex w-full flex-col gap-0.5">
      <div className="px-2 py-1 text-micro font-medium uppercase text-subtle">Perfis</div>

      <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {perfis.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => select(p.id)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            <ProfileAvatar emoji={p.emoji} color={PROFILE_COLORS[p.cor]} size={26} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body font-medium text-ink">{p.nome}</span>
              <span className="text-[11px] text-subtle">{counts[p.id] ?? 0} lançamento(s)</span>
            </div>
            {activeId === p.id && <Check className="h-4 w-4 text-acento" />}
          </button>
        ))}

        {/* Todos os perfis (consolidado) */}
        <button
          type="button"
          onClick={() => select(ALL_PROFILES)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-subtle">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 truncate text-body font-medium text-ink">Todos os perfis</span>
          {activeId === ALL_PROFILES && <Check className="h-4 w-4 text-acento" />}
        </button>
      </div>

      <div className="my-1 h-px bg-hairline" />

      <MenuRow icon={<Plus className="h-4 w-4" />} label="Novo perfil" onClick={() => { close(); onNew() }} />
      <MenuRow icon={<Settings2 className="h-4 w-4" />} label="Gerenciar perfis" onClick={() => { close(); onManage() }} />
    </div>
  )
}

function MenuRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-body text-ink transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
