-- Durable queue. No browser role can read tasks or invoke orchestration RPCs.
create table public.trello_jobs (
 card_id text primary key check (card_id ~ '^[a-f0-9]{24}$'),
 state text not null default 'READY' check(state in ('READY','CLAIMED','IN_PROGRESS','PAUSED','REVIEW','DONE','FAILED')),
 branch text, run_id uuid, owner text, claimed_at timestamptz,
 attempts integer not null default 0, next_attempt_at timestamptz not null default now(),
 checkpoint jsonb not null default '{}', delivery_pending boolean not null default false,
 updated_at timestamptz not null default now()
);
create table public.trello_events (
 event_id text primary key, card_id text not null, received_at timestamptz not null default now()
);
alter table public.trello_jobs enable row level security;
alter table public.trello_events enable row level security;
revoke all on public.trello_jobs, public.trello_events from anon, authenticated;
grant all on public.trello_jobs, public.trello_events to service_role;

create function public.trello_enqueue(p_event text, p_card text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
 insert into trello_events(event_id,card_id) values(p_event,p_card) on conflict do nothing;
 if not found then return false; end if;
 insert into trello_jobs(card_id) values(p_card) on conflict do nothing;
 return found;
end $$;

-- Claims never expire automatically: a disconnected worker may still be running.
create function public.trello_claim(p_run uuid,p_owner text) returns setof public.trello_jobs
language sql security definer set search_path = public as $$
 update trello_jobs set state='CLAIMED',run_id=p_run,owner=p_owner,claimed_at=now(),
 attempts=attempts+1,updated_at=now()
 where card_id=(select card_id from trello_jobs where state in ('READY','PAUSED')
 and next_attempt_at<=now() order by next_attempt_at for update skip locked limit 1)
 returning *;
$$;
create function public.trello_save(p_card text,p_run uuid,p_state text,p_branch text,p_checkpoint jsonb,p_delivery boolean,p_delay integer)
returns boolean language plpgsql security definer set search_path = public as $$
begin
 if p_state not in ('IN_PROGRESS','PAUSED','REVIEW','FAILED') then raise exception 'Invalid transition'; end if;
 update trello_jobs set state=p_state,branch=p_branch,checkpoint=p_checkpoint,delivery_pending=p_delivery,
 next_attempt_at=now()+make_interval(secs=>greatest(p_delay,0)),updated_at=now()
 where card_id=p_card and run_id=p_run and state in ('CLAIMED','IN_PROGRESS');
 return found;
end $$;
revoke all on function public.trello_enqueue(text,text),public.trello_claim(uuid,text),public.trello_save(text,uuid,text,text,jsonb,boolean,integer) from public,anon,authenticated;
grant execute on function public.trello_enqueue(text,text),public.trello_claim(uuid,text),public.trello_save(text,uuid,text,text,jsonb,boolean,integer) to service_role;
