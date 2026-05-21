-- Permite que utilizadores normais (role "user") publiquem os proprios animais
-- sem estarem associados a um canil. Cada animal/pedido/conversa fica ligado
-- ou a um canil (canil_id) ou a um perfil de utilizador (owner_profile_id),
-- nunca a ambos.
--
-- Como aplicar:
--   1) Executar este script no SQL Editor do Supabase apos os scripts
--      profiles/canis/animais/adoption_requests_messages.
--   2) As policies novas sao aditivas: nao removem as existentes para canis.

-- 1) ANIMAIS -----------------------------------------------------------------
alter table public.animais
  alter column canil_id drop not null;
alter table public.animais
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete cascade;

alter table public.animais drop constraint if exists animais_owner_or_canil;
alter table public.animais add constraint animais_owner_or_canil
  check (
    (canil_id is not null and owner_profile_id is null)
    or (canil_id is null and owner_profile_id is not null)
  );

create index if not exists animais_owner_profile_idx
  on public.animais (owner_profile_id);

-- O dono particular pode gerir o seu animal.
drop policy if exists "animais_owner_can_manage" on public.animais;
create policy "animais_owner_can_manage" on public.animais
  for all
  to authenticated
  using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

-- 2) PEDIDOS DE ADOCAO -------------------------------------------------------
alter table public.pedidos_adocao
  alter column canil_id drop not null;
alter table public.pedidos_adocao
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete cascade;

alter table public.pedidos_adocao drop constraint if exists pedidos_owner_or_canil;
alter table public.pedidos_adocao add constraint pedidos_owner_or_canil
  check (
    (canil_id is not null and owner_profile_id is null)
    or (canil_id is null and owner_profile_id is not null)
  );

create index if not exists pedidos_adocao_owner_idx
  on public.pedidos_adocao (owner_profile_id, created_at desc);

drop policy if exists "pedidos_owner_can_read" on public.pedidos_adocao;
create policy "pedidos_owner_can_read" on public.pedidos_adocao
  for select
  to authenticated
  using (owner_profile_id = auth.uid() or applicant_profile_id = auth.uid());

drop policy if exists "pedidos_owner_can_update" on public.pedidos_adocao;
create policy "pedidos_owner_can_update" on public.pedidos_adocao
  for update
  to authenticated
  using (owner_profile_id = auth.uid())
  with check (owner_profile_id = auth.uid());

-- 3) CONVERSAS DE ADOCAO -----------------------------------------------------
alter table public.conversas_adocao
  alter column canil_id drop not null;
alter table public.conversas_adocao
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete cascade;

alter table public.conversas_adocao drop constraint if exists conversas_owner_or_canil;
alter table public.conversas_adocao add constraint conversas_owner_or_canil
  check (
    (canil_id is not null and owner_profile_id is null)
    or (canil_id is null and owner_profile_id is not null)
  );

-- A unicidade original era (canil_id, applicant, animal). Substituida por
-- dois indices unicos parciais para cobrir tambem o lado owner.
alter table public.conversas_adocao
  drop constraint if exists conversas_adocao_canil_id_applicant_profile_id_animal_id_key;
create unique index if not exists conversas_adocao_unique_canil
  on public.conversas_adocao (canil_id, applicant_profile_id, animal_id)
  where canil_id is not null;
create unique index if not exists conversas_adocao_unique_owner
  on public.conversas_adocao (owner_profile_id, applicant_profile_id, animal_id)
  where owner_profile_id is not null;
create index if not exists conversas_adocao_owner_idx
  on public.conversas_adocao (owner_profile_id, updated_at desc);

drop policy if exists "conversas_owner_can_read" on public.conversas_adocao;
create policy "conversas_owner_can_read" on public.conversas_adocao
  for select
  to authenticated
  using (owner_profile_id = auth.uid() or applicant_profile_id = auth.uid());

drop policy if exists "conversas_owner_can_insert" on public.conversas_adocao;
create policy "conversas_owner_can_insert" on public.conversas_adocao
  for insert
  to authenticated
  with check (
    applicant_profile_id = auth.uid()
    and (canil_id is not null or owner_profile_id is not null)
  );

-- 4) MENSAGENS ---------------------------------------------------------------
-- Os participantes elegiveis sao: o candidato, o dono particular do animal,
-- ou o dono do canil associado.
drop policy if exists "mensagens_participants_read" on public.mensagens_adocao;
create policy "mensagens_participants_read" on public.mensagens_adocao
  for select
  to authenticated
  using (
    exists (
      select 1 from public.conversas_adocao c
      where c.id = mensagens_adocao.conversa_id
        and (
          c.applicant_profile_id = auth.uid()
          or c.owner_profile_id = auth.uid()
          or exists (
            select 1 from public.canis k
            where k.id = c.canil_id and k.owner_profile_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "mensagens_participants_insert" on public.mensagens_adocao;
create policy "mensagens_participants_insert" on public.mensagens_adocao
  for insert
  to authenticated
  with check (
    sender_profile_id = auth.uid()
    and exists (
      select 1 from public.conversas_adocao c
      where c.id = mensagens_adocao.conversa_id
        and (
          c.applicant_profile_id = auth.uid()
          or c.owner_profile_id = auth.uid()
          or exists (
            select 1 from public.canis k
            where k.id = c.canil_id and k.owner_profile_id = auth.uid()
          )
        )
    )
  );
