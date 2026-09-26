begin;
create table public.visit_slots(id uuid primary key default gen_random_uuid(),canil_id uuid not null references public.canis(id),starts_at timestamptz not null,capacity integer not null check(capacity between 1 and 20),unique(canil_id,starts_at));
alter table public.visit_slots enable row level security;
revoke all on public.visit_slots from anon,authenticated;
grant select,insert,delete on public.visit_slots to authenticated;
create policy slots_read on public.visit_slots for select to authenticated using(private.shelter_access(canil_id,false) or exists(select 1 from public.pedidos_adocao where canil_id=visit_slots.canil_id and applicant_profile_id=auth.uid() and status in ('pendente','entrevista','aprovado')));
create policy slots_insert on public.visit_slots for insert to authenticated with check(private.shelter_access(canil_id,true) and starts_at>now());
create policy slots_delete on public.visit_slots for delete to authenticated using(private.shelter_access(canil_id,true) and not exists(select 1 from public.visitas where canil_id=visit_slots.canil_id and scheduled_at=visit_slots.starts_at and status in ('proposta','confirmada')));
create function private.visit_capacity() returns trigger language plpgsql security definer set search_path='' as $$
declare slot public.visit_slots;
begin
 if new.status not in ('proposta','confirmada') then return new; end if;
 -- Serialise bookings per shelter even if no slot exists yet.
 perform 1 from public.canis where id=new.canil_id for update;
 if exists(select 1 from public.visit_slots where canil_id=new.canil_id and starts_at>now()) then
  select * into slot from public.visit_slots where canil_id=new.canil_id and starts_at=new.scheduled_at for update;
  if slot.id is null then raise exception 'Choose an available visit slot'; end if;
  if (select count(*) from public.visitas where canil_id=new.canil_id and scheduled_at=new.scheduled_at and id<>new.id and status in ('proposta','confirmada'))>=slot.capacity then raise exception 'Visit slot is full'; end if;
 end if;
 return new;
end $$;
create trigger visits_capacity before insert or update on public.visitas for each row execute function private.visit_capacity();
create function public.reschedule_visit(p_visit uuid,p_date timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare v public.visitas; result uuid;
begin
 select * into v from public.visitas where id=p_visit;
 if v.id is null or auth.uid() is null or not (v.applicant_profile_id=auth.uid() or private.shelter_access(v.canil_id,true)) then raise exception 'Visit access denied'; end if;
 perform 1 from public.canis where id=v.canil_id for update;
 select * into v from public.visitas where id=p_visit for update;
 if v.status not in ('proposta','confirmada') or p_date<=now() then raise exception 'Invalid reschedule'; end if;
 update public.visitas set status='cancelada' where id=v.id;
 insert into public.visitas(pedido_id,canil_id,animal_id,applicant_profile_id,scheduled_at,notas) values(v.pedido_id,v.canil_id,v.animal_id,v.applicant_profile_id,p_date,v.notas) returning id into result;
 return result;
end $$;
revoke all on function public.reschedule_visit(uuid,timestamptz) from public;
grant execute on function public.reschedule_visit(uuid,timestamptz) to authenticated;
commit;
