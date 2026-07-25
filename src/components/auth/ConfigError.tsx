/** Mostrada quando faltam as variáveis do Supabase (local ou no deploy). */
export function ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 shadow-apple">
        <div className="text-center">
          <span className="text-[40px]" aria-hidden>
            ⚠️
          </span>
          <h1 className="mt-3 text-section font-semibold text-ink">Configuração necessária</h1>
        </div>

        <p className="mt-3 text-body text-subtle">
          Defina as variáveis de ambiente do Supabase e recarregue a página:
        </p>

        <ul className="mt-3 flex flex-col gap-1.5 text-legend text-ink">
          <li className="rounded-lg bg-surface-2 px-3 py-2 font-mono">VITE_SUPABASE_URL</li>
          <li className="rounded-lg bg-surface-2 px-3 py-2 font-mono">
            VITE_SUPABASE_PUBLISHABLE_KEY
          </li>
        </ul>

        <p className="mt-4 text-legend text-subtle">
          <strong className="font-semibold text-ink">Local:</strong> no arquivo{' '}
          <code className="rounded bg-surface-2 px-1.5 py-0.5">.env.local</code> da raiz do projeto.
          <br />
          <strong className="font-semibold text-ink">Vercel:</strong> em Settings → Environment
          Variables, e depois refaça o deploy.
        </p>
      </div>
    </div>
  )
}
