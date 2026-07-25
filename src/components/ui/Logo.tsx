import { AnimatePresence, motion } from 'framer-motion'

interface LogoProps {
  showText?: boolean
  size?: number
}

/**
 * Marca do app: imagem `/img/logo.png` + a palavra "Nummo" como texto em serifa
 * de alto contraste (var(--font-brand)). O texto entra/sai com fade + width
 * animados para o ícone não "pular" ao recolher a barra lateral.
 */
export function Logo({ showText = false, size = 28 }: LogoProps) {
  const textSize = Math.round(size * 0.68)
  return (
    <span className="inline-flex items-center">
      <img
        src="/img/logo.png"
        alt="Nummo"
        width={size}
        height={size}
        style={{ borderRadius: 8, flexShrink: 0, display: 'block' }}
      />
      <AnimatePresence initial={false}>
        {showText && (
          <motion.span
            key="wordmark"
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: 'auto', marginLeft: 10 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-brand)',
              fontSize: textSize,
              fontWeight: 500,
              letterSpacing: '0.01em',
              lineHeight: 1,
              color: 'var(--text)',
            }}
          >
            Nummo
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
