export type ProfileColor =
  | 'blue'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'indigo'
  | 'green'

export interface Perfil {
  id: string // uuid
  nome: string // ex: "Minha Empresa", "Pessoal", "Loja 2"
  emoji: string // ex: "💼", "🏠" — usado no avatar
  cor: ProfileColor // token da paleta
  criadoEm: string
  atualizadoEm: string
}

/** Payload de criação/edição de perfil. */
export type PerfilInput = Pick<Perfil, 'nome' | 'emoji' | 'cor'>

/** Sentinela para o modo "Todos os perfis" (dados consolidados). */
export const ALL_PROFILES = 'all' as const
export type ActiveProfileId = string | typeof ALL_PROFILES

/** Mapeia o token de cor para a variável CSS correspondente (adapta ao tema). */
export const PROFILE_COLORS: Record<ProfileColor, string> = {
  blue: 'var(--blue)',
  purple: 'var(--purple)',
  orange: 'var(--orange)',
  pink: 'var(--pink)',
  teal: 'var(--teal)',
  indigo: 'var(--indigo)',
  green: 'var(--green)',
}

export const PROFILE_COLOR_ORDER: ProfileColor[] = [
  'blue',
  'purple',
  'orange',
  'pink',
  'teal',
  'indigo',
  'green',
]

/** Emojis sugeridos para o avatar do perfil. */
export const PROFILE_EMOJIS = [
  '🏠', '💼', '🏪', '📱', '🪙', '🎯', '📊', '🚀',
  '🧾', '🏦', '🛒', '🍔', '✈️', '🎓', '🐶', '🎨',
  '⚽', '🎸', '🌱', '🔧', '💡', '❤️', '🌍', '⭐',
]
