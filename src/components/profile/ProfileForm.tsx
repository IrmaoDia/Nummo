import { useState } from 'react'
import { cn } from '../../lib/cn'
import {
  PROFILE_COLORS,
  PROFILE_COLOR_ORDER,
  PROFILE_EMOJIS,
  type Perfil,
  type PerfilInput,
  type ProfileColor,
} from '../../types/perfil'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Input'
import { ProfileAvatar } from './ProfileAvatar'

interface ProfileFormProps {
  initial?: Perfil
  onSubmit: (input: PerfilInput) => void
  onCancel: () => void
}

export function ProfileForm({ initial, onSubmit, onCancel }: ProfileFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? PROFILE_EMOJIS[0])
  const [cor, setCor] = useState<ProfileColor>(initial?.cor ?? 'blue')
  const [erro, setErro] = useState('')

  const submit = () => {
    const trimmed = nome.trim()
    if (!trimmed) {
      setErro('Informe um nome')
      return
    }
    onSubmit({ nome: trimmed.slice(0, 40), emoji, cor })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ProfileAvatar emoji={emoji} color={PROFILE_COLORS[cor]} size={44} ring />
        <div className="flex-1">
          <Field label="Nome" error={erro}>
            <Input
              autoFocus
              value={nome}
              maxLength={40}
              placeholder="Ex.: Minha Empresa"
              onChange={(e) => {
                setNome(e.target.value)
                if (erro) setErro('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
        </div>
      </div>

      {/* Emoji */}
      <div className="flex flex-col gap-1.5">
        <span className="text-micro font-medium uppercase text-subtle">Emoji</span>
        <div className="grid grid-cols-8 gap-1">
          {PROFILE_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-[18px] transition-colors',
                emoji === e
                  ? 'bg-acento/15 ring-2 ring-acento/50'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div className="flex flex-col gap-1.5">
        <span className="text-micro font-medium uppercase text-subtle">Cor</span>
        <div className="flex gap-2">
          {PROFILE_COLOR_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setCor(c)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: PROFILE_COLORS[c],
                boxShadow: cor === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${PROFILE_COLORS[c]}` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={submit}>
          {initial ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </div>
  )
}
