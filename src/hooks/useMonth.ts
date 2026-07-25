import { addMonths, startOfMonth } from 'date-fns'
import { useCallback, useState } from 'react'

/** Estado do mês exibido + navegação. `direction` indica o sentido da última troca (para animar). */
export function useMonth(initial?: Date) {
  const [month, setMonth] = useState<Date>(() => startOfMonth(initial ?? new Date()))
  const [direction, setDirection] = useState<1 | -1>(1)

  const next = useCallback(() => {
    setDirection(1)
    setMonth((m) => addMonths(m, 1))
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setMonth((m) => addMonths(m, -1))
  }, [])

  const goToday = useCallback(() => {
    setMonth((cur) => {
      const t = startOfMonth(new Date())
      setDirection(t.getTime() >= cur.getTime() ? 1 : -1)
      return t
    })
  }, [])

  const goToMonth = useCallback((target: Date) => {
    setMonth((cur) => {
      const t = startOfMonth(target)
      setDirection(t.getTime() >= cur.getTime() ? 1 : -1)
      return t
    })
  }, [])

  return { month, direction, next, prev, goToday, goToMonth }
}
