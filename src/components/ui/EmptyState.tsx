import { CalendarClock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondary?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondary,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-hairline bg-surface/50 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-subtle">
        {icon ?? <CalendarClock className="h-8 w-8" strokeWidth={1.5} />}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-section font-semibold text-ink">{title}</h3>
        {description && <p className="max-w-xs text-body text-subtle">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondary}
      </div>
    </div>
  )
}
