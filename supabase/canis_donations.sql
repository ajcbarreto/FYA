-- Suporte a doacoes para canis: o canil pode partilhar IBAN, MBWay e um link
-- externo (ex: PayPal, Givingli, Stripe Donate). A FYA nao processa pagamentos
-- nesta fase; apenas mostra os dados de forma controlada.

alter table public.canis add column if not exists iban text;
alter table public.canis add column if not exists mbway text;
alter table public.canis add column if not exists donation_link text;
alter table public.canis add column if not exists donation_message text;

-- Sem alteracoes a RLS: estes campos sao tratados como dados do canil e ja
-- sao gerenciados pelas policies existentes (owner do canil pode atualizar,
-- selecao publica esta limitada apenas aos campos seguros via codigo da app).
