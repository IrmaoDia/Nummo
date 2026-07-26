import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'

interface AuthResult {
  error?: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  /** true logo após um cadastro bem-sucedido (para a tela de boas-vindas). */
  justSignedUp: boolean
  clearJustSignedUp: () => void
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  /** Troca a senha do usuário logado. A sessão continua ativa. */
  updatePassword: (password: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Traduz as mensagens de erro mais comuns do Supabase Auth. */
function traduzErro(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'E-mail ou senha inválidos'
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already'))
    return 'Este e-mail já está cadastrado'
  if (m.includes('should be different'))
    return 'A nova senha precisa ser diferente da atual'
  if (m.includes('same password'))
    return 'A nova senha precisa ser diferente da atual'
  if (m.includes('password should be at least') || m.includes('password'))
    return 'A senha precisa ter pelo menos 6 caracteres'
  if (m.includes('unable to validate email') || m.includes('invalid email') || m.includes('email address') || m.includes('is invalid'))
    return 'E-mail inválido'
  if (m.includes('email not confirmed'))
    return 'Confirme seu e-mail antes de entrar'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [justSignedUp, setJustSignedUp] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      justSignedUp,
      clearJustSignedUp: () => setJustSignedUp(false),
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? { error: traduzErro(error.message) } : {}
      },
      signUp: async (email, password) => {
        // Sem `emailRedirectTo`, o link de confirmação usa a "Site URL" do
        // projeto (localhost:3000 por padrão). Apontar para a origem atual faz
        // o e-mail voltar para onde a conta foi criada — produção ou dev.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) return { error: traduzErro(error.message) }
        // Persiste para o caso de "Confirm email" estar ligado (a sessão só nasce
        // após confirmar por e-mail, em outro carregamento da página).
        try {
          localStorage.setItem('onboarding_pendente', '1')
        } catch {
          /* ignore */
        }
        setJustSignedUp(true)
        return {}
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password })
        return error ? { error: traduzErro(error.message) } : {}
      },
    }),
    [session, loading, justSignedUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
