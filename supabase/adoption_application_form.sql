-- Adiciona suporte para questionario estruturado de adopcao em pedidos_adocao.
-- Coluna `respostas` (jsonb) guarda respostas do formulario do adotante.
-- Executar depois de adoption_requests_messages.sql.

alter table public.pedidos_adocao
  add column if not exists respostas jsonb not null default '{}'::jsonb;

-- Indice GIN para consultas por chave (opcional, util para filtros futuros)
create index if not exists pedidos_adocao_respostas_idx
  on public.pedidos_adocao
  using gin (respostas);
