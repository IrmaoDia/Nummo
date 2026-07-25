import { cn } from '../../lib/cn'

/** Bloco cinza com shimmer suave (estilo Apple), para estados de carregamento. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-black/[0.05] dark:bg-white/[0.06]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent dark:before:via-white/10',
        className,
      )}
    />
  )
}

/** Esqueleto do conteúdo principal enquanto os lançamentos carregam. */
export function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-80" />
    </div>
  )
}
