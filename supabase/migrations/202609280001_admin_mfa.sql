-- Administrators must complete a second factor (TOTP) before any privileged access.
-- A password-only session (aal1) of an administrator is treated as unprivileged and
-- cannot read or write application data, even through direct API calls.
begin;

create or replace function private.admin_mfa_ok() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    or not exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function private.admin_mfa_ok() from public;
grant execute on function private.admin_mfa_ok() to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Restrictive policies are combined with AND over the existing permissive ones, so
-- policies that still test profiles.role = 'admin' inline are covered as well.
-- Profiles stay readable so the application can route the administrator to the MFA step.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname = 'public' and rowsecurity loop
    if t.tablename = 'profiles' then
      execute 'create policy admin_requires_mfa_update on public.profiles as restrictive for update to authenticated using (private.admin_mfa_ok()) with check (private.admin_mfa_ok())';
      execute 'create policy admin_requires_mfa_delete on public.profiles as restrictive for delete to authenticated using (private.admin_mfa_ok())';
    else
      execute format('create policy admin_requires_mfa on public.%I as restrictive for all to authenticated using (private.admin_mfa_ok()) with check (private.admin_mfa_ok())', t.tablename);
    end if;
  end loop;
end $$;

create policy admin_requires_mfa on storage.objects as restrictive for all to authenticated
using (private.admin_mfa_ok()) with check (private.admin_mfa_ok());

commit;
