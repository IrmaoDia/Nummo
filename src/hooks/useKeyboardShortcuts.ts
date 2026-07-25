import { useEffect } from 'react'

interface Shortcuts {
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onNew: () => void
  /** desabilita os atalhos (ex.: enquanto um modal está aberto). */
  enabled: boolean
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  )
}

/** Atalhos globais: ← / → mudam o mês, T vai para hoje, N novo lançamento. */
export function useKeyboardShortcuts({
  onPrevMonth,
  onNextMonth,
  onToday,
  onNew,
  enabled,
}: Shortcuts) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onPrevMonth()
          break
        case 'ArrowRight':
          e.preventDefault()
          onNextMonth()
          break
        case 't':
        case 'T':
          onToday()
          break
        case 'n':
        case 'N':
          e.preventDefault()
          onNew()
          break
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enabled, onPrevMonth, onNextMonth, onToday, onNew])
}
