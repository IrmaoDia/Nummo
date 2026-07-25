import { CATEGORIA_COLOR, CATEGORIA_LABEL } from '../../lib/labels'
import type { Categoria } from '../../types'

interface CategoryBadgeProps {
  categoria: Categoria
}

/** Badge da categoria: fundo na cor com 12% de opacidade, texto na cor cheia. */
export function CategoryBadge({ categoria }: CategoryBadgeProps) {
  const color = CATEGORIA_COLOR[categoria]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {CATEGORIA_LABEL[categoria]}
    </span>
  )
}
