-- Fecha o ciclo de adopcao: novo estado 'concluido' + marcar animal como adotado.
-- Executar depois de adoption_requests_messages.sql.

alter table public.pedidos_adocao drop constraint if exists pedidos_adocao_status_check;
alter table public.pedidos_adocao
  add constraint pedidos_adocao_status_check
  check (status in ('pendente', 'entrevista', 'aprovado', 'rejeitado', 'concluido'));

-- Quando um pedido passa a 'concluido', o animal fica 'adotado'.
create or replace function public.mark_animal_adopted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'concluido' and old.status is distinct from 'concluido' then
    update public.animais set status = 'adotado' where id = new.animal_id;
  end if;
  return new;
end;
$$;

drop trigger if exists pedidos_adocao_mark_adopted on public.pedidos_adocao;
create trigger pedidos_adocao_mark_adopted
after update on public.pedidos_adocao
for each row execute procedure public.mark_animal_adopted();
