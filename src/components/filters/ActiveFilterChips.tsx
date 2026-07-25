import { X } from 'lucide-react'
import { CATEGORIA_LABEL, TIPO_LABEL } from '../../lib/labels'
import type { Categoria, Filtros } from '../../types'

interface ActiveFilterChipsProps {
  filtros: Filtros
  onChange: (patch: Partial<Filtros>) => void
  onToggleCategoria: (c: Categoria) => void
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 text-legend font-medium text-ink">
      {label}
      <button
        type="button"
        aria-label={`Remover filtro ${label}`}
        onClick={onRemove}
        className="rounded-full p-0.5 text-subtle transition-colors hover:bg-black/[0.08] hover:text-ink dark:hover:bg-white/[0.12]"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

export function ActiveFilterChips({ filtros, onChange, onToggleCategoria }: ActiveFilterChipsProps) {
  return (
    <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
      {filtros.busca.trim() && (
        <Chip label={`"${filtros.busca.trim()}"`} onRemove={() => onChange({ busca: '' })} />
      )}
      {filtros.tipo !== 'todos' && (
        <Chip label={TIPO_LABEL[filtros.tipo]} onRemove={() => onChange({ tipo: 'todos' })} />
      )}
      {filtros.categorias.map((c) => (
        <Chip key={c} label={CATEGORIA_LABEL[c]} onRemove={() => onToggleCategoria(c)} />
      ))}
    </div>
  )
}
