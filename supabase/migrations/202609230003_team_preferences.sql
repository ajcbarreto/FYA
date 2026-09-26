begin;
create table public.shelter_preferences(profile_id uuid primary key references public.profiles(id),canil_id uuid not null references public.canis(id));
alter table public.shelter_preferences enable row level security;
revoke all on public.shelter_preferences from anon,authenticated;
grant select,insert,update on public.shelter_preferences to authenticated;
create policy preference on public.shelter_preferences for all to authenticated using(profile_id=auth.uid()) with check(profile_id=auth.uid() and private.shelter_access(canil_id,false));
create or replace function public.my_shelters() returns setof public.canis language sql stable security definer set search_path='' as $$
 select c.* from public.canis c where c.owner_profile_id=auth.uid() or exists(select 1 from public.shelter_memberships m where m.canil_id=c.id and m.profile_id=auth.uid()) order by exists(select 1 from public.shelter_preferences p where p.profile_id=auth.uid() and p.canil_id=c.id) desc,c.created_at,c.id;
$$;
commit;
