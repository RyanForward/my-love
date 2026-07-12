-- Rode este script no SQL Editor do painel Supabase (Project > SQL Editor > New query).
-- Cria a tabela de eventos e libera acesso público (sem login), conforme o app espera.

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  data date not null,
  horario text,
  imagem_url text,
  latitude double precision,
  longitude double precision,
  tzone double precision,
  criado_em timestamptz not null default now()
);

alter table public.eventos enable row level security;

drop policy if exists "Leitura publica" on public.eventos;
create policy "Leitura publica"
  on public.eventos for select
  to anon
  using (true);

drop policy if exists "Insercao publica" on public.eventos;
create policy "Insercao publica"
  on public.eventos for insert
  to anon
  with check (true);

drop policy if exists "Delecao publica" on public.eventos;
create policy "Delecao publica"
  on public.eventos for delete
  to anon
  using (true);
