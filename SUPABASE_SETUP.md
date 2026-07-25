# Configuração do Supabase

Passos manuais (fora do código) para o app funcionar na nuvem.

## 1. Credenciais (`.env.local`)

Já criado na raiz, com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

- Use **apenas** a chave *publishable* (client-side). **Nunca** a `sb_secret_` / `service_role`.
- `.env.local` está no `.gitignore`. O `.env.example` (versionado) documenta as chaves.

## 2. Criar o schema

No painel do Supabase → **SQL Editor** → cole e rode o conteúdo de
[`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas `perfis` e
`lancamentos`, os índices, o **RLS** (com políticas por usuário), os gatilhos de
`atualizado_em` e o gatilho que cria o perfil **"Pessoal"** em todo novo cadastro.

Confira que o RLS ficou ativo:

```sql
select relname, relrowsecurity from pg_class
where relname in ('perfis','lancamentos');
-- relrowsecurity deve ser true nas duas.
```

## 3. Autenticação (uso pessoal)

Painel → **Authentication → Providers → Email**:
- Ative **Email**.
- Desative **Confirm email** (evita a etapa de confirmação por e-mail).

## 4. Rodar

```bash
npm install
npm run dev    # http://localhost:5173
```

Crie sua conta na tela de login (**Criar conta**). O perfil "Pessoal" aparece
automaticamente. Se você já tinha lançamentos salvos neste navegador (Dexie), o
app oferece enviá-los para a nuvem na primeira vez.

## 5. Tipos do banco (opcional, recomendado)

```bash
# edite o script types:db no package.json com o seu PROJECT_ID, então:
npm run types:db
```

Gera `src/types/database.ts` a partir do schema real (hoje ele é mantido à mão,
equivalente ao `schema.sql`).

## 6. Teste de segurança (RLS) — faça isto

Numa janela anônima, **sem login**, tente ler a API direto (troque URL e chave):

```bash
curl "https://SEU-PROJETO.supabase.co/rest/v1/lancamentos?select=*" \
  -H "apikey: SUA_CHAVE_PUBLISHABLE"
```

A resposta deve ser **`[]`** (vazia). Se vier qualquer registro, o RLS está mal
configurado — rode o `schema.sql` de novo antes de usar o app para valer.

## 7. Realtime (opcional)

Para sincronizar entre dispositivos automaticamente, rode no SQL Editor:

```sql
alter publication supabase_realtime add table public.lancamentos;
```

(A assinatura no cliente pode ser adicionada depois; o app já funciona sem isso,
revalidando ao focar a janela.)
