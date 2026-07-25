import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface AddButtonProps {
  visible: boolean
  onClick: () => void
}

/** Botão "+" que aparece no hover de uma célula, com tooltip "Adicionar item". */
export function AddButton({ visible, onClick }: AddButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5"
        >
          <button
            type="button"
            aria-label="Adicionar item"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="group/add pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-acento text-white shadow-apple transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="pointer-events-none rounded-md bg-[#1d1d1f] px-2 py-1 text-[12px] font-medium text-white shadow-md">
            Adicionar item
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
