import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** Sinaliza configuração ausente para a UI mostrar uma mensagem clara. */
export const supabaseConfigured = Boolean(url && key)

/**
 * Cliente Supabase (client-side). As credenciais vêm sempre de variáveis de
 * ambiente — nunca hard-coded. A chave secreta (service_role) jamais é usada.
 */
export const supabase = createClient<Database>(url ?? '', key ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})
