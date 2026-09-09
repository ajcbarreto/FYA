begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Avoid profiles -> requests -> profiles recursion, using a narrowly scoped helper.
create or replace function private.can_read_profile(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select target = auth.uid() or private.is_admin() or exists (
    select 1 from public.pedidos_adocao p join public.canis c on c.id = p.canil_id
    where p.applicant_profile_id = target and c.owner_profile_id = auth.uid()
  );
$$;
revoke all on function private.can_read_profile(uuid) from public;
grant execute on function private.can_read_profile(uuid) to authenticated;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='profiles' loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;
create policy profiles_read on public.profiles for select to authenticated using (private.can_read_profile(id));
create policy profiles_update on public.profiles for update to authenticated
using (id=auth.uid() or private.is_admin()) with check (id=auth.uid() or private.is_admin());
grant select, update on public.profiles to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r public.app_role;
begin
  r := case when new.raw_user_meta_data->>'role' = 'canil' then 'canil'::public.app_role else 'user'::public.app_role end;
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,nullif(new.raw_user_meta_data->>'full_name',''),r);
  if r='canil' then
    insert into public.canis(id,owner_profile_id,nome,localizacao,email_contacto)
    values(gen_random_uuid(),new.id,coalesce(nullif(new.raw_user_meta_data->>'shelter_name',''),'O meu canil'),
      coalesce(nullif(new.raw_user_meta_data->>'shelter_location',''),'Por definir'),new.email);
  end if;
  return new;
end $$;

create or replace function private.protect_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not private.is_admin() and
     (new.id is distinct from old.id or new.role is distinct from old.role or new.email is distinct from old.email or new.created_at is distinct from old.created_at) then
    raise exception 'Protected profile fields' using errcode='42501';
  end if;
  return new;
end $$;
create trigger profiles_protect_fields before update on public.profiles for each row execute function private.protect_profile();

create or replace function private.protect_shelter() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not private.is_admin() then
    if tg_op='INSERT' then
      if new.verificado then raise exception 'Verification requires administrator' using errcode='42501'; end if;
    elsif new.verificado is distinct from old.verificado or new.owner_profile_id is distinct from old.owner_profile_id or new.id is distinct from old.id then
      raise exception 'Protected shelter fields' using errcode='42501';
    end if;
  end if;
  return new;
end $$;
create trigger canis_protect_fields before insert or update on public.canis for each row execute function private.protect_shelter();

create or replace function private.protect_animal() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='UPDATE' and (new.id is distinct from old.id or new.canil_id is distinct from old.canil_id) then
    raise exception 'Animal ownership is immutable' using errcode='42501';
  end if;
  if auth.uid() is not null and not private.is_admin() and
    coalesce((select value->>'requireVerificationToPublish'='true' from public.app_settings where key='platform_settings'),false) and
    not exists(select 1 from public.canis where id=new.canil_id and verificado) then
    raise exception 'Shelter verification required' using errcode='42501';
  end if;
  return new;
end $$;
create trigger animais_protect_fields before insert or update on public.animais for each row execute function private.protect_animal();
alter table public.canis alter column id set default gen_random_uuid();
alter table public.animais alter column id set default gen_random_uuid();

alter table public.animais add column if not exists compatibilidades text[] not null default '{}';
alter table public.animais add constraint animal_compatibilities check (compatibilidades <@ array['children','seniors','apartment','trained']::text[]) not valid;

-- Fail rather than silently remove conflicting existing adoption records.
create unique index pedidos_one_completed on public.pedidos_adocao(animal_id) where status='concluido';
create unique index pedidos_one_active on public.pedidos_adocao(animal_id,applicant_profile_id) where status in ('pendente','entrevista','aprovado');
revoke insert, update on public.pedidos_adocao from authenticated;
revoke insert, update on public.conversas_adocao from authenticated;

create or replace function private.guard_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.animais where id=new.animal_id and canil_id=new.canil_id) then
    raise exception 'Animal and shelter do not match' using errcode='23514';
  end if;
  if tg_op='UPDATE' then
    if new.id is distinct from old.id or new.animal_id is distinct from old.animal_id or new.canil_id is distinct from old.canil_id or new.applicant_profile_id is distinct from old.applicant_profile_id then
      raise exception 'Request ownership is immutable' using errcode='42501';
    end if;
    if new.status is distinct from old.status and not (
      (old.status='pendente' and new.status in ('entrevista','rejeitado')) or
      (old.status='entrevista' and new.status in ('aprovado','rejeitado')) or
      (old.status='aprovado' and new.status in ('concluido','rejeitado'))
    ) then raise exception 'Invalid request transition' using errcode='23514'; end if;
  end if;
  return new;
