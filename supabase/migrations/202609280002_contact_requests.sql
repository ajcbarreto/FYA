begin;
create table public.contact_requests (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('partnership','help')),
 canil_id uuid references public.canis(id) on delete cascade,
 created_by uuid references public.profiles(id) on delete set null,
 organization text not null check(length(organization) between 2 and 160),
 contact_name text not null check(length(contact_name) between 2 and 120),
 email text not null check(length(email) between 3 and 254),
 website text not null default '' check(length(website)<=500),
 category text not null check(category in ('sponsorship','advertising','goods','services','technical','account','operations','other')),
 subject text not null check(length(subject) between 3 and 160),
 message text not null check(length(message) between 10 and 4000),
 status text not null default 'new' check(status in ('new','reviewing','negotiating','accepted','declined','in_progress','waiting','resolved','closed')),
 priority text not null default 'normal' check(priority in ('normal','high')),
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((kind='help' and canil_id is not null) or (kind='partnership' and canil_id is null)),
 check((kind='partnership' and status in ('new','reviewing','negotiating','accepted','declined','closed')) or (kind='help' and status in ('new','in_progress','waiting','resolved','closed')))
);
create index contact_queue on public.contact_requests(kind,status,created_at);
create index contact_shelter on public.contact_requests(canil_id,created_at);
create index contact_rate on public.contact_requests(lower(email),created_at);
create table public.contact_request_events (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.contact_requests(id) on delete cascade,
 actor_id uuid references public.profiles(id) on delete set null,
 body text not null check(length(body) between 1 and 4000), internal boolean not null default false,
 status text, priority text, created_at timestamptz not null default now()
);
create index contact_events_request on public.contact_request_events(request_id,created_at);
alter table public.contact_requests enable row level security;
alter table public.contact_request_events enable row level security;
revoke all on public.contact_requests,public.contact_request_events from anon,authenticated;
grant select on public.contact_requests,public.contact_request_events to authenticated;
create policy contact_read on public.contact_requests for select to authenticated using(private.is_admin() or (kind='help' and private.shelter_access(canil_id,false)));
create policy contact_events_read on public.contact_request_events for select to authenticated using(private.is_admin() or (not internal and exists(select 1 from public.contact_requests r where r.id=request_id and r.kind='help' and private.shelter_access(r.canil_id,false))));
create function public.contact_requests_version() returns integer language sql stable as $$ select 1 $$;
revoke all on function public.contact_requests_version() from public;
grant execute on function public.contact_requests_version() to anon,authenticated;
create function public.submit_partnership(p_organization text,p_contact text,p_email text,p_website text,p_category text,p_subject text,p_message text,p_consent boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid; email_value text:=lower(trim(p_email));
begin
 if p_consent is distinct from true or p_category not in ('sponsorship','advertising','goods','services','other') or email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or (p_website<>'' and p_website !~ '^https://[^[:space:]]+$') then raise exception 'Invalid request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(email_value,42));
 if (select count(*) from public.contact_requests where lower(email)=email_value and created_at>now()-interval '24 hours')>=3 then raise exception 'Request limit reached'; end if;
 insert into public.contact_requests(kind,organization,contact_name,email,website,category,subject,message) values('partnership',trim(p_organization),trim(p_contact),email_value,trim(p_website),p_category,trim(p_subject),trim(p_message)) returning id into rid;
 return rid;
end $$;
revoke all on function public.submit_partnership(text,text,text,text,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.submit_partnership(text,text,text,text,text,text,text,boolean) to service_role;
create function public.submit_shelter_help(p_shelter uuid,p_category text,p_subject text,p_message text,p_priority text) returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid; c public.canis; p public.profiles;
begin
 if auth.uid() is null or not private.shelter_access(p_shelter,true) then raise exception 'Forbidden'; end if;
 if p_category not in ('technical','account','operations','other') then raise exception 'Invalid category'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_shelter::text,43));
 if (select count(*) from public.contact_requests where canil_id=p_shelter and created_at>now()-interval '24 hours')>=10 then raise exception 'Request limit reached'; end if;
 select * into c from public.canis where id=p_shelter;
 select * into p from public.profiles where id=auth.uid();
 insert into public.contact_requests(kind,canil_id,created_by,organization,contact_name,email,category,subject,message,priority) values('help',p_shelter,auth.uid(),c.nome,coalesce(nullif(trim(p.full_name),''),'Equipa do canil'),p.email,p_category,trim(p_subject),trim(p_message),p_priority) returning id into rid;
 return rid;
end $$;
create function public.update_contact_request(p_id uuid,p_status text,p_priority text,p_body text,p_internal boolean) returns void language plpgsql security definer set search_path='' as $$
declare r public.contact_requests; admin_user boolean:=private.is_admin();
begin
 select * into r from public.contact_requests where id=p_id for update;
 if not found or auth.uid() is null then raise exception 'Forbidden'; end if;
 if not admin_user then
  if r.kind<>'help' or not private.shelter_access(r.canil_id,true) or p_internal is distinct from false or p_status<>r.status or p_priority<>r.priority or r.status in ('resolved','closed') then raise exception 'Forbidden'; end if;
 end if;
 if length(trim(p_body)) not between 1 and 4000 or p_internal is null then raise exception 'Message required'; end if;
 -- Brand contact remains external. Administrative notes must never become public replies.
 if r.kind='partnership' and not p_internal then raise exception 'Internal notes only'; end if;
 update public.contact_requests set status=p_status,priority=p_priority,updated_at=now() where id=p_id;
 insert into public.contact_request_events(request_id,actor_id,body,internal,status,priority) values(p_id,auth.uid(),trim(p_body),p_internal,p_status,p_priority);
end $$;
revoke all on function public.submit_shelter_help(uuid,text,text,text,text), public.update_contact_request(uuid,text,text,text,boolean) from public,anon;
grant execute on function public.submit_shelter_help(uuid,text,text,text,text), public.update_contact_request(uuid,text,text,text,boolean) to authenticated;
notify pgrst,'reload schema';
commit;
