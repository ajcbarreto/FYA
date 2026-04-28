-- Seed de dados de exemplo para desenvolvimento local.
-- Atualiza perfis (admin, canil, user), e insere canis/animais.
-- Script idempotente: pode ser executado mais de uma vez sem duplicar registos.
-- Importante: este seed NAO cria registos em auth.users (restricao comum de permissao).
-- Antes de executar, garanta que estes utilizadores existem em Authentication:
-- - admin@fya.local
-- - canil@fya.local
-- - user@fya.local

-- 1) Tabelas de domínio (caso ainda não existam no projeto)
create table if not exists public.canis (
  id uuid primary key,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  nome text not null,
  localizacao text not null,
  missao text,
  telefone text,
  email_contacto text,
  created_at timestamptz not null default now()
);

create table if not exists public.animais (
  id uuid primary key,
  canil_id uuid not null references public.canis(id) on delete cascade,
  nome text not null,
  especie text not null,
  raca text,
  sexo text,
  idade_anos int check (idade_anos >= 0),
  porte text,
  status text not null default 'disponivel',
  descricao text,
  created_at timestamptz not null default now()
);

-- 2) Perfis de exemplo (a partir de utilizadores ja existentes em auth.users)
with seed_users as (
  select *
  from (
    values
      (
        'admin@fya.local'::text,
        'Admin FYA'::text,
        'admin'::public.app_role
      ),
      (
        'canil@fya.local'::text,
        'Canil Esperanca'::text,
        'canil'::public.app_role
      ),
      (
        'user@fya.local'::text,
        'Utilizador Normal'::text,
        'user'::public.app_role
      )
  ) as t(email, full_name, role)
),
resolved_users as (
  select
    au.id,
    su.email,
    su.full_name,
    su.role
  from seed_users su
  inner join auth.users au on lower(au.email) = lower(su.email)
)
insert into public.profiles (id, email, full_name, role)
select
  ru.id,
  ru.email,
  ru.full_name,
  ru.role
from resolved_users ru
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;

-- 3) Canis de exemplo
with seed_canis as (
  select *
  from (
    values
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        'canil@fya.local'::text,
        'Canil Esperanca'::text,
        'Lisboa'::text,
        'Resgate e reabilitacao de caes e gatos.'::text,
        '+351910000001'::text,
        'contato@canilesperanca.local'::text
      ),
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
        null::text,
        'Patas da Serra'::text,
        'Porto'::text,
        'Acolhimento temporario com foco em adocao responsavel.'::text,
        '+351910000002'::text,
        'geral@patasdaserra.local'::text
      ),
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
        null::text,
        'Abrigo Sol Nascente'::text,
        'Coimbra'::text,
        'Protecao animal e campanhas de esterilizacao.'::text,
        '+351910000003'::text,
        'apoio@solnascente.local'::text
      )
  ) as t(id, owner_email, nome, localizacao, missao, telefone, email_contacto)
)
insert into public.canis (id, owner_profile_id, nome, localizacao, missao, telefone, email_contacto)
select
  sc.id,
  p.id,
  sc.nome,
  sc.localizacao,
  sc.missao,
  sc.telefone,
  sc.email_contacto
from seed_canis sc
left join public.profiles p on sc.owner_email is not null and lower(p.email) = lower(sc.owner_email)
on conflict (id) do update
set
  owner_profile_id = excluded.owner_profile_id,
  nome = excluded.nome,
  localizacao = excluded.localizacao,
  missao = excluded.missao,
  telefone = excluded.telefone,
  email_contacto = excluded.email_contacto;

