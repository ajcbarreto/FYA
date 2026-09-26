begin;
create table public.support_projects (
 id uuid primary key default gen_random_uuid(),canil_id uuid not null references public.canis(id),animal_id uuid references public.animais(id),
 kind text not null check(kind in ('money','goods')),title text not null check(length(trim(title)) between 3 and 160),description text not null check(length(trim(description)) between 10 and 4000),
 goal bigint not null check(goal between 1 and 100000000),unit text not null check(length(trim(unit)) between 1 and 40),
 donation_url text check(donation_url is null or (length(donation_url)<=2000 and donation_url ~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$')),
 deadline date, published boolean not null default false,status text not null default 'active' check(status in ('active','closed')),
 received bigint not null default 0 check(received>=0),created_at timestamptz not null default now(),
 check(kind<>'money' or unit='EUR')
);
alter table public.support_projects enable row level security;
revoke all on public.support_projects from anon,authenticated;
grant select on public.support_projects to anon,authenticated;
grant insert(canil_id,animal_id,kind,title,description,goal,unit,donation_url,deadline,published,status) on public.support_projects to authenticated;
grant update(title,description,goal,donation_url,deadline,published,status) on public.support_projects to authenticated;
create function private.public_support(project uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.support_projects p join public.canis c on c.id=p.canil_id where p.id=project and p.published and c.verificado); $$;
revoke all on function private.public_support(uuid) from public;grant execute on function private.public_support(uuid) to anon,authenticated;
create policy support_public_read on public.support_projects for select to anon,authenticated using((published and exists(select 1 from public.canis c where c.id=canil_id and c.verificado)) or private.shelter_access(canil_id,false));
create policy support_insert on public.support_projects for insert to authenticated with check(private.shelter_access(canil_id,true));
create policy support_update on public.support_projects for update to authenticated using(private.shelter_access(canil_id,true)) with check(private.shelter_access(canil_id,true));
create function private.guard_support_project() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.animal_id is not null and not exists(select 1 from public.animais where id=new.animal_id and canil_id=new.canil_id) then raise exception 'Invalid animal'; end if;
 if new.published and not exists(select 1 from public.canis where id=new.canil_id and verificado) then raise exception 'Verification required'; end if;
 return new;
end $$;
create trigger guard_support_project before insert or update of animal_id,published on public.support_projects for each row execute function private.guard_support_project();
create table public.support_updates(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.support_projects(id),body text not null check(length(trim(body)) between 3 and 2000),created_at timestamptz not null default now());
alter table public.support_updates enable row level security;revoke all on public.support_updates from anon,authenticated;
grant select on public.support_updates to anon,authenticated;grant insert(project_id,body),delete on public.support_updates to authenticated;
create policy update_read on public.support_updates for select to anon,authenticated using(private.public_support(project_id) or exists(select 1 from public.support_projects p where p.id=project_id and private.shelter_access(p.canil_id,false)));
create policy update_write on public.support_updates for all to authenticated using(exists(select 1 from public.support_projects p where p.id=project_id and private.shelter_access(p.canil_id,true))) with check(exists(select 1 from public.support_projects p where p.id=project_id and private.shelter_access(p.canil_id,true)));
create table public.support_pledges (
 id uuid primary key,project_id uuid not null references public.support_projects(id),profile_id uuid not null references public.profiles(id),quantity bigint not null check(quantity between 1 and 1000000),
 contact_name text not null,contact_email text not null,message text not null default '' check(length(message)<=1000),status text not null default 'pending' check(status in ('pending','received','cancelled')),created_at timestamptz not null default now()
);
alter table public.support_pledges enable row level security;revoke all on public.support_pledges from anon,authenticated;grant select on public.support_pledges to authenticated;
create policy pledge_read on public.support_pledges for select to authenticated using(profile_id=auth.uid() or exists(select 1 from public.support_projects p where p.id=project_id and private.shelter_access(p.canil_id,false)));
create table public.support_receipts (
 id uuid primary key,project_id uuid not null references public.support_projects(id),pledge_id uuid unique references public.support_pledges(id),quantity bigint not null check(quantity between 1 and 100000000),
 note text not null default '' check(length(note)<=1000),created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),voided_at timestamptz,void_reason text check(length(void_reason)<=1000)
);
alter table public.support_receipts enable row level security;revoke all on public.support_receipts from anon,authenticated;grant select on public.support_receipts to authenticated;
create policy receipt_read on public.support_receipts for select to authenticated using(exists(select 1 from public.support_projects p where p.id=project_id and private.shelter_access(p.canil_id,false)));
create index support_project_shelter on public.support_projects(canil_id,created_at desc);
create index support_pledge_project on public.support_pledges(project_id,created_at desc);
create index support_receipt_project on public.support_receipts(project_id,created_at desc);
create function public.pledge_support(p_id uuid,p_project uuid,p_quantity bigint,p_message text) returns void language plpgsql security definer set search_path='' as $$
declare p public.support_projects; existing public.support_pledges;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 select * into p from public.support_projects where id=p_project for update;
 select * into existing from public.support_pledges where id=p_id;
 if existing.id is not null then
  if existing.profile_id=auth.uid() and existing.project_id=p_project and existing.quantity=p_quantity and existing.message=trim(p_message) then return; end if;
  raise exception 'Conflicting retry';
 end if;
 if p.kind<>'goods' or p.id is null or not private.public_support(p.id) or p.status<>'active' or (p.deadline is not null and p.deadline<current_date) then raise exception 'Unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,25));
 if (select count(*) from public.support_pledges where profile_id=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'Too many pledges'; end if;
 insert into public.support_pledges(id,project_id,profile_id,quantity,contact_name,contact_email,message) select p_id,p.id,auth.uid(),p_quantity,coalesce(full_name,''),email,trim(p_message) from public.profiles where id=auth.uid();
end $$;
create function public.record_support_receipt(p_id uuid,p_project uuid,p_quantity bigint,p_note text,p_pledge uuid default null) returns void language plpgsql security definer set search_path='' as $$
declare p public.support_projects; pledge public.support_pledges; existing public.support_receipts;
begin
 select * into p from public.support_projects where id=p_project for update;
 if p.id is null or not private.shelter_access(p.canil_id,true) then raise exception 'Forbidden'; end if;
 select * into existing from public.support_receipts where id=p_id;
 if existing.id is not null then
  if existing.project_id=p.id and existing.quantity=p_quantity and existing.pledge_id is not distinct from p_pledge and existing.note=trim(p_note) then return; end if;
  raise exception 'Conflicting retry';
 end if;
 if p_pledge is not null then
  select * into pledge from public.support_pledges where id=p_pledge for update;
  if pledge.id is null or pledge.project_id<>p.id or pledge.status<>'pending' or p_quantity<>pledge.quantity then raise exception 'Invalid pledge receipt'; end if;
  update public.support_pledges set status='received' where id=p_pledge;
 end if;
 insert into public.support_receipts(id,project_id,pledge_id,quantity,note,created_by) values(p_id,p.id,p_pledge,p_quantity,trim(p_note),auth.uid());
 update public.support_projects set received=received+p_quantity where id=p.id;
end $$;
create function public.cancel_support_pledge(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare project uuid; r public.support_pledges;
begin
 select project_id into project from public.support_pledges where id=p_id;
 perform 1 from public.support_projects where id=project for update;
 select * into r from public.support_pledges where id=p_id for update;
 if auth.uid() is null or r.id is null or not(r.profile_id=auth.uid() or exists(select 1 from public.support_projects p where p.id=r.project_id and private.shelter_access(p.canil_id,true))) then raise exception 'Forbidden'; end if;
 if r.status='received' then raise exception 'Already received'; end if;
 update public.support_pledges set status='cancelled' where id=p_id;
end $$;
create function public.void_support_receipt(p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare project uuid;r public.support_receipts;
begin
 select project_id into project from public.support_receipts where id=p_id;
 perform 1 from public.support_projects where id=project for update;
 select * into r from public.support_receipts where id=p_id for update;
 if r.id is null or not exists(select 1 from public.support_projects p where p.id=r.project_id and private.shelter_access(p.canil_id,true)) then raise exception 'Forbidden'; end if;
 if r.voided_at is not null then return; end if;
 if length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Reason required'; end if;
 update public.support_receipts set voided_at=now(),void_reason=trim(p_reason) where id=r.id;
 update public.support_projects set received=received-r.quantity where id=project;
 -- A correction cancels the promise; it does not manufacture another delivery.
 update public.support_pledges set status='cancelled' where id=r.pledge_id;
end $$;
revoke all on function public.pledge_support(uuid,uuid,bigint,text),public.record_support_receipt(uuid,uuid,bigint,text,uuid),public.cancel_support_pledge(uuid),public.void_support_receipt(uuid,text) from public;
grant execute on function public.pledge_support(uuid,uuid,bigint,text),public.record_support_receipt(uuid,uuid,bigint,text,uuid),public.cancel_support_pledge(uuid),public.void_support_receipt(uuid,text) to authenticated;
commit;
