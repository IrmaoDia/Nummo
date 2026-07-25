import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TooltipProps {
  label: string
  children: ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Tooltip escuro renderizado em portal (document.body) e posicionado com
 * Floating UI: `flip` + `shift` evitam corte perto das bordas. Fica acima da
 * camada de modais (z-100). O gatilho é um wrapper — funciona mesmo com o
 * elemento interno `aria-disabled` (não usar `disabled`, que mata o hover).
 */
export function Tooltip({ label, children, className, side = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: side,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { move: false, delay: { open: 80, close: 0 } })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role])

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className={cn('inline-flex', className)}
      >
        {children}
      </span>
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="pointer-events-none z-[100] max-w-[220px] rounded-md bg-[#1d1d1f]/95 px-2.5 py-1.5 text-[12px] font-medium leading-[1.35] text-white shadow-md animate-fade-in"
          >
            {label}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
