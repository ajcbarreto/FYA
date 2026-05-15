-- Notificacoes in-app + triggers automaticos.
-- Executar depois de adoption_requests_messages.sql.

create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('pedido_status', 'nova_mensagem')),
  referencia text,
  link text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notificacoes_user_idx
  on public.notificacoes (user_profile_id, created_at desc);
create index if not exists notificacoes_unread_idx
  on public.notificacoes (user_profile_id)
  where lida = false;

alter table public.notificacoes enable row level security;

grant select, update, delete on public.notificacoes to authenticated;

drop policy if exists "Users read own notifications" on public.notificacoes;
create policy "Users read own notifications"
on public.notificacoes
for select
to authenticated
using (user_profile_id = auth.uid());

drop policy if exists "Users update own notifications" on public.notificacoes;
create policy "Users update own notifications"
on public.notificacoes
for update
to authenticated
using (user_profile_id = auth.uid())
with check (user_profile_id = auth.uid());

drop policy if exists "Users delete own notifications" on public.notificacoes;
create policy "Users delete own notifications"
on public.notificacoes
for delete
to authenticated
using (user_profile_id = auth.uid());

-- Trigger: notificar adotante quando o estado do pedido muda.
create or replace function public.notify_pedido_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notificacoes (user_profile_id, tipo, referencia, link)
    values (new.applicant_profile_id, 'pedido_status', new.status, '/user/pedidos');
  end if;
  return new;
end;
$$;

drop trigger if exists pedidos_adocao_notify_status on public.pedidos_adocao;
create trigger pedidos_adocao_notify_status
after update on public.pedidos_adocao
for each row execute procedure public.notify_pedido_status();

-- Trigger: notificar o outro participante quando chega uma mensagem.
create or replace function public.notify_nova_mensagem()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  applicant_id uuid;
  owner_id uuid;
  recipient_id uuid;
  recipient_link text;
begin
  select c.applicant_profile_id, k.owner_profile_id
    into applicant_id, owner_id
  from public.conversas_adocao c
  join public.canis k on k.id = c.canil_id
  where c.id = new.conversa_id;

  if new.sender_profile_id = applicant_id then
    recipient_id := owner_id;
    recipient_link := '/canil/mensagens';
  else
    recipient_id := applicant_id;
    recipient_link := '/user/mensagens';
  end if;

  if recipient_id is not null and recipient_id <> new.sender_profile_id then
    insert into public.notificacoes (user_profile_id, tipo, referencia, link)
    values (recipient_id, 'nova_mensagem', new.conversa_id::text, recipient_link);
  end if;

  return new;
end;
$$;

drop trigger if exists mensagens_adocao_notify on public.mensagens_adocao;
create trigger mensagens_adocao_notify
after insert on public.mensagens_adocao
for each row execute procedure public.notify_nova_mensagem();
