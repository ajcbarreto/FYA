begin;
create function public.save_animal_details(p_animal uuid,p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.animais where id=p_animal and private.shelter_access(canil_id,true)) then raise exception 'Animal access denied'; end if;
 perform public.manage_animal(p_animal,p_data->>'status');
 if length(trim(p_data->>'nome')) not between 1 and 160 or p_data->>'especie' not in ('cao','gato','outro') then raise exception 'Invalid animal'; end if;
 update public.animais set nome=p_data->>'nome',especie=p_data->>'especie',raca=p_data->>'raca',sexo=p_data->>'sexo',idade_anos=(p_data->>'idade_anos')::int,porte=p_data->>'porte',descricao=p_data->>'descricao',compatibilidades=array(select jsonb_array_elements_text(p_data->'compatibilidades')) where id=p_animal;
end $$;
revoke all on function public.save_animal_details(uuid,jsonb) from public;
grant execute on function public.save_animal_details(uuid,jsonb) to authenticated;
-- Owners can keep an internal record before verification; publishing is checked independently.
create or replace function private.protect_animal() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and (new.id is distinct from old.id or new.canil_id is distinct from old.canil_id) then raise exception 'Animal ownership is immutable'; end if;
 if new.published and not exists(select 1 from public.canis where id=new.canil_id and verificado) and auth.uid() is not null and not private.is_admin() then raise exception 'Shelter verification required'; end if;
 return new;
end $$;
-- Reader membership must never inherit a write via a permissive public policy.
create or replace function private.can_read_profile(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select target=auth.uid() or private.is_admin() or exists(select 1 from public.pedidos_adocao p where p.applicant_profile_id=target and private.shelter_access(p.canil_id,false))
 or exists(select 1 from public.shelter_memberships m where m.profile_id=target and private.shelter_access(m.canil_id,false))
 or exists(select 1 from public.canis c where c.owner_profile_id=target and private.shelter_access(c.id,false));
$$;
create function public.shelter_delivery_status(p_shelter uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.shelter_access(p_shelter,false) then raise exception 'Access denied'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'share_id',s.id,'sent_at',o.sent_at,'attempts',o.attempts,'last_error',o.last_error,'created_at',o.created_at) order by o.created_at desc) from public.email_outbox o join public.document_shares s on s.id=o.share_id join public.animais a on a.id=s.animal_id where a.canil_id=p_shelter),'[]'::jsonb);
end $$;
revoke all on function public.shelter_delivery_status(uuid) from public;
grant execute on function public.shelter_delivery_status(uuid) to authenticated;
create function public.retry_document_email(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.email_outbox o set attempts=0,available_at=now(),last_error=null where o.id=p_id and sent_at is null and attempts>=5 and (locked_at is null or locked_at<now()-interval '10 minutes') and exists(select 1 from public.document_shares s join public.animais a on a.id=s.animal_id where s.id=o.share_id and s.revoked_at is null and s.expires_at>now() and private.shelter_access(a.canil_id,true));
 if not found then raise exception 'Retry not available'; end if;
end $$;
revoke all on function public.retry_document_email(uuid) from public;
grant execute on function public.retry_document_email(uuid) to authenticated;
commit;
