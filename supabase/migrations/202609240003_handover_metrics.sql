begin;
create table public.shelter_handover_settings(canil_id uuid primary key references public.canis(id),items text[] not null default array['Identificação conferida / Identification checked','Cuidados explicados / Care explained','Documentos de entrega / Handover documents'],required boolean not null default false,check(cardinality(items) between 1 and 20));
alter table public.shelter_handover_settings enable row level security;
revoke all on public.shelter_handover_settings from anon,authenticated;
grant select,insert,update on public.shelter_handover_settings to authenticated;
create policy checklist_read on public.shelter_handover_settings for select to authenticated using(private.shelter_access(canil_id,false));
create policy checklist_write on public.shelter_handover_settings for all to authenticated using(exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid())) with check(exists(select 1 from public.canis where id=canil_id and owner_profile_id=auth.uid()));
create table public.animal_handover(animal_id uuid primary key references public.animais(id),checked_items text[] not null default '{}',confirmed_by uuid not null default auth.uid() references public.profiles(id),confirmed_at timestamptz not null default now());
alter table public.animal_handover enable row level security;
revoke all on public.animal_handover from anon,authenticated;
grant select,insert,update on public.animal_handover to authenticated;
create policy handover_read on public.animal_handover for select to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,false)));
create policy handover_write on public.animal_handover for all to authenticated using(exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true))) with check(confirmed_by=auth.uid() and exists(select 1 from public.animais where id=animal_id and private.shelter_access(canil_id,true)));
create function private.check_handover() returns trigger language plpgsql security definer set search_path='' as $$
declare settings public.shelter_handover_settings;
begin
 if new.status='adotado' and old.status<>'adotado' then
  select * into settings from public.shelter_handover_settings where canil_id=new.canil_id;
  if settings.required and not exists(select 1 from public.animal_handover where animal_id=new.id and checked_items @> settings.items) then raise exception 'Complete the handover checklist before adoption'; end if;
 end if;
 return new;
end $$;
create trigger animal_check_handover before update on public.animais for each row execute function private.check_handover();
create trigger handover_audit after insert or update on public.animal_handover for each row execute function private.audit_record();
create function public.shelter_metrics(p_shelter uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.shelter_access(p_shelter,false) then raise exception 'Access denied'; end if;
 return jsonb_build_object(
 'active_animals',(select count(*) from public.animais where canil_id=p_shelter and archived_at is null and status<>'adotado'),
 'active_requests',(select count(*) from public.pedidos_adocao where canil_id=p_shelter and status in ('pendente','entrevista','aprovado')),
 'unreviewed_over_48h',(select count(*) from public.pedidos_adocao where canil_id=p_shelter and reviewed_at is null and status='pendente' and created_at<now()-interval '48 hours'),
 'completed_adoptions',(select count(*) from public.pedidos_adocao where canil_id=p_shelter and status='concluido'),
 'overdue_tasks',(select count(*) from public.shelter_tasks where canil_id=p_shelter and completed_at is null and due_at<now()),
 'followups_due',(select count(*) from public.shelter_tasks where canil_id=p_shelter and followup_day is not null and due_at<=now()),
 'followups_done',(select count(*) from public.shelter_tasks where canil_id=p_shelter and followup_day is not null and due_at<=now() and completed_at is not null),
 'average_review_hours',(select round(avg(extract(epoch from (reviewed_at-created_at))/3600),1) from public.pedidos_adocao where canil_id=p_shelter and reviewed_at is not null)
 );
end $$;
revoke all on function public.shelter_metrics(uuid) from public;
grant execute on function public.shelter_metrics(uuid) to authenticated;
commit;
