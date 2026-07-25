/** Mostrada quando faltam as variáveis do Supabase no .env.local. */
export function ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 text-center shadow-apple">
        <span className="text-[40px]" aria-hidden>⚠️</span>
        <h1 className="mt-3 text-section font-semibold text-ink">Configuração necessária</h1>
        <p className="mt-2 text-body text-subtle">
          Configure o <code className="rounded bg-surface-2 px-1.5 py-0.5">.env.local</code> com as
          credenciais do Supabase (<code>VITE_SUPABASE_URL</code> e{' '}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) e recarregue a página.
        </p>
      </div>
    </div>
  )
}
