-- A2: sistema de denuncias para conteudos da plataforma.
-- Alvos possiveis: animal, mensagem, conversa, canil, profile.
-- Apenas utilizadores autenticados podem denunciar.

create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('animal', 'mensagem', 'conversa', 'canil', 'profile')),
  target_id uuid not null,
  motivo text not null check (motivo in (
    'conteudo_inapropriado',
    'animal_nao_pertence',
    'spam',
    'comunicacao_abusiva',
    'fraude',
    'outro'
  )),
  descricao text,
  estado text not null default 'aberta' check (estado in ('aberta', 'ignorada', 'resolvida')),
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists denuncias_estado_idx
  on public.denuncias (estado, created_at desc);
create index if not exists denuncias_target_idx
  on public.denuncias (target_type, target_id);

alter table public.denuncias enable row level security;

-- Apenas o autor pode ler a sua denuncia (admin tem acesso via service role).
drop policy if exists "denuncias_reporter_can_read" on public.denuncias;
create policy "denuncias_reporter_can_read" on public.denuncias
  for select
  to authenticated
  using (reporter_profile_id = auth.uid());

drop policy if exists "denuncias_authenticated_can_insert" on public.denuncias;
create policy "denuncias_authenticated_can_insert" on public.denuncias
  for insert
  to authenticated
  with check (reporter_profile_id = auth.uid());

-- Admins gerem via service-role no codigo da app (mantemos policies simples).
