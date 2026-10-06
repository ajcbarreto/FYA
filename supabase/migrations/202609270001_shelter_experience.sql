begin;
create table public.shelter_public_details (
 canil_id uuid primary key references public.canis(id),
 visit_hours text not null default '' check(length(visit_hours)<=500),
 visit_instructions text not null default '' check(length(visit_instructions)<=2000)
);
alter table public.shelter_public_details enable row level security;
revoke all on public.shelter_public_details from anon,authenticated;
grant select on public.shelter_public_details to anon,authenticated;
grant insert(canil_id,visit_hours,visit_instructions),update(visit_hours,visit_instructions) on public.shelter_public_details to authenticated;
create policy details_read on public.shelter_public_details for select using(exists(select 1 from public.canis c where c.id=canil_id and c.verificado) or private.shelter_access(canil_id,false));
create policy details_insert on public.shelter_public_details for insert to authenticated with check(private.shelter_access(canil_id,true));
create policy details_update on public.shelter_public_details for update to authenticated using(private.shelter_access(canil_id,true)) with check(private.shelter_access(canil_id,true));
create table public.shelter_news (
 id uuid primary key default gen_random_uuid(),canil_id uuid not null references public.canis(id),
 title text not null check(length(trim(title)) between 3 and 160),body text not null check(length(trim(body)) between 10 and 3000),
 published boolean not null default false,created_at timestamptz not null default now()
);
alter table public.shelter_news enable row level security;
revoke all on public.shelter_news from anon,authenticated;
grant select on public.shelter_news to anon,authenticated;
grant insert(canil_id,title,body,published),update(title,body,published) on public.shelter_news to authenticated;
create policy news_read on public.shelter_news for select using((published and exists(select 1 from public.canis c where c.id=canil_id and c.verificado)) or private.shelter_access(canil_id,false));
create policy news_insert on public.shelter_news for insert to authenticated with check(private.shelter_access(canil_id,true) and (not published or exists(select 1 from public.canis c where c.id=canil_id and c.verificado)));
create policy news_update on public.shelter_news for update to authenticated using(private.shelter_access(canil_id,true)) with check(private.shelter_access(canil_id,true) and (not published or exists(select 1 from public.canis c where c.id=canil_id and c.verificado)));
create index shelter_news_recent on public.shelter_news(canil_id,created_at desc);

alter table public.avaliacoes_canil add column verified_adoption boolean not null default false;
-- Review content and decisions are changed only through the checked RPCs below.
revoke insert,update,delete on public.avaliacoes_canil from anon,authenticated;
drop policy "Shelter owners can moderate reviews" on public.avaliacoes_canil;
create policy reviews_admin_read on public.avaliacoes_canil for select to authenticated using(private.is_admin());
create policy reviews_team_read on public.avaliacoes_canil for select to authenticated using(private.shelter_access(canil_id,false));
create table public.shelter_review_replies (
 review_id uuid primary key references public.avaliacoes_canil(id),body text not null check(length(trim(body)) between 3 and 2000),updated_at timestamptz not null default now()
);
alter table public.shelter_review_replies enable row level security;
revoke all on public.shelter_review_replies from anon,authenticated;
grant select on public.shelter_review_replies to anon,authenticated;
create policy reply_read on public.shelter_review_replies for select using(exists(select 1 from public.avaliacoes_canil r where r.id=review_id and (r.estado='aprovada' or private.shelter_access(r.canil_id,false))));
create table public.shelter_review_reports (
 id uuid primary key default gen_random_uuid(),review_id uuid not null references public.avaliacoes_canil(id),reporter_id uuid not null references public.profiles(id),
 reason text not null check(length(trim(reason)) between 10 and 2000),created_at timestamptz not null default now(),resolved_at timestamptz
);
create unique index review_reports_one_open on public.shelter_review_reports(review_id,reporter_id) where resolved_at is null;
alter table public.shelter_review_reports enable row level security;
revoke all on public.shelter_review_reports from anon,authenticated;
grant select on public.shelter_review_reports to authenticated;
create policy report_read on public.shelter_review_reports for select to authenticated using(reporter_id=auth.uid() or private.is_admin());
create index review_reports_open on public.shelter_review_reports(review_id) where resolved_at is null;
create index review_reports_rate on public.shelter_review_reports(reporter_id,created_at);
create table public.shelter_review_decisions (
 id uuid primary key default gen_random_uuid(),review_id uuid not null references public.avaliacoes_canil(id),moderator_id uuid not null references public.profiles(id),
 decision text not null check(decision in ('aprovada','rejeitada')),reason text not null check(length(trim(reason)) between 10 and 2000),created_at timestamptz not null default now()
);
alter table public.shelter_review_decisions enable row level security;
revoke all on public.shelter_review_decisions from anon,authenticated;
grant select on public.shelter_review_decisions to authenticated;
create policy decisions_admin on public.shelter_review_decisions for select to authenticated using(private.is_admin());

