import { useQueryClient } from '@tanstack/react-query'
import { CloudUpload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../contexts/ProfileContext'
import {
  contarDexie,
  marcarMigracaoConcluida,
  migracaoConcluida,
  migrarParaSupabase,
} from '../../lib/migrateFromDexie'
import { repository } from '../../lib/repository'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

/**
 * Na primeira execução com sessão ativa, se houver dados no Dexie e nenhum
 * lançamento na nuvem, oferece enviar os dados locais para a conta.
 */
export function MigrateModal() {
  const { perfis, ready } = useProfile()
  const { user } = useAuth()
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [count, setCount] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const checked = useRef(false)

  useEffect(() => {
    if (!ready || checked.current) return
    checked.current = true
    void (async () => {
      if (migracaoConcluida()) return
      const local = await contarDexie()
      if (local === 0) {
        marcarMigracaoConcluida()
        return
      }
      // Só oferece migração se a nuvem ainda estiver vazia (evita duplicar).
      const nuvem = await repository.listarLancamentos()
      if (nuvem.length > 0) {
        marcarMigracaoConcluida()
        return
      }
      setCount(local)
    })()
  }, [ready])

  const enviar = async () => {
    setBusy(true)
    try {
      const n = await migrarParaSupabase(perfis)
      await qc.invalidateQueries({ queryKey: ['perfis', user?.id] })
      await qc.invalidateQueries({ queryKey: ['perfis-agg', user?.id] })
      await qc.invalidateQueries({ queryKey: ['lancamentos', user?.id] })
      setCount(null)
      showToast({ message: `${n} lançamento(s) enviados para a nuvem` })
    } catch {
      showToast({ message: 'Falha ao enviar. Nada foi perdido; tente de novo.' })
    } finally {
      setBusy(false)
    }
  }

  const ignorar = () => {
    marcarMigracaoConcluida()
    setCount(null)
  }

  return (
    <Modal open={count !== null} onClose={ignorar} maxWidth={420}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-acento/10 text-acento">
            <CloudUpload className="h-5 w-5" />
          </div>
          <h2 className="text-section font-semibold text-ink">Dados neste navegador</h2>
        </div>
        <p className="text-body text-subtle">
          Encontramos <span className="font-semibold text-ink">{count}</span> lançamento(s) salvos
          neste navegador. Deseja enviá-los para a sua conta na nuvem? O backup local é mantido por
          segurança.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={ignorar} disabled={busy}>
            Ignorar
          </Button>
          <Button variant="primary" onClick={enviar} disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
