/**
 * Tipos do banco (Supabase / PostgREST).
 *
 * Idealmente gerados com `npm run types:db` (supabase gen types). Este arquivo é
 * uma versão equivalente ao schema em `supabase/schema.sql`, mantida à mão até
 * que o CLI do Supabase seja configurado no ambiente.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string
          user_id: string
          nome: string
          emoji: string
          cor: string
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          emoji?: string
          cor?: string
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          emoji?: string
          cor?: string
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          id: string
          user_id: string
          perfil_id: string
          titulo: string
          data: string
          tipo: string
          categoria: string
          valor: number
          observacao: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          perfil_id: string
          titulo: string
          data: string
          tipo: string
          categoria?: string
          valor: number
          observacao?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          perfil_id?: string
          titulo?: string
          data?: string
          tipo?: string
          categoria?: string
          valor?: number
          observacao?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/** Atalhos para linhas das tabelas. */
export type PerfilRow = Database['public']['Tables']['perfis']['Row']
export type LancamentoRow = Database['public']['Tables']['lancamentos']['Row']