end $$;
create trigger pedidos_guard before insert or update on public.pedidos_adocao for each row execute function private.guard_request();

-- Atomic and idempotent while an application is active. Serialise on the animal.
create or replace function public.submit_adoption(p_animal uuid, p_answers jsonb, p_message text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare a public.animais; request_id uuid; conversation_id uuid;
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='user') then
    raise exception 'Adopter account required' using errcode='42501';
  end if;
  if jsonb_typeof(p_answers) <> 'object' or length(p_answers::text)>16000 or length(p_message)>4000 then
    raise exception 'Invalid application' using errcode='22023';
  end if;
  select * into a from public.animais where id=p_animal for update;
  if not found or a.status not in ('disponivel','reservado') then raise exception 'Animal unavailable' using errcode='23514'; end if;
  select id into request_id from public.pedidos_adocao where animal_id=a.id and applicant_profile_id=auth.uid() and status in ('pendente','entrevista','aprovado');
  if request_id is null then
    insert into public.pedidos_adocao(animal_id,canil_id,applicant_profile_id,respostas,mensagem_inicial)
    values(a.id,a.canil_id,auth.uid(),p_answers,nullif(trim(p_message),'')) returning id into request_id;
    insert into public.conversas_adocao(animal_id,canil_id,applicant_profile_id,pedido_id)
    values(a.id,a.canil_id,auth.uid(),request_id)
    on conflict(canil_id,applicant_profile_id,animal_id) do update set pedido_id=excluded.pedido_id
    returning id into conversation_id;
    insert into public.mensagens_adocao(conversa_id,sender_profile_id,conteudo)
    values(conversation_id,auth.uid(),coalesce(nullif(trim(p_message),''),'Tenho interesse neste animal. / I am interested in this animal.'));
  else
    select id into conversation_id from public.conversas_adocao where pedido_id=request_id;
    if conversation_id is null then
      insert into public.conversas_adocao(animal_id,canil_id,applicant_profile_id,pedido_id)
      values(a.id,a.canil_id,auth.uid(),request_id)
      on conflict(canil_id,applicant_profile_id,animal_id) do update set pedido_id=excluded.pedido_id
      returning id into conversation_id;
    end if;
  end if;
  return conversation_id;
end $$;
revoke all on function public.submit_adoption(uuid,jsonb,text) from public;
grant execute on function public.submit_adoption(uuid,jsonb,text) to authenticated;

create or replace function public.transition_adoption(p_request uuid, p_status text, p_notes text)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.pedidos_adocao; animal uuid;
begin
  select animal_id into animal from public.pedidos_adocao where id=p_request;
  -- Same lock order as submission; prevents two simultaneous completions.
  perform 1 from public.animais where id=animal for update;
  select * into r from public.pedidos_adocao where id=p_request for update;
  if r.id is null or auth.uid() is null or not (private.is_admin() or exists(select 1 from public.canis where id=r.canil_id and owner_profile_id=auth.uid())) then
    raise exception 'Request access denied' using errcode='42501';
  end if;
  if length(p_notes)>4000 then raise exception 'Notes too long' using errcode='22023'; end if;
  update public.pedidos_adocao set status=p_status,observacoes_canil=nullif(trim(p_notes),''),reviewed_at=now() where id=r.id;
  if p_status='concluido' then
    update public.pedidos_adocao set status='rejeitado',reviewed_at=now() where animal_id=r.animal_id and id<>r.id and status in ('pendente','entrevista','aprovado');
    update public.visitas set status='cancelada' where animal_id=r.animal_id and status in ('proposta','confirmada');
  end if;
end $$;
revoke all on function public.transition_adoption(uuid,text,text) from public;
grant execute on function public.transition_adoption(uuid,text,text) to authenticated;

-- Message trigger can update conversation timestamps after direct UPDATE is revoked.
create or replace function public.bump_conversa_updated_at() returns trigger
language plpgsql security definer set search_path='' as $$
begin update public.conversas_adocao set updated_at=now() where id=new.conversa_id; return new; end $$;
alter table public.mensagens_adocao add constraint message_length check (length(conteudo)<=4000) not valid;

