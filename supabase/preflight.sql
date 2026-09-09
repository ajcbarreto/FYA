-- Read-only checks before applying hardening to an EXISTING database.
-- Each result must be inspected. Never delete or merge conflicting applications automatically.
select animal_id, count(*) from public.pedidos_adocao
where status='concluido' group by animal_id having count(*)>1;
select animal_id,applicant_profile_id,count(*) from public.pedidos_adocao
where status in ('pendente','entrevista','aprovado') group by animal_id,applicant_profile_id having count(*)>1;
select p.id from public.pedidos_adocao p join public.animais a on a.id=p.animal_id where p.canil_id<>a.canil_id;
select v.id from public.visitas v join public.pedidos_adocao p on p.id=v.pedido_id
where v.canil_id<>p.canil_id or v.applicant_profile_id<>p.applicant_profile_id or v.animal_id is distinct from p.animal_id;
select table_name,grantee,privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name in ('profiles','canis','pedidos_adocao','conversas_adocao');
select id,email,role from public.profiles where role='admin';
