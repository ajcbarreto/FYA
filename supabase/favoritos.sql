-- Favoritos: animais marcados por adotantes
-- Executar depois de profiles.sql e canis_animais_policies.sql

create table if not exists public.favoritos (
  user_profile_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid not null references public.animais(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_profile_id, animal_id)
);

create index if not exists favoritos_user_idx on public.favoritos (user_profile_id, created_at desc);
create index if not exists favoritos_animal_idx on public.favoritos (animal_id);

alter table public.favoritos enable row level security;

grant select, insert, delete on public.favoritos to authenticated;

drop policy if exists "Users can read own favorites" on public.favoritos;
create policy "Users can read own favorites"
on public.favoritos
for select
to authenticated
using (user_profile_id = auth.uid());

drop policy if exists "Users can add favorites" on public.favoritos;
create policy "Users can add favorites"
on public.favoritos
for insert
to authenticated
with check (user_profile_id = auth.uid());

drop policy if exists "Users can remove favorites" on public.favoritos;
create policy "Users can remove favorites"
on public.favoritos
for delete
to authenticated
using (user_profile_id = auth.uid());
