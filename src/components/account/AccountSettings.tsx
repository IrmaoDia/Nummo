import { Check, Copy, Eye, EyeOff, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'
import type { Theme } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

// TODO: alterar e-mail (exige confirmação por link no e-mail novo e no antigo)
// TODO: excluir conta (apagar o usuário no Auth precisa de service_role, que
// não pode viver no navegador — depende de uma Edge Function)
// TODO: multi-moeda

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

const SENHA_MINIMA = 6

/** 0–5, somando comprimento e variedade de caracteres. */
function pontuarSenha(senha: string): number {
  if (!senha) return 0
  let p = 0
  if (senha.length >= SENHA_MINIMA) p++
  if (senha.length >= 10) p++
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) p++
  if (/\d/.test(senha)) p++
  if (/[^a-zA-Z0-9]/.test(senha)) p++
  return p
}

function forcaSenha(senha: string): { nivel: 0 | 1 | 2 | 3; label: string; cor: string } {
  const p = pontuarSenha(senha)
  if (!senha) return { nivel: 0, label: '', cor: 'var(--border)' }
  if (p <= 2) return { nivel: 1, label: 'Fraca', cor: 'var(--red)' }
  if (p <= 4) return { nivel: 2, label: 'Média', cor: 'var(--orange)' }
  return { nivel: 3, label: 'Forte', cor: 'var(--green)' }
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-hairline p-6">
      <h3 className="text-micro font-medium uppercase tracking-wide text-subtle">{titulo}</h3>
      {children}
    </section>
  )
}

/** Linha rótulo → valor, dentro de um cartão. */
function Linha({
  rotulo,
  children,
  acao,
}: {
  rotulo: string
  children: ReactNode
  acao?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
      <span className="shrink-0 text-legend text-subtle">{rotulo}</span>
      <span className="min-w-0 flex-1 truncate text-body text-ink">{children}</span>
      {acao}
    </div>
  )
}

/** Campo de senha com o olhinho para conferir o que foi digitado. */
function CampoSenha({
  id,
  label,
  value,
  onChange,
  erro,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  erro?: string
  autoComplete: string
}) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-micro font-medium uppercase text-subtle">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visivel ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="pr-11"
          // `cn` só concatena (sem tailwind-merge), então uma classe de borda
          // aqui empataria com a `border-hairline` do Input. Estilo inline vence.
          style={erro ? { borderColor: 'var(--red)' } : undefined}
        />
        <button
          type="button"
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          onClick={() => setVisivel((v) => !v)}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-black/[0.05] hover:text-ink dark:hover:bg-white/[0.08]"
        >
          {visivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {erro && <span className="text-legend text-gasto">{erro}</span>}
    </div>
  )
}

interface AccountSettingsProps {
  open: boolean
  onClose: () => void
  onSignOut: () => void
}

export function AccountSettings({ open, onClose, onSignOut }: AccountSettingsProps) {
  const { user, updatePassword } = useAuth()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()

  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erros, setErros] = useState<{ nova?: string; confirma?: string }>({})
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const email = user?.email ?? '—'

  // Cada abertura começa limpa: senha digitada nunca sobrevive ao fechamento.
  useEffect(() => {
    if (open) {
      setNova('')
      setConfirma('')
      setErros({})
      setSalvando(false)
      setCopiado(false)
    }
  }, [open])

  const copiarEmail = async () => {
    if (!user?.email) return
    try {
      await navigator.clipboard.writeText(user.email)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      showToast({ message: 'Não foi possível copiar o e-mail' })
    }
  }

  const salvarSenha = async () => {
    const novos: { nova?: string; confirma?: string } = {}
    if (nova.length < SENHA_MINIMA) {
      novos.nova = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres`
    }
    if (!confirma) novos.confirma = 'Confirme a nova senha'
    else if (nova !== confirma) novos.confirma = 'As senhas não são iguais'
    setErros(novos)
    if (Object.keys(novos).length) return

    setSalvando(true)
    const { error } = await updatePassword(nova)
    setSalvando(false)
    if (error) {
      showToast({ message: error })
      return
    }
    setNova('')
    setConfirma('')
    setErros({})
    showToast({ message: 'Senha alterada' })
  }

  const forca = forcaSenha(nova)

  return (
    <Modal open={open} onClose={salvando ? () => {} : onClose} maxWidth={560}>
      <div className="max-h-[85vh] overflow-y-auto overflow-x-clip">
        {/* Identidade */}
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-section font-semibold text-ink">Conta</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acento/10 text-acento">
              <UserRound className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-body font-semibold text-ink">{email}</p>
              <p className="text-legend text-subtle">Conectado</p>
            </div>
          </div>
        </div>

        <Secao titulo="Conta">
          <Linha
            rotulo="E-mail"
            acao={
              <button
                type="button"
                onClick={() => void copiarEmail()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-legend font-medium text-subtle transition-colors hover:bg-black/[0.05] hover:text-ink dark:hover:bg-white/[0.08]"
              >
                {copiado ? (
                  <>
                    <Check className="h-3.5 w-3.5" style={{ color: 'var(--green)' }} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </>
                )}
              </button>
            }
          >
            {email}
          </Linha>
          <Linha rotulo="Senha">
            <span className="tracking-[0.2em] text-subtle">••••••••</span>
          </Linha>
          <p className="text-legend text-subtle">
            A senha atual não pode ser exibida — ela é guardada embaralhada e não tem volta.
            Se esqueceu, crie uma nova abaixo.
          </p>
        </Secao>

        <Secao titulo="Alterar senha">
          <CampoSenha
            id="nova-senha"
            label="Nova senha"
            value={nova}
            autoComplete="new-password"
            erro={erros.nova}
            onChange={(v) => {
              setNova(v)
              if (erros.nova) setErros((e) => ({ ...e, nova: undefined }))
            }}
          />

          {/* Força: três barrinhas que acendem conforme a senha melhora. */}
          {nova && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i <= forca.nivel ? forca.cor : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <span className="text-legend font-medium" style={{ color: forca.cor }}>
                {forca.label}
              </span>
            </div>
          )}

          <CampoSenha
            id="confirma-senha"
            label="Confirmar nova senha"
            value={confirma}
            autoComplete="new-password"
            erro={erros.confirma}
            onChange={(v) => {
              setConfirma(v)
              if (erros.confirma) setErros((e) => ({ ...e, confirma: undefined }))
            }}
          />

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => void salvarSenha()}
              disabled={salvando || !nova || !confirma}
            >
              {salvando ? 'Salvando…' : 'Salvar nova senha'}
            </Button>
          </div>
        </Secao>

        <Secao titulo="Preferências">
          <div className="flex flex-col gap-1.5">
            <span className="text-legend text-subtle">Tema</span>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border text-legend font-medium transition-colors',
                    theme === value
                      ? 'border-acento bg-acento/10 text-acento'
                      : 'border-hairline bg-surface-2 text-ink hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Linha rotulo="Moeda">Real (R$)</Linha>
        </Secao>

        <div className="flex items-center justify-between gap-3 border-t border-hairline p-6">
          <span className="hidden text-legend text-subtle sm:block">
            Seus dados ficam salvos na nuvem.
          </span>
          <Button variant="secondary" onClick={onSignOut} disabled={salvando}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </Modal>
  )
}
