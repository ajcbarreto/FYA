-- Activar Supabase Realtime para as mensagens de adopcao.
-- Necessario para que o chat receba novas mensagens sem refresh.
-- Executar uma vez depois de adoption_requests_messages.sql.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'mensagens_adocao'
  ) then
    execute 'alter publication supabase_realtime add table public.mensagens_adocao';
  end if;
end
$$;
