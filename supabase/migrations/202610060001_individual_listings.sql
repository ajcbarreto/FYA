begin;
-- Private individuals ("particulares") can list their own animals for adoption.
-- Each individual gets one personal canis row (tipo='particular') so requests, messages,
-- photos and permissions keep using the existing shelter_access rules unchanged.
alter table public.canis add column tipo text not null default 'canil' check (tipo in ('canil','particular'));
create unique index canis_one_particular on public.canis(owner_profile_id) where tipo='particular';

-- Individual listings are screened automatically; flagged ones wait for an administrator.
alter table public.animais
  add column moderacao text not null default 'aprovado' check (moderacao in ('aprovado','pendente','rejeitado')),
  add column moderacao_motivos text[] not null default '{}',
  add column moderacao_nota text check (length(moderacao_nota)<=1000),
  add column moderado_em timestamptz;
create index animais_moderacao_pendente on public.animais(created_at) where moderacao='pendente';

create or replace function private.protect_shelter() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not private.is_admin() then
    if tg_op='INSERT' then
      if new.verificado then raise exception 'Verification requires administrator' using errcode='42501'; end if;
      if new.tipo<>'canil' and coalesce(current_setting('fya.individual_listing',true),'')<>'on' then
        raise exception 'Protected shelter fields' using errcode='42501';
      end if;
    elsif new.verificado is distinct from old.verificado or new.owner_profile_id is distinct from old.owner_profile_id
      or new.id is distinct from old.id or new.tipo is distinct from old.tipo then
      raise exception 'Protected shelter fields' using errcode='42501';
    end if;
  end if;
  return new;
end $$;

create function private.is_individual_shelter(shelter uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.canis where id=shelter and tipo='particular');
$$;
create function private.has_photo(animal uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.animal_fotos where animal_id=animal);
$$;
revoke all on function private.is_individual_shelter(uuid), private.has_photo(uuid) from public;
grant execute on function private.is_individual_shelter(uuid), private.has_photo(uuid) to anon, authenticated;

-- Public listing rule shared by the catalogue policy and new adoption requests.
create function private.animal_is_public(animal uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.animais a join public.canis c on c.id=a.canil_id
    where a.id=animal and a.published and a.archived_at is null
      and ((c.tipo='canil' and c.verificado)
        or (c.tipo='particular' and a.moderacao='aprovado' and exists(select 1 from public.animal_fotos f where f.animal_id=a.id))));
$$;
revoke all on function private.animal_is_public(uuid) from public;
grant execute on function private.animal_is_public(uuid) to anon, authenticated;

drop policy animal_visibility on public.animais;
create policy animal_visibility on public.animais as restrictive for select to anon,authenticated using(
 (published and archived_at is null and exists(select 1 from public.canis c where c.id=canil_id and (
   (c.tipo='canil' and c.verificado)
   or (c.tipo='particular' and moderacao='aprovado' and private.has_photo(animais.id)))))
 or (auth.uid() is not null and private.shelter_access(canil_id,false))
);

-- Individuals publish without shelter verification; moderation decides public visibility instead.
create or replace function private.protect_animal() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and (new.id is distinct from old.id or new.canil_id is distinct from old.canil_id) then raise exception 'Animal ownership is immutable'; end if;
 if new.published and not exists(select 1 from public.canis where id=new.canil_id and (verificado or tipo='particular')) and auth.uid() is not null and not private.is_admin() then raise exception 'Shelter verification required'; end if;
 return new;
end $$;

create or replace function public.manage_animal(p_animal uuid,p_operation text) returns void language plpgsql security definer set search_path='' as $$
declare a public.animais;
begin
 select * into a from public.animais where id=p_animal for update;
 if a.id is null or not private.shelter_access(a.canil_id,true) then raise exception 'Animal access denied'; end if;
 if p_operation='archive' then update public.animais set archived_at=now(),published=false where id=a.id;
 elsif p_operation='restore' then update public.animais set archived_at=null where id=a.id;
 elsif p_operation='publish' then
  if a.archived_at is not null or not exists(select 1 from public.canis where id=a.canil_id and (verificado or tipo='particular')) then raise exception 'Verified active shelter required'; end if;
  update public.animais set published=true where id=a.id;
 elsif p_operation='unpublish' then update public.animais set published=false where id=a.id;
 elsif p_operation in ('disponivel','reservado','em_tratamento','adotado') then
  if a.status='adotado' and p_operation<>'adotado' then raise exception 'Completed adoption status is final'; end if;
  update public.animais set status=p_operation where id=a.id;
 else raise exception 'Invalid operation'; end if;
