interface ProfileAvatarProps {
  emoji: string
  color: string // cor CSS (ex.: var(--blue))
  size?: number
  ring?: boolean
}

/** Avatar circular com o emoji do perfil sobre o fundo na cor do perfil (15%). */
export function ProfileAvatar({ emoji, color, size = 28, ring }: ProfileAvatarProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.52),
        lineHeight: 1,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        boxShadow: ring ? `0 0 0 2px ${color}` : undefined,
      }}
    >
      <span aria-hidden>{emoji}</span>
    </span>
  )
}
