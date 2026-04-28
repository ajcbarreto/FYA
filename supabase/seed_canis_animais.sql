-- Seed dedicado para canis + animais associados
-- Objetivo: inserir/atualizar dados de forma idempotente (sem duplicar)
--
-- Como usar:
-- 1) Garantir que as tabelas public.canis e public.animais existem.
-- 2) (Opcional) Garantir que perfis com os emails abaixo existem em public.profiles.
-- 3) Executar este script no SQL Editor do Supabase.

-- 1) Seed de canis
with seed_canis as (
  select *
  from (
    values
      (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'canil@fya.local'::text,
        'Canil Esperanca'::text,
        'Lisboa'::text,
        'Resgate, reabilitacao e adocao responsavel de caes e gatos.'::text,
        '+351910000001'::text,
        'contato@canilesperanca.local'::text
      ),
      (
        '22222222-2222-2222-2222-222222222222'::uuid,
        null::text,
        'Patas da Serra'::text,
        'Porto'::text,
        'Acolhimento temporario com foco em socializacao e adocao segura.'::text,
        '+351910000002'::text,
        'geral@patasdaserra.local'::text
      ),
      (
        '33333333-3333-3333-3333-333333333333'::uuid,
        null::text,
        'Abrigo Sol Nascente'::text,
        'Coimbra'::text,
        'Protecao animal, esterilizacao e reintegracao familiar.'::text,
        '+351910000003'::text,
        'apoio@solnascente.local'::text
      ),
      (
        '44444444-4444-4444-4444-444444444444'::uuid,
        null::text,
        'Casa Quatro Patas'::text,
        'Braga'::text,
        'Cuidados diarios, treino basico e encaminhamento para adocao.'::text,
        '+351910000004'::text,
        'ola@casaquatropatas.local'::text
      )
  ) as t(id, owner_email, nome, localizacao, missao, telefone, email_contacto)
)
insert into public.canis (id, owner_profile_id, nome, localizacao, missao, telefone, email_contacto)
select
  sc.id,
  p.id as owner_profile_id,
  sc.nome,
  sc.localizacao,
  sc.missao,
  sc.telefone,
  sc.email_contacto
from seed_canis sc
left join public.profiles p
  on sc.owner_email is not null
 and lower(p.email) = lower(sc.owner_email)
on conflict (id) do update
set
  owner_profile_id = excluded.owner_profile_id,
  nome = excluded.nome,
  localizacao = excluded.localizacao,
  missao = excluded.missao,
  telefone = excluded.telefone,
  email_contacto = excluded.email_contacto;

-- 2) Seed de animais associados aos canis acima
with seed_animais as (
  select *
  from (
    values
      (
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Bobby'::text,
        'cao'::text,
        'Rafeiro'::text,
        'macho'::text,
        3::int,
        'medio'::text,
        'disponivel'::text,
        'Muito sociavel e habituado a apartamento.'::text
      ),
      (
        'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Luna'::text,
        'gato'::text,
        'Europeu comum'::text,
        'femea'::text,
        2::int,
        'pequeno'::text,
        'disponivel'::text,
        'Calma, esterilizada e vacinada.'::text
      ),
      (
        'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Thor'::text,
        'cao'::text,
        'Pastor Alemao'::text,
        'macho'::text,
        5::int,
        'grande'::text,
        'em_tratamento'::text,
        'Em recuperacao de lesao na pata traseira.'::text
      ),
      (
        'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Mia'::text,
        'gato'::text,
        'Siames'::text,
        'femea'::text,
        1::int,
        'pequeno'::text,
        'reservado'::text,
        'Reservada para visita com familia adotante.'::text
      ),
      (
        'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Max'::text,
        'cao'::text,
        'Labrador mix'::text,
        'macho'::text,
        4::int,
        'grande'::text,
        'disponivel'::text,
        'Muito afetuoso e ideal para familia com criancas.'::text
      ),
      (
        'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Nina'::text,
        'gato'::text,
        'Domestico de pelo curto'::text,
        'femea'::text,
        2::int,
        'pequeno'::text,
        'disponivel'::text,
        'Brincalhona, adaptada a vida indoor e a outros gatos.'::text
      )
  ) as t(id, canil_id, nome, especie, raca, sexo, idade_anos, porte, status, descricao)
)
insert into public.animais (id, canil_id, nome, especie, raca, sexo, idade_anos, porte, status, descricao)
select
  sa.id,
  sa.canil_id,
  sa.nome,
  sa.especie,
  sa.raca,
  sa.sexo,
  sa.idade_anos,
  sa.porte,
  sa.status,
  sa.descricao
from seed_animais sa
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

-- 3) Verificacao rapida (opcional)
-- select c.nome as canil, a.nome as animal, a.status
-- from public.animais a
-- join public.canis c on c.id = a.canil_id
-- order by c.nome, a.nome;
