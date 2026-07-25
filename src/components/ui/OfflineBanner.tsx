import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

/** Banner discreto no topo quando a conexão cai. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null
  return (
    <div className="flex items-center justify-center gap-2 bg-gasto/10 py-1.5 text-legend font-medium text-gasto">
      <WifiOff className="h-3.5 w-3.5" />
      Sem conexão. As alterações não estão sendo salvas.
    </div>
  )
}