create or replace function private.guard_visit() returns trigger
language plpgsql security definer set search_path='' as $$
declare r public.pedidos_adocao; owner_access boolean;
begin
  select * into r from public.pedidos_adocao where id=new.pedido_id;
  if r.id is null or new.canil_id<>r.canil_id or new.applicant_profile_id<>r.applicant_profile_id or new.animal_id is distinct from r.animal_id then
    raise exception 'Visit does not match request' using errcode='23514';
  end if;
  owner_access := private.is_admin() or exists(select 1 from public.canis where id=r.canil_id and owner_profile_id=auth.uid());
  if tg_op='INSERT' then
    if new.status<>'proposta' or new.scheduled_at<=now() or r.status in ('rejeitado','concluido') then raise exception 'Invalid visit proposal' using errcode='23514'; end if;
  else
    if new.pedido_id<>old.pedido_id or new.id<>old.id or new.scheduled_at<>old.scheduled_at then raise exception 'Visit relationship is immutable' using errcode='42501'; end if;
    if new.status<>old.status and not (
      (old.status='proposta' and new.status='cancelada') or
      (old.status='confirmada' and new.status='cancelada') or
      (owner_access and old.status='proposta' and new.status='confirmada') or
      (owner_access and old.status='confirmada' and new.status='realizada' and old.scheduled_at<=now())
    ) then raise exception 'Invalid visit transition' using errcode='42501'; end if;
  end if;
  return new;
end $$;
create trigger visitas_guard before insert or update on public.visitas for each row execute function private.guard_visit();

-- Immutable audit trail, readable only by administrators.
create table public.audit_events(id bigint generated always as identity primary key, actor_id uuid, entity text not null, entity_id text not null, operation text not null, created_at timestamptz not null default now());
alter table public.audit_events enable row level security;
grant select on public.audit_events to authenticated;
create policy audit_admin_read on public.audit_events for select to authenticated using(private.is_admin());
create or replace function private.audit_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin insert into public.audit_events(actor_id,entity,entity_id,operation) values(auth.uid(),tg_table_name,new.id::text,tg_op); return new; end $$;
create trigger pedidos_audit after insert or update on public.pedidos_adocao for each row execute function private.audit_change();
create trigger profiles_audit after update on public.profiles for each row execute function private.audit_change();
create trigger canis_audit after update on public.canis for each row execute function private.audit_change();

-- Persistent email jobs are committed with the application, without delaying HTTP responses.
create table public.email_outbox(id uuid primary key default gen_random_uuid(), recipient text not null, animal_name text not null, status text, attempts int not null default 0, available_at timestamptz not null default now(), locked_at timestamptz, sent_at timestamptz, created_at timestamptz not null default now());
alter table public.email_outbox enable row level security;
revoke all on public.email_outbox from anon, authenticated;
grant all on public.email_outbox to service_role;
create or replace function private.enqueue_adoption_email() returns trigger
language plpgsql security definer set search_path='' as $$
declare recipient text; animal_name text;
begin
  select nome into animal_name from public.animais where id=new.animal_id;
  if tg_op='INSERT' then
    select email_contacto into recipient from public.canis where id=new.canil_id;
  elsif new.status is distinct from old.status then
    select email into recipient from public.profiles where id=new.applicant_profile_id;
  else return new;
  end if;
  if recipient is not null then insert into public.email_outbox(recipient,animal_name,status) values(recipient,animal_name,case when tg_op='UPDATE' then new.status else null end); end if;
  return new;
end $$;
create trigger pedidos_email after insert or update on public.pedidos_adocao for each row execute function private.enqueue_adoption_email();
create or replace function public.claim_email_jobs() returns setof public.email_outbox
language sql security definer set search_path='' as $$
  update public.email_outbox set attempts=attempts+1,locked_at=now(),available_at=now()+interval '10 minutes'
  where id in (select id from public.email_outbox where sent_at is null and attempts<5 and available_at<=now() and (locked_at is null or locked_at<now()-interval '10 minutes') order by created_at for update skip locked limit 20)
  returning *;
$$;
revoke all on function public.claim_email_jobs() from public;
grant execute on function public.claim_email_jobs() to service_role;

-- A client may only mark its notifications read; fields controlling routing stay immutable.
revoke update on public.notificacoes from authenticated;
grant update(lida) on public.notificacoes to authenticated;
-- Only an animal's owner can upload to its folder; users cannot upload arbitrary files.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('animal-photos','animal-photos',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists "Shelter owner can upload animal photos" on storage.objects;
create policy "Shelter owner can upload animal photos" on storage.objects for insert to authenticated
with check (bucket_id='animal-photos' and exists(select 1 from public.animais a join public.canis c on c.id=a.canil_id where a.id::text=split_part(name,'/',1) and c.owner_profile_id=auth.uid()));
drop policy if exists "Authenticated users can submit reviews" on public.avaliacoes_canil;
create policy "Authenticated users can submit reviews" on public.avaliacoes_canil for insert to authenticated
with check(author_profile_id=auth.uid() and estado='pendente');
-- Moderators may change approval state, never rewrite an author's rating/text.
revoke update on public.avaliacoes_canil from authenticated;
grant update(estado) on public.avaliacoes_canil to authenticated;
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='mensagens_adocao') then
    alter publication supabase_realtime add table public.mensagens_adocao;
  end if;
end $$;
commit;
