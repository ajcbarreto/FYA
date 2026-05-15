-- Fotos de animais (galeria real)
-- Liga ficheiros no bucket Supabase Storage 'animal-photos' a animais.
-- Cria o bucket manualmente no painel Storage (publico = true) antes de executar.

create table if not exists public.animal_fotos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  storage_path text not null,
  public_url text,
  is_primary boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists animal_fotos_animal_idx on public.animal_fotos (animal_id, created_at desc);
create unique index if not exists animal_fotos_one_primary
  on public.animal_fotos (animal_id)
  where is_primary = true;

alter table public.animal_fotos enable row level security;

grant select on public.animal_fotos to anon, authenticated;
grant insert, update, delete on public.animal_fotos to authenticated;

drop policy if exists "Public can read animal photos" on public.animal_fotos;
create policy "Public can read animal photos"
on public.animal_fotos
for select
to anon, authenticated
using (true);

drop policy if exists "Shelter owner or admin can insert photos" on public.animal_fotos;
create policy "Shelter owner or admin can insert photos"
on public.animal_fotos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
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

drop policy if exists "Shelter owner or admin can update photos" on public.animal_fotos;
create policy "Shelter owner or admin can update photos"
on public.animal_fotos
for update
to authenticated
using (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
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

drop policy if exists "Shelter owner or admin can delete photos" on public.animal_fotos;
create policy "Shelter owner or admin can delete photos"
on public.animal_fotos
for delete
to authenticated
using (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
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

-- Storage policies para o bucket 'animal-photos'.
-- O bucket tem de ser criado em Storage antes de executar este bloco.
-- Comentar este bloco se a politica ja existir no projeto.
do $$
begin
  if exists (select 1 from storage.buckets where id = 'animal-photos') then
    drop policy if exists "Public can read animal photos in storage" on storage.objects;
    create policy "Public can read animal photos in storage"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'animal-photos');

    drop policy if exists "Shelter owner can upload animal photos" on storage.objects;
    create policy "Shelter owner can upload animal photos"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'animal-photos');

    drop policy if exists "Shelter owner can delete own animal photos" on storage.objects;
    create policy "Shelter owner can delete own animal photos"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'animal-photos' and owner = auth.uid());
  end if;
end
$$;
