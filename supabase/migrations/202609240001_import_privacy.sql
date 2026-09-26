begin;
create function public.import_animals(p_shelter uuid,p_rows jsonb) returns integer language plpgsql security definer set search_path='' as $$
declare r jsonb; animal uuid; n integer:=0;
begin
 if not private.shelter_access(p_shelter,true) then raise exception 'Access denied'; end if;
 perform 1 from public.canis where id=p_shelter for update;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows) not between 1 and 200 then raise exception 'Invalid import'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  if length(trim(r->>'reference')) not between 1 and 100 or length(trim(r->>'name')) not between 1 and 160 or (r->>'species') not in ('cao','gato','outro') or length(r->>'description')>4000 then raise exception 'Invalid row'; end if;
  if exists(select 1 from public.animal_records ar join public.animais a on a.id=ar.animal_id where a.canil_id=p_shelter and ar.internal_ref=r->>'reference') then raise exception 'Duplicate reference: %',r->>'reference'; end if;
  insert into public.animais(canil_id,nome,especie,raca,idade_anos,descricao,published) values(p_shelter,r->>'name',r->>'species',nullif(r->>'breed',''),(r->>'age')::integer,r->>'description',false) returning id into animal;
  insert into public.animal_records(animal_id,internal_ref,intake_date) values(animal,r->>'reference',current_date);
  n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function public.import_animals(uuid,jsonb) from public;
grant execute on function public.import_animals(uuid,jsonb) to authenticated;
create table public.privacy_requests (
 id uuid primary key default gen_random_uuid(),profile_id uuid not null default auth.uid() references public.profiles(id),kind text not null check(kind in ('access','erasure','rectification')),
 message text not null default '' check(length(message)<=4000),status text not null default 'pending' check(status in ('pending','in_progress','completed','declined')),
 response text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from anon,authenticated;
grant select,insert on public.privacy_requests to authenticated;
grant update(status,response,updated_at) on public.privacy_requests to authenticated;
create policy privacy_read on public.privacy_requests for select to authenticated using(profile_id=auth.uid() or private.is_admin());
create policy privacy_insert on public.privacy_requests for insert to authenticated with check(profile_id=auth.uid() and status='pending' and response='');
create policy privacy_update on public.privacy_requests for update to authenticated using(private.is_admin());
create unique index privacy_one_pending on public.privacy_requests(profile_id,kind) where status in ('pending','in_progress');
create table public.terms_acceptances(profile_id uuid not null references public.profiles(id),version text not null,accepted_at timestamptz not null default now(),primary key(profile_id,version));
alter table public.terms_acceptances enable row level security;
revoke all on public.terms_acceptances from anon,authenticated;
grant select on public.terms_acceptances to authenticated;
create policy terms_read on public.terms_acceptances for select to authenticated using(profile_id=auth.uid() or private.is_admin());
create function private.record_terms() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_user_meta_data->>'terms_version'='2026-09-pilot' then
 insert into public.terms_acceptances(profile_id,version) values(new.id,'2026-09-pilot') on conflict do nothing;
 end if;return new;
end $$;
-- Runs after the existing profile provisioning trigger.
create trigger zz_record_terms after insert on auth.users for each row execute function private.record_terms();
commit;
