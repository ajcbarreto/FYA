-- Avaliacoes de canis pelos adotantes.
-- So pode avaliar quem concluiu uma adopcao com esse canil.
-- Executar depois de adoption_complete_cycle.sql.

create table if not exists public.avaliacoes_canil (
  id uuid primary key default gen_random_uuid(),
  canil_id uuid not null references public.canis(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique (canil_id, author_profile_id)
);

create index if not exists avaliacoes_canil_canil_idx
  on public.avaliacoes_canil (canil_id, created_at desc);

alter table public.avaliacoes_canil enable row level security;

grant select on public.avaliacoes_canil to anon, authenticated;
grant insert, update, delete on public.avaliacoes_canil to authenticated;

drop policy if exists "Public can read shelter reviews" on public.avaliacoes_canil;
create policy "Public can read shelter reviews"
on public.avaliacoes_canil
for select
to anon, authenticated
using (true);

drop policy if exists "Adopters with completed adoption can review" on public.avaliacoes_canil;
create policy "Adopters with completed adoption can review"
on public.avaliacoes_canil
for insert
to authenticated
with check (
  author_profile_id = auth.uid()
  and exists (
    select 1
    from public.pedidos_adocao p
    where p.canil_id = avaliacoes_canil.canil_id
      and p.applicant_profile_id = auth.uid()
      and p.status = 'concluido'
  )
);

drop policy if exists "Authors can update own review" on public.avaliacoes_canil;
create policy "Authors can update own review"
on public.avaliacoes_canil
for update
to authenticated
using (author_profile_id = auth.uid())
with check (author_profile_id = auth.uid());

drop policy if exists "Authors can delete own review" on public.avaliacoes_canil;
create policy "Authors can delete own review"
on public.avaliacoes_canil
for delete
to authenticated
using (author_profile_id = auth.uid());
