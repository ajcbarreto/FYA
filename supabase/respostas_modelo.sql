-- B4: respostas-modelo para canis e particulares. Permite guardar respostas
-- reutilizaveis para o chat. Cada linha pertence a um canil OU a um perfil
-- (XOR), exactamente como animais/pedidos.

create table if not exists public.respostas_modelo (
  id uuid primary key default gen_random_uuid(),
  canil_id uuid references public.canis(id) on delete cascade,
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) > 0),
  conteudo text not null check (char_length(trim(conteudo)) > 0),
  created_at timestamptz not null default now(),
  constraint respostas_modelo_owner_or_canil check (
    (canil_id is not null and owner_profile_id is null)
    or (canil_id is null and owner_profile_id is not null)
  )
);

create index if not exists respostas_modelo_canil_idx
  on public.respostas_modelo (canil_id) where canil_id is not null;
create index if not exists respostas_modelo_owner_idx
  on public.respostas_modelo (owner_profile_id) where owner_profile_id is not null;

alter table public.respostas_modelo enable row level security;

-- Dono do canil pode gerir.
drop policy if exists "respostas_modelo_canil_manage" on public.respostas_modelo;
create policy "respostas_modelo_canil_manage" on public.respostas_modelo
  for all
  to authenticated
  using (
    canil_id is not null
    and exists (select 1 from public.canis k where k.id = canil_id and k.owner_profile_id = auth.uid())
  )
  with check (
    canil_id is not null
    and exists (select 1 from public.canis k where k.id = canil_id and k.owner_profile_id = auth.uid())
  );

-- Owner particular pode gerir os proprios.
drop policy if exists "respostas_modelo_owner_manage" on public.respostas_modelo;
create policy "respostas_modelo_owner_manage" on public.respostas_modelo
  for all
  to authenticated
  using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());