end $$;

create or replace function private.request_visibility() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not private.animal_is_public(new.animal_id) then raise exception 'Animal unavailable'; end if;
 if exists(select 1 from public.canis where id=new.canil_id and owner_profile_id=new.applicant_profile_id) then
  raise exception 'Owners cannot adopt their own animal' using errcode='42501';
 end if;
 return new;
end $$;

-- Automatic anti-scam screening. Runs in the database so direct API calls cannot skip it.
-- Text is lower-cased and stripped of accents before matching.
create function private.listing_text(nome text, raca text, descricao text) returns text
language sql immutable set search_path='' as $$
  select translate(lower(concat_ws(' ',nome,raca,descricao)),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc');
$$;

create function private.screen_individual_animal() returns trigger language plpgsql security definer set search_path='' as $$
declare
 owner uuid; reasons text[] := '{}'; txt text; active int;
begin
 select owner_profile_id into owner from public.canis where id=new.canil_id and tipo='particular';
 if not found then return new; end if;
 -- Administrators moderate; status changes and photo edits keep the current decision.
 if auth.uid() is null or private.is_admin() then return new; end if;
 if tg_op='UPDATE' then
  new.moderacao:=old.moderacao; new.moderacao_motivos:=old.moderacao_motivos;
  new.moderacao_nota:=old.moderacao_nota; new.moderado_em:=old.moderado_em;
  if new.nome is not distinct from old.nome and new.raca is not distinct from old.raca
    and new.descricao is not distinct from old.descricao and new.idade_anos is not distinct from old.idade_anos
    and new.especie is not distinct from old.especie then return new; end if;
 end if;
 txt := private.listing_text(new.nome,new.raca,new.descricao);
 -- Adoption through FYA is free: asking for money is never allowed.
 if txt ~ '(mb ?way|\miban\M|\mnib\M|transferencia bancaria|\mpaypal\M|western union|moneygram|\mrevolut\M|bitcoin|cripto|taxa de (reserva|adocao)|\mportes\M|custos? de (envio|transporte)|[0-9] ?(€|euros?\M)|€ ?[0-9])' then
  raise exception 'FYA_PAYMENT_TERMS' using errcode='22023';
 end if;
 if tg_op='INSERT' then
  select count(*) into active from public.animais where canil_id=new.canil_id and archived_at is null and status<>'adotado';
  if active>=3 then raise exception 'FYA_LISTING_LIMIT' using errcode='22023'; end if;
 end if;
 if txt ~ '(pagar|pagamento|\mpreco\M|\mvalor\M|\mvend[aeo])' then reasons:=array_append(reasons,'menciona_dinheiro'); end if;
 if txt ~ '((\+?351[ .-]?)?[29][0-9]{2}[ .-]?[0-9]{3}[ .-]?[0-9]{3}|[0-9]{9,}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|https?://|www\.|whats ?app|telegram|\msignal\M|instagram|facebook|messenger|\molx\M)' then
  reasons:=array_append(reasons,'contactos_externos');
 end if;
 if txt ~ '(bulldog|buldogue|spitz|pomerania|lulu|yorkshire|yorkie|husky|chihuahua|maltes|bichon|shih ?tzu|\mpug\M|carlino|golden|labrador|pastor alemao|cocker|beagle|samoiedo|akita|shiba|border collie|caniche|poodle|teckel|dachshund|cavalier|maine coon|ragdoll|\mpersa\M|sphynx|bengal|british shorthair|scottish fold)'
   and (new.idade_anos=0 or txt ~ '(cachorr|\mbebe|filhote|recem|semanas)') then
  reasons:=array_append(reasons,'raca_procurada_cachorro');
 end if;
 if exists(select 1 from public.profiles where id=owner and created_at>now()-interval '48 hours') then reasons:=array_append(reasons,'conta_recente'); end if;
 if length(trim(coalesce(new.descricao,'')))>=40 and exists(
   select 1 from public.animais a join public.canis c on c.id=a.canil_id
   where a.id is distinct from new.id and c.owner_profile_id is distinct from owner
     and lower(trim(a.descricao))=lower(trim(new.descricao))) then
  reasons:=array_append(reasons,'texto_duplicado');
 end if;
 if tg_op='UPDATE' and old.moderacao='rejeitado' then reasons:=array_append(reasons,'reenviado_apos_rejeicao'); end if;
 if coalesce((select value->>'requireIndividualReview'='true' from public.app_settings where key='platform_settings'),false) then
  reasons:=array_append(reasons,'revisao_manual');
 end if;
 new.moderacao := case when cardinality(reasons)=0 then 'aprovado' else 'pendente' end;
 new.moderacao_motivos := reasons; new.moderacao_nota := null; new.moderado_em := null;
 return new;
end $$;
-- Named to fire after animais_protect_fields (triggers run in name order).
create trigger animais_screen_individual before insert or update on public.animais for each row execute function private.screen_individual_animal();

-- canis rows are publicly readable, so an individual's phone and email never go there.
create table public.individual_contacts (
 canil_id uuid primary key references public.canis(id) on delete cascade,
 telefone text not null check (telefone ~ '^\+?[0-9 ]{9,20}$'),
 updated_at timestamptz not null default now()
);
alter table public.individual_contacts enable row level security;
revoke all on public.individual_contacts from anon, authenticated;
grant select on public.individual_contacts to authenticated;
create policy individual_contacts_read on public.individual_contacts for select to authenticated
 using (private.is_admin() or exists(select 1 from public.canis c where c.id=canil_id and c.owner_profile_id=auth.uid()));

create function public.start_individual_listing(p_location text, p_phone text) returns uuid
language plpgsql security definer set search_path='' as $$
declare p public.profiles; shelter uuid;
begin
 select * into p from public.profiles where id=auth.uid();
 if p.id is null or p.role<>'user' then raise exception 'Adopter account required' using errcode='42501'; end if;
 if length(trim(coalesce(p_location,''))) not between 2 and 120 or coalesce(p_phone,'') !~ '^\+?[0-9 ]{9,20}$' then
  raise exception 'Invalid listing contact' using errcode='22023';
 end if;
 select id into shelter from public.canis where owner_profile_id=p.id and tipo='particular';
 if shelter is null then
  -- Only the first name is public; adopters reach the person through FYA messages.
  perform set_config('fya.individual_listing','on',true);
  insert into public.canis(owner_profile_id,nome,localizacao,tipo)
  values(p.id,coalesce(nullif(split_part(trim(p.full_name),' ',1),''),'Particular'),trim(p_location),'particular')
  returning id into shelter;
  perform set_config('fya.individual_listing','',true);
 else
  update public.canis set localizacao=trim(p_location) where id=shelter;
 end if;
 insert into public.individual_contacts(canil_id,telefone) values(shelter,trim(p_phone))
 on conflict(canil_id) do update set telefone=excluded.telefone, updated_at=now();
 return shelter;
end $$;
revoke all on function public.start_individual_listing(text,text) from public;
grant execute on function public.start_individual_listing(text,text) to authenticated;

create function public.moderate_animal(p_animal uuid, p_decision text, p_note text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_decision not in ('aprovado','rejeitado') or length(coalesce(p_note,''))>1000 then raise exception 'Invalid decision' using errcode='22023'; end if;
 update public.animais set moderacao=p_decision, moderacao_nota=nullif(trim(p_note),''), moderado_em=now()
 where id=p_animal and private.is_individual_shelter(canil_id);
 if not found then raise exception 'Individual listing not found'; end if;
end $$;
revoke all on function public.moderate_animal(uuid,text,text) from public;
grant execute on function public.moderate_animal(uuid,text,text) to authenticated;

-- A team member who also lists animals privately keeps landing on the real shelter first.
create or replace function public.my_shelters() returns setof public.canis language sql stable security definer set search_path='' as $$
 select c.* from public.canis c where c.owner_profile_id=auth.uid() or exists(select 1 from public.shelter_memberships m where m.canil_id=c.id and m.profile_id=auth.uid()) order by exists(select 1 from public.shelter_preferences p where p.profile_id=auth.uid() and p.canil_id=c.id) desc,c.tipo='canil' desc,c.created_at,c.id;
$$;
commit;
