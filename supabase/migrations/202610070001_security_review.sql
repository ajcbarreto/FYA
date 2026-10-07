begin;

-- SECURITY DEFINER bypasses RLS: ownership and membership must enforce MFA too.
create or replace function private.shelter_access(shelter uuid, write_access boolean default false) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and private.admin_mfa_ok() and (
  private.is_admin()
  or exists(select 1 from public.canis where id=shelter and owner_profile_id=auth.uid())
  or exists(select 1 from public.shelter_memberships where canil_id=shelter and profile_id=auth.uid() and (not write_access or role='editor'))
 );
$$;

create or replace function public.my_shelters() returns setof public.canis
language sql stable security definer set search_path='' as $$
 select c.* from public.canis c where private.admin_mfa_ok() and (
  c.owner_profile_id=auth.uid()
  or exists(select 1 from public.shelter_memberships m where m.canil_id=c.id and m.profile_id=auth.uid())
 ) order by exists(select 1 from public.shelter_preferences p where p.profile_id=auth.uid() and p.canil_id=c.id) desc,c.tipo='canil' desc,c.created_at,c.id;
$$;

create or replace function private.can_read_document(document uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select private.admin_mfa_ok() and exists(
  select 1 from public.animal_documents d join public.animais a on a.id=d.animal_id
  where d.id=document and (private.shelter_access(a.canil_id,false) or (d.shareable and exists(
   select 1 from public.document_shares s where s.recipient_id=auth.uid()
    and s.animal_id=d.animal_id and d.id=any(s.document_ids)
    and s.revoked_at is null and s.expires_at>now()
  )))
 );
$$;

-- Cover tables added after the original MFA migration without duplicating policies.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='public' and rowsecurity and tablename<>'profiles' loop
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t.tablename and policyname='admin_requires_mfa') then
   execute format('create policy admin_requires_mfa on public.%I as restrictive for all to authenticated using (private.admin_mfa_ok()) with check (private.admin_mfa_ok())',t.tablename);
  end if;
 end loop;
end $$;

-- Serialise activation per individual, including restore and adopted -> active edits.
create function private.enforce_individual_listing_limit() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or private.is_admin() or not private.is_individual_shelter(new.canil_id)
  or new.archived_at is not null or new.status='adotado' then return new; end if;
 if tg_op='UPDATE' then
  if old.archived_at is null and old.status<>'adotado' then return new; end if;
 end if;
 perform pg_advisory_xact_lock(hashtextextended(new.canil_id::text,31));
 if (select count(*) from public.animais where canil_id=new.canil_id and id<>new.id and archived_at is null and status<>'adotado')>=3 then
  raise exception 'FYA_LISTING_LIMIT' using errcode='22023';
 end if;
 return new;
end $$;
revoke all on function private.enforce_individual_listing_limit() from public;
create trigger animais_individual_limit before insert or update on public.animais
 for each row execute function private.enforce_individual_listing_limit();

-- Individual contacts remain private, but the transactional worker needs the owner's email.
create or replace function private.enqueue_adoption_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare recipient text; animal_name text;
begin
 select nome into animal_name from public.animais where id=new.animal_id;
 if tg_op='INSERT' then
  select case when c.tipo='particular' then p.email else c.email_contacto end into recipient
  from public.canis c join public.profiles p on p.id=c.owner_profile_id where c.id=new.canil_id;
 elsif new.status is distinct from old.status then
  select email into recipient from public.profiles where id=new.applicant_profile_id;
 else return new;
 end if;
 if recipient is not null then
  insert into public.email_outbox(recipient,animal_name,status)
  values(recipient,animal_name,case when tg_op='UPDATE' then new.status else null end);
 end if;
 return new;
end $$;

commit;
