-- Message activity is represented by the chat badge, never the notification inbox.
alter table public.notificacoes drop constraint if exists notificacoes_tipo_check;
alter table public.notificacoes add constraint notificacoes_tipo_check
  check (tipo in ('pedido_status', 'favorito', 'canil_favorito'));
drop trigger if exists mensagens_adocao_notify on public.mensagens_adocao;
drop function if exists public.notify_nova_mensagem();
