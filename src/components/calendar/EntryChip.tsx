import { useProfile } from '../../contexts/ProfileContext'
import { formatCurrency } from '../../lib/format'
import { CATEGORIA_COLOR, TIPO_COLOR } from '../../lib/labels'
import { cn } from '../../lib/cn'
import type { Lancamento } from '../../types'

interface EntryChipProps {
  lancamento: Lancamento
  onClick: () => void
  onDragStart?: (e: React.DragEvent) => void
  compact?: boolean
}

/**
 * Chip fino de um lançamento. Somente o texto é colorido (verde=entrada,
 * vermelho=gasto); fundo bem sutil. No modo "Todos os perfis", a bolinha
 * assume a cor do perfil.
 */
export function EntryChip({ lancamento, onClick, onDragStart, compact }: EntryChipProps) {
  const { isAll, colorById } = useProfile()
  const cor = TIPO_COLOR[lancamento.tipo]
  const isEntrada = lancamento.tipo === 'entrada'
  const dotColor = isAll ? (colorById[lancamento.perfilId] ?? cor) : cor

  return (
    <button
      type="button"
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={onClick}
      title={lancamento.titulo}
      className={cn(
        'group/chip relative flex w-full items-center gap-1.5 overflow-hidden rounded-md py-[3px] pl-2.5 pr-1.5 text-left text-[12px] leading-tight transition-all duration-150 hover:brightness-[0.97] active:scale-[0.99]',
        isEntrada ? 'bg-green-500/[0.08]' : 'bg-red-500/[0.08]',
        compact && 'py-1',
      )}
    >
      {/* barrinha de categoria (2px) — só empresa/pessoa física */}
      {lancamento.categoria !== 'sem_categoria' && (
        <span
          aria-hidden
          className="absolute inset-y-[2px] left-0 w-[2px] rounded-full"
          style={{ backgroundColor: CATEGORIA_COLOR[lancamento.categoria] }}
        />
      )}
      {/* bolinha: cor do perfil (modo consolidado) ou cor do tipo */}
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span className="truncate font-medium" style={{ color: cor }}>
        {lancamento.titulo}
      </span>
      <span className="tabular ml-auto shrink-0 pl-1 font-medium" style={{ color: cor }}>
        {formatCurrency(lancamento.valor)}
      </span>
    </button>
  )
}
