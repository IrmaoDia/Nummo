-- Finanças — schema do Supabase.
-- Cole e rode no SQL Editor do painel do Supabase (uma vez).

-- ============ TABELAS ============

create table if not exists public.perfis (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  nome          text not null check (char_length(nome) between 1 and 40),
  emoji         text not null default '🏠',
  cor           text not null default 'blue',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.lancamentos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  perfil_id     uuid not null references public.perfis(id) on delete cascade,
  titulo        text not null check (char_length(titulo) between 1 and 120),
  data          date not null,
  tipo          text not null check (tipo in ('entrada','gasto')),
  categoria     text not null default 'sem_categoria'
                check (categoria in ('empresa','pessoa_fisica','sem_categoria')),
  valor         numeric(14,2) not null check (valor > 0),
  observacao    text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ============ ÍNDICES ============

create index if not exists idx_lanc_perfil_data on public.lancamentos (perfil_id, data);
create index if not exists idx_lanc_user        on public.lancamentos (user_id);
create index if not exists idx_perfis_user      on public.perfis (user_id);

-- ============ RLS ============

alter table public.perfis      enable row level security;
alter table public.lancamentos enable row level security;

drop policy if exists "perfis_proprios" on public.perfis;
create policy "perfis_proprios" on public.perfis
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lancamentos_proprios" on public.lancamentos;
create policy "lancamentos_proprios" on public.lancamentos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ ATUALIZA atualizado_em ============

create or replace function public.touch_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists trg_perfis_touch on public.perfis;
create trigger trg_perfis_touch      before update on public.perfis
  for each row execute function public.touch_atualizado_em();

drop trigger if exists trg_lancamentos_touch on public.lancamentos;
create trigger trg_lancamentos_touch before update on public.lancamentos
  for each row execute function public.touch_atualizado_em();

-- ============ PERFIL PADRÃO NO PRIMEIRO CADASTRO ============

create or replace function public.criar_perfil_padrao()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis (user_id, nome, emoji, cor)
  values (new.id, 'Pessoal', '🏠', 'blue');
  return new;
end $$;

drop trigger if exists trg_novo_usuario on auth.users;
create trigger trg_novo_usuario after insert on auth.users
  for each row execute function public.criar_perfil_padrao();

-- ============ REALTIME (opcional) ============
-- Habilite se quiser sincronização automática entre dispositivos:
-- alter publication supabase_realtime add table public.lancamentos;
