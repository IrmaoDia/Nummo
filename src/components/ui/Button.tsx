import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium select-none transition-all duration-200 ease-apple active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento/50'

const variants: Record<Variant, string> = {
  primary: 'bg-acento text-white hover:brightness-110 shadow-sm',
  secondary:
    'bg-surface-2 text-ink border border-hairline hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
  ghost: 'text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
  danger: 'bg-gasto text-white hover:brightness-110 shadow-sm',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-legend',
  md: 'h-10 px-4 text-body',
  lg: 'h-12 px-5 text-body',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

/** Botão quadrado só com ícone, com aria-label obrigatório. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink transition-all duration-200 ease-apple hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.94] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento/50',
          className,
        )}
        {...props}
      />
    )
  },
)
