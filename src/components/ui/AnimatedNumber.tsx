import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { formatCurrency } from '../../lib/format'

interface AnimatedCurrencyProps {
  value: number
  className?: string
}

/** Valor em BRL que anima suavemente entre transições (ex.: troca de mês). */
export function AnimatedCurrency({ value, className }: AnimatedCurrencyProps) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => formatCurrency(v))

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.5,
      ease: [0.32, 0.72, 0, 1],
    })
    return () => controls.stop()
  }, [value, mv])

  return <motion.span className={className}>{text}</motion.span>
}
