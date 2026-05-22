-- A3: moderacao de listings de particulares + B2: dados reais do animal.
--
-- Como aplicar:
--   1) Executar este script depois dos scripts de animais e user_owned_animals.
--   2) Listings publicados antes desta migracao (de canis ou de particulares
--      ja existentes) ficam todos "aprovado" para nao desaparecerem.

-- 1) MODERACAO ---------------------------------------------------------------
alter table public.animais
  add column if not exists estado_moderacao text not null default 'aprovado'
  check (estado_moderacao in ('aprovado', 'pendente', 'rejeitado'));

create index if not exists animais_estado_moderacao_idx
  on public.animais (estado_moderacao);

-- Backfill: tudo o que ja existia mantem-se aprovado.
update public.animais set estado_moderacao = 'aprovado' where estado_moderacao is null;

-- Novos listings de particulares entram em pendente automaticamente.
create or replace function public.set_owner_animal_pending()
returns trigger
language plpgsql
as $$
begin
  if new.owner_profile_id is not null and new.canil_id is null then
    new.estado_moderacao := coalesce(new.estado_moderacao, 'pendente');
    if new.estado_moderacao = 'aprovado' then
      -- forcar pendente em insert (nao confiar no client)
      new.estado_moderacao := 'pendente';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists animais_set_owner_pending on public.animais;
create trigger animais_set_owner_pending
before insert on public.animais
for each row execute procedure public.set_owner_animal_pending();

-- RLS: catalogo publico so ve "aprovado". Owners e admins veem os proprios em
-- qualquer estado. O canil e seus animais nao sao afectados (vem aprovado).
drop policy if exists "animais_public_select_aprovados" on public.animais;
create policy "animais_public_select_aprovados" on public.animais
  for select
  to anon
  using (estado_moderacao = 'aprovado');

-- Admins podem actualizar estado_moderacao directamente (assumindo policy de
-- admin pre-existente). Owners nao podem mudar o proprio estado_moderacao
-- (a policy de owner ja gere isso atraves do trigger e do filtro public).

-- 2) DADOS REAIS DO ANIMAL ---------------------------------------------------
alter table public.animais
  add column if not exists taxa_adocao numeric(10, 2),
  add column if not exists vacinado boolean not null default false,
  add column if not exists microchip boolean not null default false,
  add column if not exists esterilizado boolean not null default false,
  add column if not exists peso_kg numeric(5, 2);

-- 3) HORARIO DE VISITAS DO CANIL --------------------------------------------
alter table public.canis
  add column if not exists horario_visitas text;
