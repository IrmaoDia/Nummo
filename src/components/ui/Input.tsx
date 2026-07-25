import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const fieldBase =
  'w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-body text-ink placeholder:text-subtle transition-all duration-200 focus:border-acento/60 focus:outline-none focus:ring-4 focus:ring-acento/15'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, 'resize-y leading-relaxed', className)}
      {...props}
    />
  )
})

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
  className?: string
}

/** Wrapper de campo com rótulo (micro, uppercase) e mensagem de erro. */
export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-micro font-medium uppercase text-subtle">
        {label}
      </label>
      {children}
      {error && <span className="text-legend text-gasto">{error}</span>}
    </div>
  )
}
