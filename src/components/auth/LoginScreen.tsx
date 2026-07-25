import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Input'
import { Logo } from '../ui/Logo'

export function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = isLogin ? await signIn(email, password) : await signUp(email, password)
      if (res.error) setError(res.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-8 shadow-apple">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo showText size={40} />
          <p className="text-body text-subtle">
            {isLogin ? 'Entre para acessar suas finanças' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="E-mail">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-legend text-gasto">{error}</p>}

          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
            {submitting ? 'Aguarde…' : isLogin ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <div className="mt-5 text-center text-legend text-subtle">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login')
              setError('')
            }}
            className="font-semibold text-acento transition-colors hover:brightness-110"
          >
            {isLogin ? 'Criar conta' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Splash discreto (logo) enquanto a sessão é carregada. */
export function AuthSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg">
      <span className="animate-pulse">
        <Logo size={40} />
      </span>
      <span className="text-legend text-subtle">Carregando…</span>
    </div>
  )
}
