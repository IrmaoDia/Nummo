import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ChartCardProps {
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, right, children, className }: ChartCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-apple',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-body font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-legend text-subtle">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  )
}
