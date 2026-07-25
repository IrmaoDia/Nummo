import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Sinaliza configuração ausente para a UI mostrar uma mensagem clara. */
export const supabaseConfigured = Boolean(url && key)

/**
 * Sem credenciais, `createClient` lançaria já na avaliação do módulo — o que
 * derrubaria o app inteiro (tela branca) antes de a UI conseguir explicar o
 * problema. Este stub adia o erro para o primeiro uso real, que nunca acontece
 * porque a UI checa `supabaseConfigured` e mostra a tela de configuração.
 */
function clientStub(): SupabaseClient<Database> {
  const fail = () => {
    throw new Error('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
  }
  return new Proxy({} as SupabaseClient<Database>, { get: fail, apply: fail })
}

/**
 * Cliente Supabase (client-side). As credenciais vêm sempre de variáveis de
 * ambiente — nunca hard-coded. A chave secreta (service_role) jamais é usada.
 */
export const supabase: SupabaseClient<Database> = supabaseConfigured
  ? createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Processa o #access_token=... com que o link de confirmação de e-mail
        // volta, transformando-o em sessão e limpando a URL.
        detectSessionInUrl: true,
      },
    })
  : clientStub()
