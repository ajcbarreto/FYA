begin;
create table public.animal_timeline (
 id uuid primary key default gen_random_uuid(), animal_id uuid not null references public.animais(id),
 kind text not null, details jsonb not null default '{}', occurred_at timestamptz not null default now(), actor_id uuid references public.profiles(id) on delete set null
);
create index animal_timeline_order on public.animal_timeline(animal_id,occurred_at desc,id desc);
alter table public.animal_timeline enable row level security;
revoke all on public.animal_timeline from anon,authenticated;
grant select on public.animal_timeline to authenticated;
create policy timeline_team on public.animal_timeline for select to authenticated using(exists(select 1 from public.animais a where a.id=animal_id and private.shelter_access(a.canil_id,false)));
insert into public.animal_timeline(animal_id,kind,occurred_at) select id,'registered',created_at from public.animais;
insert into public.animal_timeline(animal_id,kind) select id,'history_started' from public.animais;
create function private.capture_animal_timeline() returns trigger language plpgsql security definer set search_path='' as $$
declare row_data jsonb; previous jsonb; animal uuid; event text; detail jsonb='{}';
begin
 row_data=case when TG_OP='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 previous=case when TG_OP='INSERT' then '{}'::jsonb else to_jsonb(old) end;
 animal=case when TG_TABLE_NAME='animais' then (row_data->>'id')::uuid else (row_data->>'animal_id')::uuid end;
 if animal is null then return null; end if;
 case TG_TABLE_NAME
 when 'animais' then
  if TG_OP='INSERT' then event='registered';
  elsif row_data->'archived_at' is distinct from previous->'archived_at' then event=case when row_data->>'archived_at' is null then 'restored' else 'archived' end;
  elsif row_data->'status' is distinct from previous->'status' then event='status_changed'; detail=jsonb_build_object('from',previous->>'status','to',row_data->>'status');
  elsif row_data->'published' is distinct from previous->'published' then event='publication_changed'; detail=jsonb_build_object('published',row_data->'published');
  else event='public_details_updated'; end if;
 when 'animal_handover' then event='handover_updated';
 when 'animal_records' then event='record_updated'; detail=jsonb_build_object('intake_date',row_data->>'intake_date');
 when 'animal_documents' then event=case TG_OP when 'INSERT' then 'document_added' when 'DELETE' then 'document_removed' else 'document_updated' end; detail=jsonb_build_object('title',row_data->>'title');
 when 'document_shares' then event=case when row_data->>'revoked_at' is not null then 'share_revoked' else 'dossier_shared' end;
 when 'pedidos_adocao' then
  if TG_OP='INSERT' then event='application_received';
  elsif row_data->'status' is distinct from previous->'status' then event='application_status_changed'; detail=jsonb_build_object('to',row_data->>'status');
  else return null; end if;
 when 'visitas' then event='visit_updated'; detail=jsonb_build_object('status',row_data->>'status','scheduled_at',row_data->>'scheduled_at');
 when 'shelter_tasks' then event=case when row_data->>'completed_at' is not null then 'task_completed' else 'task_updated' end; detail=jsonb_build_object('title',row_data->>'title','due_at',row_data->>'due_at');
 else return null;
 end case;
 insert into public.animal_timeline(animal_id,kind,details,actor_id) values(animal,event,detail,auth.uid());
 return null;
end $$;
create trigger timeline_animals after insert or update on public.animais for each row execute function private.capture_animal_timeline();
create trigger timeline_handover after insert or update on public.animal_handover for each row execute function private.capture_animal_timeline();
create trigger timeline_records after insert or update on public.animal_records for each row execute function private.capture_animal_timeline();
create trigger timeline_documents after insert or update or delete on public.animal_documents for each row execute function private.capture_animal_timeline();
create trigger timeline_shares after insert or update on public.document_shares for each row execute function private.capture_animal_timeline();
create trigger timeline_applications after insert or update on public.pedidos_adocao for each row execute function private.capture_animal_timeline();
create trigger timeline_visits after insert or update on public.visitas for each row execute function private.capture_animal_timeline();
create trigger timeline_tasks after insert or update on public.shelter_tasks for each row execute function private.capture_animal_timeline();

create table public.pilot_requests (
 id uuid primary key default gen_random_uuid(), organization text not null check(length(trim(organization)) between 2 and 160),
 contact_name text not null check(length(trim(contact_name)) between 2 and 120), email text not null check(length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 location text not null check(length(trim(location)) between 2 and 160), message text not null default '' check(length(message)<=2000),
 status text not null default 'new' check(status in ('new','contacted','accepted','closed')), internal_notes text not null default '' check(length(internal_notes)<=4000),
 consent_version text not null default 'pilot-contact-2026-09', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index pilot_requests_email_date on public.pilot_requests(email,created_at);
alter table public.pilot_requests enable row level security;
revoke all on public.pilot_requests from anon,authenticated;
grant select on public.pilot_requests to authenticated;
grant update(status,internal_notes,updated_at) on public.pilot_requests to authenticated;
create policy pilot_admin_read on public.pilot_requests for select to authenticated using(private.is_admin());
create policy pilot_admin_update on public.pilot_requests for update to authenticated using(private.is_admin()) with check(private.is_admin());
-- Only server-side submissions. Serialised caps also cover concurrent requests.
create function public.submit_pilot_request(p_organization text,p_contact text,p_email text,p_location text,p_message text,p_consent boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_consent is distinct from true then raise exception 'Contact acknowledgment required' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(924006);
 if (select count(*) from public.pilot_requests where created_at>now()-interval '1 hour')>=50 or (select count(*) from public.pilot_requests where email=lower(trim(p_email)) and created_at>now()-interval '1 day')>=3 then raise exception 'Submission limit' using errcode='P0001'; end if;
 insert into public.pilot_requests(organization,contact_name,email,location,message) values(trim(p_organization),trim(p_contact),lower(trim(p_email)),trim(p_location),trim(p_message));
end $$;
revoke all on function public.submit_pilot_request(text,text,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.submit_pilot_request(text,text,text,text,text,boolean) to service_role;
commit;
