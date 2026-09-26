begin;
alter table public.email_outbox add column task_id uuid references public.shelter_tasks(id),add column visit_id uuid references public.visitas(id),add column cancelled_at timestamptz;
create unique index task_email_once on public.email_outbox(task_id) where task_id is not null;
create unique index visit_email_once on public.email_outbox(visit_id) where visit_id is not null;
create function private.queue_task_reminder() returns trigger language plpgsql security definer set search_path='' as $$
declare email_address text;
begin
 if new.completed_at is not null then update public.email_outbox set cancelled_at=now() where task_id=new.id and sent_at is null; return new; end if;
 if new.assignee_id is not null then select email into email_address from public.profiles where id=new.assignee_id;
 else select email_contacto into email_address from public.canis where id=new.canil_id; end if;
 if email_address is not null then
 insert into public.email_outbox(recipient,animal_name,task_id,available_at) values(email_address,new.title,new.id,greatest(now(),new.due_at))
 on conflict(task_id) where task_id is not null do update set available_at=excluded.available_at,recipient=excluded.recipient where email_outbox.sent_at is null and email_outbox.locked_at is null;
 end if;return new;
end $$;
create trigger task_reminder after insert or update on public.shelter_tasks for each row execute function private.queue_task_reminder();
create function private.queue_visit_reminder() returns trigger language plpgsql security definer set search_path='' as $$
declare email_address text; animal_name text;
begin
 if new.status in ('cancelada','realizada') then update public.email_outbox set cancelled_at=now() where visit_id=new.id and sent_at is null; return new; end if;
 if new.status='confirmada' then
 select email into email_address from public.profiles where id=new.applicant_profile_id;
 select nome into animal_name from public.animais where id=new.animal_id;
 insert into public.email_outbox(recipient,animal_name,visit_id,available_at) values(email_address,coalesce(animal_name,'Visita / Visit'),new.id,greatest(now(),new.scheduled_at-interval '24 hours')) on conflict(visit_id) where visit_id is not null do nothing;
 end if; return new;
end $$;
create trigger visit_reminder after update on public.visitas for each row execute function private.queue_visit_reminder();
create or replace function public.claim_email_jobs() returns setof public.email_outbox
language sql security definer set search_path='' as $$
 update public.email_outbox set attempts=attempts+1,locked_at=now(),available_at=now()+interval '10 minutes'
 where id in (select id from public.email_outbox where sent_at is null and cancelled_at is null and attempts<5 and available_at<=now() and (locked_at is null or locked_at<now()-interval '10 minutes') order by created_at for update skip locked limit 20) returning *;
$$;
commit;
