begin;
-- Memberships never change a person's global role.
create table public.shelter_memberships (
 canil_id uuid not null references public.canis(id), profile_id uuid not null references public.profiles(id),
 role text not null check(role in ('editor','reader')), created_at timestamptz not null default now(), primary key(canil_id,profile_id)
);
create or replace function private.shelter_access(shelter uuid, write_access boolean default false) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.is_admin() or exists(select 1 from public.canis where id=shelter and owner_profile_id=auth.uid()) or exists(select 1 from public.shelter_memberships where canil_id=shelter and profile_id=auth.uid() and (not write_access or role='editor')));
$$;
revoke all on function private.shelter_access(uuid,boolean) from public;
grant execute on function private.shelter_access(uuid,boolean) to authenticated;
alter table public.shelter_memberships enable row level security;
revoke all on public.shelter_memberships from anon,authenticated;
grant select,delete on public.shelter_memberships to authenticated;
create policy members_read on public.shelter_memberships for select to authenticated using(private.shelter_access(canil_id));
create policy members_delete on public.shelter_memberships for delete to authenticated using(exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid()));
create table public.shelter_invitations (
 id uuid primary key default gen_random_uuid(), canil_id uuid not null references public.canis(id), email text not null check(email=lower(trim(email))),
 role text not null check(role in ('editor','reader')), expires_at timestamptz not null default now()+interval '7 days', created_at timestamptz not null default now(), unique(canil_id,email)
);
alter table public.shelter_invitations enable row level security;
revoke all on public.shelter_invitations from anon,authenticated;
grant select,insert,delete on public.shelter_invitations to authenticated;
create policy invite_read on public.shelter_invitations for select to authenticated using(exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid()) or email=(select lower(email) from public.profiles where id=auth.uid()));
create policy invite_insert on public.shelter_invitations for insert to authenticated with check(expires_at<=now()+interval '7 days' and exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid()));
create policy invite_delete on public.shelter_invitations for delete to authenticated using(exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid()));
create function public.accept_shelter_invitation(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare i public.shelter_invitations;
begin
 select * into i from public.shelter_invitations where id=p_id for update;
 if i.id is null or i.expires_at<=now() or not exists(select 1 from public.profiles where id=auth.uid() and lower(email)=i.email) then raise exception 'Invalid invitation'; end if;
 insert into public.shelter_memberships(canil_id,profile_id,role) values(i.canil_id,auth.uid(),i.role) on conflict(canil_id,profile_id) do update set role=excluded.role;
 delete from public.shelter_invitations where id=i.id;
end $$;
create function public.my_shelters() returns setof public.canis language sql stable security definer set search_path='' as $$
 select c.* from public.canis c where c.owner_profile_id=auth.uid() or exists(select 1 from public.shelter_memberships m where m.canil_id=c.id and m.profile_id=auth.uid()) order by c.created_at,c.id;
$$;
revoke all on function public.accept_shelter_invitation(uuid),public.my_shelters() from public;
grant execute on function public.accept_shelter_invitation(uuid),public.my_shelters() to authenticated;
-- Extend existing operational policies to team members. Owner-only shelter settings stay owner-only.
do $$ declare p record; q text; w text; write_access text; begin
 for p in select * from pg_policies where schemaname in ('public','storage') and tablename in ('animais','animal_fotos','pedidos_adocao','conversas_adocao','mensagens_adocao','visitas','objects') loop
  write_access := case when p.cmd='SELECT' then 'false' else 'true' end;
  q := regexp_replace(p.qual,'([a-z]+)\.owner_profile_id = auth.uid\(\)','private.shelter_access(\1.id,'||write_access||')','g');
  w := regexp_replace(p.with_check,'([a-z]+)\.owner_profile_id = auth.uid\(\)','private.shelter_access(\1.id,'||write_access||')','g');
  if q is distinct from p.qual or w is distinct from p.with_check then
   execute format('alter policy %I on %I.%I %s %s',p.policyname,p.schemaname,p.tablename,case when q is not null then 'using ('||q||')' else '' end,case when w is not null then 'with check ('||w||')' else '' end);
  end if;
 end loop;
end $$;
-- Security definer operations must use exactly the same membership rules.
do $$ declare f regprocedure; body text; begin
 foreach f in array array['public.transition_adoption(uuid,text,text)'::regprocedure,'private.guard_visit()'::regprocedure,'private.can_read_profile(uuid)'::regprocedure] loop
  body:=pg_get_functiondef(f);
  body:=replace(body,'exists(select 1 from public.canis where id=r.canil_id and owner_profile_id=auth.uid())','private.shelter_access(r.canil_id,true)');
  body:=replace(body,'c.owner_profile_id = auth.uid()','private.shelter_access(c.id,false)');
  execute body;
 end loop;
end $$;
alter table public.animais add column archived_at timestamptz, add column published boolean not null default true;
-- Public API hides internal/archived animals even when called directly.
create policy animal_visibility on public.animais as restrictive for select to anon,authenticated using(
 (published and archived_at is null and exists(select 1 from public.canis c where c.id=canil_id and c.verificado))
 or (auth.uid() is not null and private.shelter_access(canil_id,false))
);
grant usage on schema private to anon;
grant execute on function private.shelter_access(uuid,boolean) to anon;
revoke delete,update on public.animais from authenticated;
grant update(nome,especie,raca,sexo,idade_anos,porte,descricao,compatibilidades) on public.animais to authenticated;
create table public.animal_records (
 animal_id uuid primary key references public.animais(id), internal_ref text not null default '', microchip text not null default '',
 intake_date date, origin text not null default '', location text not null default '', birth_date date,
 health_notes text not null default '', behaviour_notes text not null default '', internal_notes text not null default '',
 handover_notes text not null default '', updated_at timestamptz not null default now(),
 check(length(health_notes)+length(behaviour_notes)+length(internal_notes)+length(handover_notes)<=24000)
);
create table public.animal_documents (
 id uuid primary key default gen_random_uuid(), animal_id uuid not null references public.animais(id), title text not null check(length(title) between 1 and 160),
 category text not null check(category in ('health','identification','adoption','other')), storage_path text not null unique,
 mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')), size_bytes integer not null check(size_bytes between 1 and 10485760),
 shareable boolean not null default false, created_at timestamptz not null default now(), created_by uuid not null default auth.uid() references public.profiles(id),
 check(storage_path=animal_id::text||'/'||id::text)
);
create table public.document_shares (
 id uuid primary key, animal_id uuid not null references public.animais(id), request_id uuid not null references public.pedidos_adocao(id), recipient_id uuid not null references public.profiles(id),
 document_ids uuid[] not null check(cardinality(document_ids) between 1 and 30), handover_notes text not null default '',
 expires_at timestamptz not null, revoked_at timestamptz, created_by uuid not null default auth.uid(), created_at timestamptz not null default now()
);
create function private.can_read_document(document uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.animal_documents d join public.animais a on a.id=d.animal_id where d.id=document and (private.shelter_access(a.canil_id,false) or (d.shareable and exists(select 1 from public.document_shares s where s.recipient_id=auth.uid() and s.animal_id=d.animal_id and d.id=any(s.document_ids) and s.revoked_at is null and s.expires_at>now()))));
$$;
revoke all on function private.can_read_document(uuid) from public;
grant execute on function private.can_read_document(uuid) to authenticated;
alter table public.animal_records enable row level security;
revoke all on public.animal_records from anon,authenticated;
alter table public.animal_documents enable row level security;
revoke all on public.animal_documents from anon,authenticated;
alter table public.document_shares enable row level security;
revoke all on public.document_shares from anon,authenticated;
grant select,insert,update on public.animal_records to authenticated;
grant select,insert,delete on public.animal_documents to authenticated;
grant update(shareable) on public.animal_documents to authenticated;
grant select on public.document_shares to authenticated;
create policy records_read on public.animal_records for select to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,false)));
create policy records_write on public.animal_records for all to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true))) with check(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true)));
create policy documents_read on public.animal_documents for select to authenticated using(private.can_read_document(id));
create policy documents_insert on public.animal_documents for insert to authenticated with check(created_by=auth.uid() and exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true)));
create policy documents_update on public.animal_documents for update to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true)));
create policy documents_delete on public.animal_documents for delete to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true)));
create policy shares_read on public.document_shares for select to authenticated using((recipient_id=auth.uid() and revoked_at is null and expires_at>now()) or exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,false)));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('animal-documents','animal-documents',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy document_upload on storage.objects for insert to authenticated with check(bucket_id='animal-documents' and exists(select 1 from public.animal_documents d join public.animais a on a.id=d.animal_id where d.storage_path=name and private.shelter_access(a.canil_id,true)));
-- Recipient downloads go through the authenticated route, which checks expiry on every request.
create policy document_download on storage.objects for select to authenticated using(bucket_id='animal-documents' and exists(select 1 from public.animal_documents d where d.storage_path=name and private.can_read_document(d.id)));
create policy document_delete on storage.objects for delete to authenticated using(bucket_id='animal-documents' and exists(select 1 from public.animal_documents d join public.animais a on a.id=d.animal_id where d.storage_path=name and private.shelter_access(a.canil_id,true)));
alter table public.email_outbox add column share_id uuid references public.document_shares(id), add column last_error text;
create function public.share_animal_documents(p_id uuid,p_request uuid,p_documents uuid[],p_days integer) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.pedidos_adocao; animal public.animais; recipient text;
begin
 select * into r from public.pedidos_adocao where id=p_request;
 if r.id is null or not private.shelter_access(r.canil_id,true) or r.status not in ('entrevista','aprovado','concluido') then raise exception 'Request access denied'; end if;
 select * into animal from public.animais where id=r.animal_id for update;
 if exists(select 1 from public.document_shares where id=p_id and created_by=auth.uid() and request_id=p_request) then return p_id; end if;
 if p_days not between 1 and 30 or cardinality(p_documents) not between 1 and 30 or p_documents is null then raise exception 'Invalid share'; end if;
 if (select count(*) from public.animal_documents where id=any(p_documents) and animal_id=r.animal_id and shareable)<>cardinality(p_documents) then raise exception 'Invalid documents'; end if;
 if (select count(*) from public.document_shares where animal_id=r.animal_id and created_at>now()-interval '1 hour')>=10 then raise exception 'Share limit reached'; end if;
 select email into recipient from public.profiles where id=r.applicant_profile_id;
 insert into public.document_shares(id,animal_id,request_id,recipient_id,document_ids,expires_at,handover_notes)
 values(p_id,r.animal_id,r.id,r.applicant_profile_id,p_documents,now()+make_interval(days=>p_days),coalesce((select handover_notes from public.animal_records where animal_id=r.animal_id),''));
 insert into public.email_outbox(recipient,animal_name,share_id) values(recipient,animal.nome,p_id);
 return p_id;
end $$;
create function public.revoke_document_share(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.document_shares s set revoked_at=now() where s.id=p_id and exists(select 1 from public.animais a where a.id=s.animal_id and private.shelter_access(a.canil_id,true));
 if not found then raise exception 'Share access denied'; end if;
end $$;
revoke all on function public.share_animal_documents(uuid,uuid,uuid[],integer),public.revoke_document_share(uuid) from public;
grant execute on function public.share_animal_documents(uuid,uuid,uuid[],integer),public.revoke_document_share(uuid) to authenticated;
create table public.shelter_tasks (
 id uuid primary key default gen_random_uuid(), canil_id uuid not null references public.canis(id), animal_id uuid references public.animais(id), request_id uuid references public.pedidos_adocao(id),
 title text not null check(length(title) between 1 and 240), due_at timestamptz not null, assignee_id uuid references public.profiles(id),
 completed_at timestamptz, outcome text not null default '' check(length(outcome)<=4000), created_at timestamptz not null default now(),
 followup_day integer, unique(request_id,followup_day)
);
alter table public.shelter_tasks enable row level security;
revoke all on public.shelter_tasks from anon,authenticated;
grant select,insert on public.shelter_tasks to authenticated;
grant update(completed_at,outcome,assignee_id,due_at) on public.shelter_tasks to authenticated;
create policy tasks_read on public.shelter_tasks for select to authenticated using(private.shelter_access(canil_id,false));
create policy tasks_write on public.shelter_tasks for all to authenticated using(private.shelter_access(canil_id,true)) with check(private.shelter_access(canil_id,true));
create function private.guard_task() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.animal_id is not null and not exists(select 1 from public.animais where id=new.animal_id and canil_id=new.canil_id) then raise exception 'Invalid task animal'; end if;
 if new.request_id is not null and not exists(select 1 from public.pedidos_adocao where id=new.request_id and canil_id=new.canil_id and animal_id=new.animal_id) then raise exception 'Invalid task request'; end if;
 if new.assignee_id is not null and not exists(select 1 from public.canis where id=new.canil_id and owner_profile_id=new.assignee_id) and not exists(select 1 from public.shelter_memberships where canil_id=new.canil_id and profile_id=new.assignee_id and role='editor') then raise exception 'Invalid assignee'; end if;
 return new;
end $$;
create trigger task_guard before insert or update on public.shelter_tasks for each row execute function private.guard_task();
create table public.request_internal_notes (
 request_id uuid primary key references public.pedidos_adocao(id), notes text not null default '' check(length(notes)<=8000), assignee_id uuid references public.profiles(id), updated_at timestamptz not null default now()
);
alter table public.request_internal_notes enable row level security;
revoke all on public.request_internal_notes from anon,authenticated;
grant select,insert,update on public.request_internal_notes to authenticated;
create policy request_notes_read on public.request_internal_notes for select to authenticated using(exists(select 1 from public.pedidos_adocao where id=request_id and private.shelter_access(canil_id,false)));
create policy request_notes_write on public.request_internal_notes for all to authenticated using(exists(select 1 from public.pedidos_adocao where id=request_id and private.shelter_access(canil_id,true))) with check(exists(select 1 from public.pedidos_adocao where id=request_id and private.shelter_access(canil_id,true)));
create function private.animal_state_sync() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (new.status='adotado' and old.status<>'adotado') or (new.archived_at is not null and old.archived_at is null) then
  update public.pedidos_adocao set status='rejeitado',reviewed_at=now() where animal_id=new.id and status in ('pendente','entrevista','aprovado');
  update public.visitas set status='cancelada' where animal_id=new.id and status in ('proposta','confirmada');
 end if;
 return new;
end $$;
-- The completed request already has its final state when the existing AFTER trigger changes the animal.
create trigger animal_state_sync after update on public.animais for each row execute function private.animal_state_sync();
create function public.manage_animal(p_animal uuid,p_operation text) returns void language plpgsql security definer set search_path='' as $$
declare a public.animais;
begin
 select * into a from public.animais where id=p_animal for update;
 if a.id is null or not private.shelter_access(a.canil_id,true) then raise exception 'Animal access denied'; end if;
 if p_operation='archive' then update public.animais set archived_at=now(),published=false where id=a.id;
 elsif p_operation='restore' then update public.animais set archived_at=null where id=a.id;
 elsif p_operation='publish' then
  if a.archived_at is not null or not exists(select 1 from public.canis where id=a.canil_id and verificado) then raise exception 'Verified active shelter required'; end if;
  update public.animais set published=true where id=a.id;
 elsif p_operation='unpublish' then update public.animais set published=false where id=a.id;
 elsif p_operation in ('disponivel','reservado','em_tratamento','adotado') then
  if a.status='adotado' and p_operation<>'adotado' then raise exception 'Completed adoption status is final'; end if;
  update public.animais set status=p_operation where id=a.id;
 else raise exception 'Invalid operation'; end if;
end $$;
revoke all on function public.manage_animal(uuid,text) from public;
grant execute on function public.manage_animal(uuid,text) to authenticated;
create function private.request_visibility() returns trigger language plpgsql security definer set search_path='' as $$
declare a public.animais;
begin
 select * into a from public.animais where id=new.animal_id;
 if a.archived_at is not null or not a.published or not exists(select 1 from public.canis where id=a.canil_id and verificado) then raise exception 'Animal unavailable'; end if;
 return new;
end $$;
create trigger request_visibility before insert on public.pedidos_adocao for each row execute function private.request_visibility();
create function private.followup_tasks() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='concluido' and old.status<>'concluido' then
  insert into public.shelter_tasks(canil_id,animal_id,request_id,title,due_at,followup_day)
  select new.canil_id,new.animal_id,new.id,'Pós-adoção / Follow-up · '||d||' dias/days',now()+make_interval(days=>d),d from unnest(array[7,30,90]) d on conflict do nothing;
 end if; return new;
end $$;
create trigger request_followup after update on public.pedidos_adocao for each row execute function private.followup_tasks();
create function public.withdraw_adoption(p_request uuid) returns void language plpgsql security definer set search_path='' as $$
declare r public.pedidos_adocao;
begin
 select * into r from public.pedidos_adocao where id=p_request;
 perform 1 from public.animais where id=r.animal_id for update;
 if r.applicant_profile_id is distinct from auth.uid() or auth.uid() is null then raise exception 'Request access denied'; end if;
 update public.pedidos_adocao set status='rejeitado',observacoes_canil='Candidatura retirada pelo adotante / Withdrawn by applicant',reviewed_at=now() where id=r.id and status in ('pendente','entrevista','aprovado');
 update public.visitas set status='cancelada' where pedido_id=r.id and status in ('proposta','confirmada');
end $$;
revoke all on function public.withdraw_adoption(uuid) from public;
grant execute on function public.withdraw_adoption(uuid) to authenticated;
-- Minimum audit data: no document contents or health notes in the audit log.
create function private.audit_record() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.audit_events(actor_id,entity,entity_id,operation) values(auth.uid(),tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(new)->>'animal_id',to_jsonb(new)->>'request_id',to_jsonb(old)->>'id'),tg_op);
 return coalesce(new,old);
end $$;
create trigger animal_audit after update on public.animais for each row execute function private.audit_record();
create trigger document_audit after insert or update or delete on public.animal_documents for each row execute function private.audit_record();
create trigger share_audit after insert or update on public.document_shares for each row execute function private.audit_record();
create trigger record_audit after insert or update on public.animal_records for each row execute function private.audit_record();
create trigger task_audit after insert or update on public.shelter_tasks for each row execute function private.audit_record();
commit;