create function public.submit_verified_shelter_review(p_shelter uuid,p_rating integer,p_comment text) returns void language plpgsql security definer set search_path='' as $$
declare existing public.avaliacoes_canil; author text; next_state text;
begin
 if auth.uid() is null or not exists(select 1 from public.pedidos_adocao where canil_id=p_shelter and applicant_profile_id=auth.uid() and status='concluido') then raise exception 'Completed adoption required'; end if;
 if p_rating is null or p_rating not between 1 and 5 or length(coalesce(p_comment,''))>2000 then raise exception 'Invalid review'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_shelter::text,27));
 select * into existing from public.avaliacoes_canil where canil_id=p_shelter and author_profile_id=auth.uid() for update;
 select coalesce(nullif(trim(full_name),''),'Adotante') into author from public.profiles where id=auth.uid();
 next_state:=case when existing.id is not null and (existing.estado<>'aprovada' or exists(select 1 from public.shelter_review_reports where review_id=existing.id and resolved_at is null)) then 'pendente' else 'aprovada' end;
 insert into public.avaliacoes_canil(canil_id,author_profile_id,author_name,rating,comentario,estado,verified_adoption)
 values(p_shelter,auth.uid(),author,p_rating,nullif(trim(p_comment),''),next_state,true)
 on conflict(canil_id,author_profile_id) do update set author_name=excluded.author_name,rating=excluded.rating,comentario=excluded.comentario,estado=excluded.estado,verified_adoption=true;
end $$;
create function public.reply_shelter_review(p_review uuid,p_body text) returns void language plpgsql security definer set search_path='' as $$
declare r public.avaliacoes_canil;
begin
 select * into r from public.avaliacoes_canil where id=p_review for update;
 if r.id is null or r.estado<>'aprovada' or not private.shelter_access(r.canil_id,true) then raise exception 'Forbidden'; end if;
 if length(trim(coalesce(p_body,''))) not between 3 and 2000 then raise exception 'Invalid reply'; end if;
 insert into public.shelter_review_replies(review_id,body) values(p_review,trim(p_body)) on conflict(review_id) do update set body=excluded.body,updated_at=now();
end $$;
create function public.report_shelter_review(p_review uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare r public.avaliacoes_canil;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 select * into r from public.avaliacoes_canil where id=p_review for update;
 if r.id is null or r.estado<>'aprovada' or r.author_profile_id=auth.uid() then raise exception 'Review unavailable'; end if;
 if length(trim(coalesce(p_reason,''))) not between 10 and 2000 then raise exception 'Invalid reason'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,28));
 if exists(select 1 from public.shelter_review_reports where review_id=p_review and reporter_id=auth.uid() and resolved_at is null) then return; end if;
 if (select count(*) from public.shelter_review_reports where reporter_id=auth.uid() and created_at>now()-interval '1 day')>=5 then raise exception 'Too many reports'; end if;
 insert into public.shelter_review_reports(review_id,reporter_id,reason) values(p_review,auth.uid(),trim(p_reason));
end $$;
create function public.moderate_shelter_review(p_review uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Forbidden'; end if;
 if p_decision is null or p_decision not in ('aprovada','rejeitada') or length(trim(coalesce(p_reason,''))) not between 10 and 2000 then raise exception 'Invalid decision'; end if;
 perform 1 from public.avaliacoes_canil where id=p_review for update;
 if not found then raise exception 'Review unavailable'; end if;
 update public.avaliacoes_canil set estado=p_decision where id=p_review;
 insert into public.shelter_review_decisions(review_id,moderator_id,decision,reason) values(p_review,auth.uid(),p_decision,trim(p_reason));
 update public.shelter_review_reports set resolved_at=now() where review_id=p_review and resolved_at is null;
end $$;
create function public.shelter_experience_version() returns integer language sql immutable as $$ select 1 $$;
revoke all on function public.submit_verified_shelter_review(uuid,integer,text),public.reply_shelter_review(uuid,text),public.report_shelter_review(uuid,text),public.moderate_shelter_review(uuid,text,text),public.shelter_experience_version() from public;
grant execute on function public.submit_verified_shelter_review(uuid,integer,text),public.reply_shelter_review(uuid,text),public.report_shelter_review(uuid,text),public.moderate_shelter_review(uuid,text,text) to authenticated;
grant execute on function public.shelter_experience_version() to anon,authenticated;
notify pgrst,'reload schema';
commit;
