import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Modal } from '../ui/Modal'

interface WelcomeModalProps {
  open: boolean
  onCreateProfile: () => void
  onDismiss: () => void
}

/** Tela de boas-vindas exibida uma única vez após o cadastro. */
export function WelcomeModal({ open, onCreateProfile, onDismiss }: WelcomeModalProps) {
  const primaryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => primaryRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

  return (
    <Modal open={open} onClose={onDismiss} maxWidth={420}>
      <div className="flex flex-col items-center p-8 text-center">
        <motion.img
          src="/img/welcome.png"
          alt=""
          aria-hidden="true"
          width={96}
          height={96}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ width: 96, height: 96, marginBottom: 24 }}
        />

        <h2 className="text-[24px] font-semibold leading-tight text-ink">Tudo pronto!</h2>

        <p className="mt-2 max-w-[15rem] text-body text-subtle">
          Um app simples e intuitivo para organizar suas finanças.
        </p>

        <div className="mt-4 flex w-full flex-col items-center gap-2">
          <button
            ref={primaryRef}
            type="button"
            onClick={onCreateProfile}
            className="h-11 w-full rounded-xl bg-acento text-[15px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento/50"
          >
            Criar perfil
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="py-1 text-[15px] font-medium text-subtle transition-colors hover:text-ink"
          >
            Agora não
          </button>
        </div>
      </div>
    </Modal>
  )
}
