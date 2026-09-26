begin;
alter table public.pedidos_adocao add column first_response_at timestamptz;
-- Historic notes have no first-edit timestamp; use their latest recorded review.
update public.pedidos_adocao r set first_response_at=(
 select min(t) from (
 select m.created_at t from public.mensagens_adocao m join public.conversas_adocao c on c.id=m.conversa_id where c.pedido_id=r.id and m.sender_profile_id<>r.applicant_profile_id
 union all select r.reviewed_at where nullif(trim(r.observacoes_canil),'') is not null
 ) responses
);
create function private.record_first_response() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_TABLE_NAME='pedidos_adocao' then
  if new.first_response_at is null and nullif(trim(new.observacoes_canil),'') is not null and new.observacoes_canil is distinct from old.observacoes_canil then new.first_response_at=now(); end if;
  return new;
 end if;
 update public.pedidos_adocao r set first_response_at=coalesce(r.first_response_at,new.created_at)
 from public.conversas_adocao c where c.id=new.conversa_id and c.pedido_id=r.id and new.sender_profile_id<>r.applicant_profile_id and r.first_response_at is null;
 return new;
end $$;
create trigger request_first_response before update on public.pedidos_adocao for each row execute function private.record_first_response();
create trigger message_first_response after insert on public.mensagens_adocao for each row execute function private.record_first_response();
create index requests_queue on public.pedidos_adocao(canil_id,status,created_at,id);

create function private.validate_request_assignee() returns trigger language plpgsql security definer set search_path='' as $$
declare shelter uuid;
begin
 select canil_id into shelter from public.pedidos_adocao where id=new.request_id;
 if new.assignee_id is not null and not exists(select 1 from public.canis where id=shelter and owner_profile_id=new.assignee_id) and not exists(select 1 from public.shelter_memberships where canil_id=shelter and profile_id=new.assignee_id and role='editor') then raise exception 'Invalid assignee' using errcode='23514'; end if;
 new.updated_at=now(); return new;
end $$;
-- Discard invalid assignments that may predate enforcement.
update public.request_internal_notes n set assignee_id=null where assignee_id is not null and not exists(select 1 from public.pedidos_adocao r join public.canis c on c.id=r.canil_id where r.id=n.request_id and (c.owner_profile_id=n.assignee_id or exists(select 1 from public.shelter_memberships m where m.canil_id=c.id and m.profile_id=n.assignee_id and m.role='editor')));
create trigger request_assignee_check before insert or update on public.request_internal_notes for each row execute function private.validate_request_assignee();
create function private.release_request_assignments() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' or new.role<>'editor' then
 update public.request_internal_notes n set assignee_id=null from public.pedidos_adocao r where n.request_id=r.id and r.canil_id=old.canil_id and n.assignee_id=old.profile_id;
 end if; return null;
end $$;
create trigger member_release_requests after delete or update of role on public.shelter_memberships for each row execute function private.release_request_assignments();

create table public.shelter_reply_templates (
 id uuid primary key default gen_random_uuid(), canil_id uuid not null references public.canis(id),
 title text not null check(length(trim(title)) between 1 and 100), body text not null check(length(trim(body)) between 1 and 3000),
 updated_at timestamptz not null default now()
);
alter table public.shelter_reply_templates enable row level security;
revoke all on public.shelter_reply_templates from anon,authenticated;
grant select,insert,delete on public.shelter_reply_templates to authenticated;
grant update(title,body,updated_at) on public.shelter_reply_templates to authenticated;
create policy templates_read on public.shelter_reply_templates for select to authenticated using(private.shelter_access(canil_id,false));
create policy templates_write on public.shelter_reply_templates for all to authenticated using(private.shelter_access(canil_id,true)) with check(private.shelter_access(canil_id,true));

create function public.search_shelter_requests(p_shelter uuid,p_query text default '',p_status text default '',p_assignee text default '',p_min_days integer default 0,p_unanswered boolean default false,p_order text default 'oldest',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not private.shelter_access(p_shelter,false) then raise exception 'Forbidden' using errcode='42501'; end if;
 if length(p_query)>160 or p_min_days not between 0 and 36500 or p_status not in ('','pendente','entrevista','aprovado','rejeitado','concluido') or p_order not in ('oldest','newest') then raise exception 'Invalid filters' using errcode='22023'; end if;
 with filtered as materialized (
 select r.*,to_jsonb(a) animais,jsonb_build_object('nome',c.nome,'localizacao',c.localizacao) canis,jsonb_build_object('full_name',p.full_name,'email',p.email) profiles,n.assignee_id,
 (r.first_response_at is null and r.status in ('pendente','entrevista','aprovado')) unanswered
 from public.pedidos_adocao r join public.animais a on a.id=r.animal_id join public.canis c on c.id=r.canil_id join public.profiles p on p.id=r.applicant_profile_id left join public.request_internal_notes n on n.request_id=r.id
 where r.canil_id=p_shelter
 and (p_query='' or strpos(lower(concat_ws(' ',a.nome,p.full_name,p.email)),lower(p_query))>0)
 and (p_status='' or r.status=p_status)
 and (p_assignee='' or (p_assignee='unassigned' and n.assignee_id is null) or n.assignee_id::text=p_assignee)
 and r.created_at<=now()-make_interval(days=>p_min_days)
 and (not p_unanswered or (r.first_response_at is null and r.status in ('pendente','entrevista','aprovado')))
 ), total as (select count(*) n from filtered), paged as (
 select * from filtered order by case when p_order='oldest' then created_at end asc,case when p_order='newest' then created_at end desc,id
 limit 25 offset (least(greatest(p_page,1),greatest(1,ceil((select n from total)/25.0)::int))-1)*25
 ) select jsonb_build_object('total',(select n from total),'page',least(greatest(p_page,1),greatest(1,ceil((select n from total)/25.0)::int)),'items',coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]'::jsonb)) into result;
 return result;
end $$;

create function public.reply_to_application(p_request uuid,p_message_id uuid,p_body text) returns void language plpgsql security definer set search_path='' as $$
declare r public.pedidos_adocao; conversation uuid; existing public.mensagens_adocao;
begin
 select * into r from public.pedidos_adocao where id=p_request;
 if r.id is null or not private.shelter_access(r.canil_id,true) then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_message_id is null or p_body is null or length(trim(p_body)) not between 1 and 4000 then raise exception 'Invalid message' using errcode='22023'; end if;
 select id into conversation from public.conversas_adocao where pedido_id=r.id;
 if conversation is null then raise exception 'Conversation unavailable' using errcode='23514'; end if;
 insert into public.mensagens_adocao(id,conversa_id,sender_profile_id,conteudo) values(p_message_id,conversation,auth.uid(),trim(p_body)) on conflict(id) do nothing;
 select * into existing from public.mensagens_adocao where id=p_message_id;
 if existing.conversa_id<>conversation or existing.sender_profile_id<>auth.uid() or existing.conteudo<>trim(p_body) then raise exception 'Conflicting retry' using errcode='23514'; end if;
end $$;
revoke all on function public.search_shelter_requests(uuid,text,text,text,integer,boolean,text,integer),public.reply_to_application(uuid,uuid,text) from public;
grant execute on function public.search_shelter_requests(uuid,text,text,text,integer,boolean,text,integer),public.reply_to_application(uuid,uuid,text) to authenticated;
commit;
