import { AnimatePresence, motion } from 'framer-motion'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastData {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastContextValue {
  /** Exibe um toast; retorna o id. Dura `duration` ms (padrão 5000). */
  showToast: (opts: Omit<ToastData, 'id'> & { duration?: number }) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback((id: number) => {
    setToast((cur) => (cur && cur.id === id ? null : cur))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>((opts) => {
    if (timer.current) clearTimeout(timer.current)
    const id = Date.now()
    setToast({ id, message: opts.message, actionLabel: opts.actionLabel, onAction: opts.onAction })
    timer.current = setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), opts.duration ?? 5000)
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-[#1d1d1f] px-4 py-3 text-body text-white shadow-apple-lg dark:bg-[#2c2c2e]"
            >
              <span>{toast.message}</span>
              {toast.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.()
                    dismiss(toast.id)
                  }}
                  className="font-semibold text-acento transition-colors hover:brightness-125"
                >
                  {toast.actionLabel}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
