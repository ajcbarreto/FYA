-- Public support details; existing canis ownership policies govern edits.
alter table public.canis add column if not exists donation_url text;
alter table public.canis add column if not exists donation_message text;
alter table public.canis add constraint canis_donation_url_https
  check (donation_url is null or donation_url ~ '^https://[^[:space:]]+$');

create table public.canil_likes (
  canil_id uuid not null references public.canis(id) on delete cascade,
  user_profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (canil_id, user_profile_id)
);
alter table public.canil_likes enable row level security;
grant select, insert, delete on public.canil_likes to authenticated;
create policy likes_read_own on public.canil_likes for select to authenticated
  using (user_profile_id = auth.uid());
create policy likes_insert_own on public.canil_likes for insert to authenticated
  with check (user_profile_id = auth.uid());
create policy likes_delete_own on public.canil_likes for delete to authenticated
  using (user_profile_id = auth.uid());
