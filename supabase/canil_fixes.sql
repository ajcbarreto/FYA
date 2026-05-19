-- Correcoes do fluxo de canil:
--  1) Ao registar uma conta 'canil', criar tambem a linha em public.canis.
--  2) Permitir que o dono de um canil leia o perfil de quem se candidatou.
-- Executar depois de profiles.sql e canis_animais_policies.sql.

-- 1) handle_new_user passa a criar o canil associado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_role text;
  resolved_role public.app_role;
begin
  metadata_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');
  resolved_role := case
    when metadata_role in ('user', 'canil', 'admin') then metadata_role::public.app_role
    else 'user'::public.app_role
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    resolved_role
  );

  if resolved_role = 'canil'
     and not exists (select 1 from public.canis where owner_profile_id = new.id) then
    insert into public.canis (owner_profile_id, nome, localizacao, missao, telefone, email_contacto)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'shelter_name', ''),
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        'O meu canil'
      ),
      coalesce(nullif(new.raw_user_meta_data ->> 'shelter_location', ''), 'Por definir'),
      nullif(new.raw_user_meta_data ->> 'shelter_mission', ''),
      nullif(new.raw_user_meta_data ->> 'contact_phone', ''),
      new.email
    );
  end if;

  return new;
end;
$$;

-- 2) O dono de um canil pode ler o perfil de quem se candidatou ao seu canil.
drop policy if exists "Shelter owners can read applicant profiles" on public.profiles;
create policy "Shelter owners can read applicant profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.pedidos_adocao p
    join public.canis c on c.id = p.canil_id
    where p.applicant_profile_id = profiles.id
      and c.owner_profile_id = auth.uid()
  )
);
