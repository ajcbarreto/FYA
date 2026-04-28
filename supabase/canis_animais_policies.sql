-- Politicas para permitir leitura publica do catalogo (sem login)
-- e manter escrita restrita a canis donos/admin.

-- Garantir RLS ligado
alter table if exists public.canis enable row level security;
alter table if exists public.animais enable row level security;

-- Grants de leitura para API (anon + authenticated)
grant select on table public.canis to anon, authenticated;
grant select on table public.animais to anon, authenticated;

-- Limpeza de policies antigas com mesmo nome
drop policy if exists "Public can read canis" on public.canis;
drop policy if exists "Public can read animais" on public.animais;
drop policy if exists "Canil owner or admin can insert canis" on public.canis;
drop policy if exists "Canil owner or admin can update canis" on public.canis;
drop policy if exists "Canil owner or admin can insert animais" on public.animais;
drop policy if exists "Canil owner or admin can update animais" on public.animais;

-- Leitura aberta para catalogo e detalhe sem login
create policy "Public can read canis"
on public.canis
for select
to anon, authenticated
using (true);

create policy "Public can read animais"
on public.animais
for select
to anon, authenticated
using (true);

-- Escrita de canis: apenas dono do profile (role canil) ou admin
create policy "Canil owner or admin can insert canis"
on public.canis
for insert
to authenticated
with check (
  owner_profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('canil', 'admin')
  )
);

create policy "Canil owner or admin can update canis"
on public.canis
for update
to authenticated
using (
  owner_profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  owner_profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Escrita de animais: dono do canil ou admin
create policy "Canil owner or admin can insert animais"
on public.animais
for insert
to authenticated
with check (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

create policy "Canil owner or admin can update animais"
on public.animais
for update
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);
