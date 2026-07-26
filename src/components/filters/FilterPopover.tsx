import { Check, ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn'
import { CATEGORIA_COLOR, CATEGORIA_LABEL, CATEGORIA_ORDER } from '../../lib/labels'
import type { Categoria, Filtros, Tipo } from '../../types'
import { Popover } from '../ui/Popover'
import { SegmentedControl } from '../ui/SegmentedControl'

interface FilterPopoverProps {
  filtros: Filtros
  activeCount: number
  onChange: (patch: Partial<Filtros>) => void
  onToggleCategoria: (c: Categoria) => void
  onReset: () => void
}

export function FilterPopover({
  filtros,
  activeCount,
  onChange,
  onToggleCategoria,
  onReset,
}: FilterPopoverProps) {
  return (
    <Popover
      align="right"
      panelClassName="w-[300px]"
      // No mobile o botão vira só o ícone: com o rótulo, o header não cabe em
      // 360px e o próprio "Filtros" era o primeiro a ser cortado.
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-label="Filtros"
          onClick={toggle}
          className={cn(
            'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline bg-surface-2 text-legend font-medium text-ink transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
            'sm:h-8 sm:w-auto sm:justify-start sm:gap-1.5 sm:px-3',
            open && 'ring-2 ring-acento/40',
          )}
        >
          <SlidersHorizontal className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <span className="tabular absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[10px] font-semibold text-white sm:static">
              {activeCount}
            </span>
          )}
          <ChevronDown className="hidden h-3.5 w-3.5 text-subtle sm:block" />
        </button>
      )}
    >
      <div className="flex w-full flex-col gap-4 p-1">
        {/* Busca */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={filtros.busca}
            onChange={(e) => onChange({ busca: e.target.value })}
            placeholder="Buscar no título…"
            className="w-full rounded-xl border border-hairline bg-surface-2 py-2 pl-8 pr-3 text-body text-ink placeholder:text-subtle focus:border-acento/60 focus:outline-none focus:ring-4 focus:ring-acento/15"
          />
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <span className="text-micro font-medium uppercase text-subtle">Tipo</span>
          <SegmentedControl<Tipo | 'todos'>
            size="sm"
            value={filtros.tipo}
            onChange={(v) => onChange({ tipo: v })}
            className="w-full [&>button]:flex-1"
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'entrada', label: 'Entrada', activeColor: 'var(--green)' },
              { value: 'gasto', label: 'Gasto', activeColor: 'var(--red)' },
            ]}
          />
        </div>

        {/* Categorias — lista fixa (multi-seleção) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-micro font-medium uppercase text-subtle">Categorias</span>
          <div className="flex flex-col gap-0.5">
            {CATEGORIA_ORDER.map((c) => {
              const active = filtros.categorias.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onToggleCategoria(c)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-body text-ink transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORIA_COLOR[c] }}
                    />
                    {CATEGORIA_LABEL[c]}
                  </span>
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors',
                      active ? 'border-acento bg-acento text-white' : 'border-hairline',
                    )}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end border-t border-hairline pt-3">
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="text-legend font-medium text-acento transition-opacity hover:brightness-110 disabled:opacity-40"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </Popover>
  )
}
