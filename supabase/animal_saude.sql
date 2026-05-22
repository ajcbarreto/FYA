-- B3: timeline medica do animal. Cada evento e tipado (vacina,
-- desparasitacao, cirurgia, consulta, peso, outro) e tem data + descricao.

create table if not exists public.animal_saude (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  tipo text not null check (tipo in ('vacina', 'desparasitacao', 'cirurgia', 'consulta', 'peso', 'outro')),
  data date not null default current_date,
  descricao text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists animal_saude_animal_idx
  on public.animal_saude (animal_id, data desc);

alter table public.animal_saude enable row level security;

-- Public catalog mostra o historial medico. Permitir SELECT a anon.
drop policy if exists "animal_saude_public_read" on public.animal_saude;
create policy "animal_saude_public_read" on public.animal_saude
  for select
  to anon, authenticated
  using (true);

-- Dono do animal (canil ou particular) gere os eventos.
drop policy if exists "animal_saude_owner_manage" on public.animal_saude;
create policy "animal_saude_owner_manage" on public.animal_saude
  for all
  to authenticated
  using (
    exists (
      select 1 from public.animais a
      where a.id = animal_saude.animal_id
        and (
          a.owner_profile_id = auth.uid()
          or exists (select 1 from public.canis k where k.id = a.canil_id and k.owner_profile_id = auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.animais a
      where a.id = animal_saude.animal_id
        and (
          a.owner_profile_id = auth.uid()
          or exists (select 1 from public.canis k where k.id = a.canil_id and k.owner_profile_id = auth.uid())
        )
    )
  );