-- 4) Animais de exemplo
insert into public.animais (
  id,
  canil_id,
  nome,
  especie,
  raca,
  sexo,
  idade_anos,
  porte,
  status,
  descricao
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    'Bobby',
    'cao',
    'Rafeiro',
    'macho',
    3,
    'medio',
    'disponivel',
    'Muito sociavel e habituado a apartamento.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
    'Luna',
    'gato',
    'Europeu comum',
    'femea',
    2,
    'pequeno',
    'disponivel',
    'Calma, esterilizada e vacinada.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    'Thor',
    'cao',
    'Pastor Alemao',
    'macho',
    5,
    'grande',
    'em_tratamento',
    'Recuperacao de lesao na pata traseira.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
    'Mia',
    'gato',
    'Siames',
    'femea',
    1,
    'pequeno',
    'reservado',
    'Reservada para visita de familia adotante.'
  )
on conflict (id) do update
set
  canil_id = excluded.canil_id,
  nome = excluded.nome,
  especie = excluded.especie,
  raca = excluded.raca,
  sexo = excluded.sexo,
  idade_anos = excluded.idade_anos,
  porte = excluded.porte,
  status = excluded.status,
  descricao = excluded.descricao;

-- 5) Pedidos de adocao de exemplo
with applicant as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
)
insert into public.pedidos_adocao (
  id,
  animal_id,
  canil_id,
  applicant_profile_id,
  status,
  mensagem_inicial,
  observacoes_canil
)
select
  'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
  a.id,
  'pendente',
  'Tenho experiencia com caes de porte medio e horario flexivel para adaptacao.',
  null
from applicant a
on conflict (id) do update
set
  status = excluded.status,
  mensagem_inicial = excluded.mensagem_inicial,
  observacoes_canil = excluded.observacoes_canil;

with applicant as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
)
insert into public.pedidos_adocao (
  id,
  animal_id,
  canil_id,
  applicant_profile_id,
  status,
  mensagem_inicial,
  observacoes_canil,
  reviewed_at
)
select
  'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
  a.id,
  'entrevista',
  'A Luna parece perfeita para apartamento e rotina calma.',
  'Marcar visita para sabado as 11h.',
  now()
from applicant a
on conflict (id) do update
set
  status = excluded.status,
  mensagem_inicial = excluded.mensagem_inicial,
  observacoes_canil = excluded.observacoes_canil,
  reviewed_at = excluded.reviewed_at;

-- 6) Conversas e mensagens de exemplo
with applicant as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
)
insert into public.conversas_adocao (
  id,
  canil_id,
  applicant_profile_id,
  animal_id,
  pedido_id
)
select
  'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
  a.id,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001'::uuid,
  'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid
from applicant a
on conflict (id) do update
set
  pedido_id = excluded.pedido_id,
  animal_id = excluded.animal_id;

with applicant as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
)
insert into public.conversas_adocao (
  id,
  canil_id,
  applicant_profile_id,
  animal_id,
  pedido_id
)
select
  'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
  a.id,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002'::uuid,
  'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid
from applicant a
on conflict (id) do update
set
  pedido_id = excluded.pedido_id,
  animal_id = excluded.animal_id;

with sender_user as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
), sender_canil as (
  select id
  from public.profiles
  where lower(email) = lower('canil@fya.local')
  limit 1
)
insert into public.mensagens_adocao (id, conversa_id, sender_profile_id, conteudo)
select
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1'::uuid,
  'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
  su.id,
  'Ola! Queria saber se o Bobby ainda aceita visitas este fim de semana.'
from sender_user su
on conflict (id) do nothing;

with sender_canil as (
  select id
  from public.profiles
  where lower(email) = lower('canil@fya.local')
  limit 1
)
insert into public.mensagens_adocao (id, conversa_id, sender_profile_id, conteudo)
select
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2'::uuid,
  'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid,
  sc.id,
  'Sim, temos disponibilidade no sabado. Posso confirmar as 10h?'
from sender_canil sc
on conflict (id) do nothing;

with sender_user as (
  select id
  from public.profiles
  where lower(email) = lower('user@fya.local')
  limit 1
)
insert into public.mensagens_adocao (id, conversa_id, sender_profile_id, conteudo)
select
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3'::uuid,
  'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid,
  su.id,
  'A Luna convive bem com criancas pequenas?'
from sender_user su
on conflict (id) do nothing;
