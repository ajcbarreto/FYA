-- Fresh databases only. Existing installations must baseline before applying the next migration.
-- Enum for roles.
create type public.app_role as enum ('admin', 'user', 'canil');

-- Profiles table linked to auth.users.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Automatically create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_role text;
begin
  metadata_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when metadata_role in ('user', 'canil') then metadata_role::public.app_role
      else 'user'::public.app_role
    end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS policies.
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

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


-- Source: canis_animais_policies.sql
-- Politicas para permitir leitura publica do catalogo (sem login)
-- e manter escrita restrita a canis donos/admin.

-- Garantir RLS ligado
alter table if exists public.canis enable row level security;
alter table if exists public.animais enable row level security;

-- Grants de leitura para API (anon + authenticated)
grant select on table public.canis to anon, authenticated;
grant select on table public.animais to anon, authenticated;

-- Limpeza de policies antigas com mesmo nome
drop policy if exists "Public can read canis" on public.canis;
drop policy if exists "Public can read animais" on public.animais;
drop policy if exists "Canil owner or admin can insert canis" on public.canis;
drop policy if exists "Canil owner or admin can update canis" on public.canis;
drop policy if exists "Canil owner or admin can insert animais" on public.animais;
drop policy if exists "Canil owner or admin can update animais" on public.animais;

-- Leitura aberta para catalogo e detalhe sem login
create policy "Public can read canis"
on public.canis
for select
to anon, authenticated
using (true);

create policy "Public can read animais"
on public.animais
for select
to anon, authenticated
using (true);

-- Escrita de canis: apenas dono do profile (role canil) ou admin
create policy "Canil owner or admin can insert canis"
on public.canis
for insert
to authenticated
with check (
  owner_profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('canil', 'admin')
  )
);

create policy "Canil owner or admin can update canis"
on public.canis
for update
to authenticated
using (
  owner_profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  owner_profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Escrita de animais: dono do canil ou admin
create policy "Canil owner or admin can insert animais"
on public.animais
for insert
to authenticated
with check (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

create policy "Canil owner or admin can update animais"
on public.animais
for update
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

-- Source: adoption_requests_messages.sql
-- Adoption requests + shelter/user messaging
-- Run after profiles/canis/animais schema scripts.

create table if not exists public.pedidos_adocao (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  canil_id uuid not null references public.canis(id) on delete cascade,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'entrevista', 'aprovado', 'rejeitado')),
  mensagem_inicial text,
  observacoes_canil text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists pedidos_adocao_canil_idx on public.pedidos_adocao (canil_id, created_at desc);
create index if not exists pedidos_adocao_applicant_idx on public.pedidos_adocao (applicant_profile_id, created_at desc);
create unique index if not exists pedidos_adocao_unique_open
  on public.pedidos_adocao (animal_id, applicant_profile_id)
  where status in ('pendente', 'entrevista');

create table if not exists public.conversas_adocao (
  id uuid primary key default gen_random_uuid(),
  canil_id uuid not null references public.canis(id) on delete cascade,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid references public.animais(id) on delete set null,
  pedido_id uuid references public.pedidos_adocao(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canil_id, applicant_profile_id, animal_id)
);

create index if not exists conversas_adocao_canil_idx on public.conversas_adocao (canil_id, updated_at desc);
create index if not exists conversas_adocao_applicant_idx on public.conversas_adocao (applicant_profile_id, updated_at desc);

create table if not exists public.mensagens_adocao (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references public.conversas_adocao(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  conteudo text not null check (char_length(trim(conteudo)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists mensagens_adocao_conversa_idx on public.mensagens_adocao (conversa_id, created_at asc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pedidos_adocao_touch_updated_at on public.pedidos_adocao;
create trigger pedidos_adocao_touch_updated_at
before update on public.pedidos_adocao
for each row execute procedure public.touch_updated_at();

drop trigger if exists conversas_adocao_touch_updated_at on public.conversas_adocao;
create trigger conversas_adocao_touch_updated_at
before update on public.conversas_adocao
for each row execute procedure public.touch_updated_at();

create or replace function public.bump_conversa_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.conversas_adocao
  set updated_at = now()
  where id = new.conversa_id;
  return new;
end;
$$;

drop trigger if exists mensagens_adocao_bump_updated_at on public.mensagens_adocao;
create trigger mensagens_adocao_bump_updated_at
after insert on public.mensagens_adocao
for each row execute procedure public.bump_conversa_updated_at();

alter table public.pedidos_adocao enable row level security;
alter table public.conversas_adocao enable row level security;
alter table public.mensagens_adocao enable row level security;

grant select, insert, update on public.pedidos_adocao to authenticated;
grant select, insert, update on public.conversas_adocao to authenticated;
grant select, insert on public.mensagens_adocao to authenticated;

drop policy if exists "Applicants can read own requests" on public.pedidos_adocao;
create policy "Applicants can read own requests"
on public.pedidos_adocao
for select
to authenticated
using (applicant_profile_id = auth.uid());

drop policy if exists "Applicants can create requests" on public.pedidos_adocao;
create policy "Applicants can create requests"
on public.pedidos_adocao
for insert
to authenticated
with check (
  applicant_profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'user'
  )
);

drop policy if exists "Applicants can update own requests" on public.pedidos_adocao;
create policy "Applicants can update own requests"
on public.pedidos_adocao
for update
to authenticated
using (applicant_profile_id = auth.uid())
with check (applicant_profile_id = auth.uid());

drop policy if exists "Shelter owners can read requests" on public.pedidos_adocao;
create policy "Shelter owners can read requests"
on public.pedidos_adocao
for select
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = pedidos_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Shelter owners can update requests" on public.pedidos_adocao;
create policy "Shelter owners can update requests"
on public.pedidos_adocao
for update
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = pedidos_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.canis c
    where c.id = pedidos_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Participants can read conversations" on public.conversas_adocao;
create policy "Participants can read conversations"
on public.conversas_adocao
for select
to authenticated
using (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = conversas_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Participants can create conversations" on public.conversas_adocao;
create policy "Participants can create conversations"
on public.conversas_adocao
for insert
to authenticated
with check (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = conversas_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Participants can update conversations" on public.conversas_adocao;
create policy "Participants can update conversations"
on public.conversas_adocao
for update
to authenticated
using (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = conversas_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = conversas_adocao.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Participants can read messages" on public.mensagens_adocao;
create policy "Participants can read messages"
on public.mensagens_adocao
for select
to authenticated
using (
  exists (
    select 1
    from public.conversas_adocao c
    where c.id = mensagens_adocao.conversa_id
      and (
        c.applicant_profile_id = auth.uid()
        or exists (
          select 1
          from public.canis k
          where k.id = c.canil_id
            and (
              k.owner_profile_id = auth.uid()
              or exists (
                select 1
                from public.profiles p
                where p.id = auth.uid()
                  and p.role = 'admin'
              )
            )
        )
      )
  )
);

drop policy if exists "Participants can send messages" on public.mensagens_adocao;
create policy "Participants can send messages"
on public.mensagens_adocao
for insert
to authenticated
with check (
  sender_profile_id = auth.uid()
  and exists (
    select 1
    from public.conversas_adocao c
    where c.id = mensagens_adocao.conversa_id
      and (
        c.applicant_profile_id = auth.uid()
        or exists (
          select 1
          from public.canis k
          where k.id = c.canil_id
            and (
              k.owner_profile_id = auth.uid()
              or exists (
                select 1
                from public.profiles p
                where p.id = auth.uid()
                  and p.role = 'admin'
              )
            )
        )
      )
  )
);

-- Source: canil_fixes.sql
-- Correcoes do fluxo de canil:
--  1) Ao registar uma conta 'canil', criar tambem a linha em public.canis.
--  2) Permitir que o dono de um canil leia o perfil de quem se candidatou.
-- Executar depois de profiles.sql e canis_animais_policies.sql.

-- 1) handle_new_user passa a criar o canil associado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_role text;
  resolved_role public.app_role;
begin
  metadata_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');
  resolved_role := case
    when metadata_role in ('user', 'canil') then metadata_role::public.app_role
    else 'user'::public.app_role
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    resolved_role
  );

  if resolved_role = 'canil'
     and not exists (select 1 from public.canis where owner_profile_id = new.id) then
    insert into public.canis (owner_profile_id, nome, localizacao, missao, telefone, email_contacto)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'shelter_name', ''),
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        'O meu canil'
      ),
      coalesce(nullif(new.raw_user_meta_data ->> 'shelter_location', ''), 'Por definir'),
      nullif(new.raw_user_meta_data ->> 'shelter_mission', ''),
      nullif(new.raw_user_meta_data ->> 'contact_phone', ''),
      new.email
    );
  end if;

  return new;
end;
$$;

-- 2) O dono de um canil pode ler o perfil de quem se candidatou ao seu canil.
drop policy if exists "Shelter owners can read applicant profiles" on public.profiles;
create policy "Shelter owners can read applicant profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.pedidos_adocao p
    join public.canis c on c.id = p.canil_id
    where p.applicant_profile_id = profiles.id
      and c.owner_profile_id = auth.uid()
  )
);

-- Source: canil_animais_extra.sql
-- Extras para gestao de canil:
--  - coluna `verificado` em canis (controlada pelo admin)
--  - politica de delete para animais (dono do canil ou admin)
-- Executar depois de canis_animais_policies.sql.

alter table public.canis
  add column if not exists verificado boolean not null default false;

grant delete on table public.animais to authenticated;

drop policy if exists "Canil owner or admin can delete animais" on public.animais;
create policy "Canil owner or admin can delete animais"
on public.animais
for delete
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = animais.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

-- Source: adoption_application_form.sql
-- Adiciona suporte para questionario estruturado de adopcao em pedidos_adocao.
-- Coluna `respostas` (jsonb) guarda respostas do formulario do adotante.
-- Executar depois de adoption_requests_messages.sql.

alter table public.pedidos_adocao
  add column if not exists respostas jsonb not null default '{}'::jsonb;

-- Indice GIN para consultas por chave (opcional, util para filtros futuros)
create index if not exists pedidos_adocao_respostas_idx
  on public.pedidos_adocao
  using gin (respostas);

-- Source: adoption_complete_cycle.sql
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

-- Source: favoritos.sql
-- Favoritos: animais marcados por adotantes
-- Executar depois de profiles.sql e canis_animais_policies.sql

create table if not exists public.favoritos (
  user_profile_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid not null references public.animais(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_profile_id, animal_id)
);

create index if not exists favoritos_user_idx on public.favoritos (user_profile_id, created_at desc);
create index if not exists favoritos_animal_idx on public.favoritos (animal_id);

alter table public.favoritos enable row level security;

grant select, insert, delete on public.favoritos to authenticated;

drop policy if exists "Users can read own favorites" on public.favoritos;
create policy "Users can read own favorites"
on public.favoritos
for select
to authenticated
using (user_profile_id = auth.uid());

drop policy if exists "Users can add favorites" on public.favoritos;
create policy "Users can add favorites"
on public.favoritos
for insert
to authenticated
with check (user_profile_id = auth.uid());

drop policy if exists "Users can remove favorites" on public.favoritos;
create policy "Users can remove favorites"
on public.favoritos
for delete
to authenticated
using (user_profile_id = auth.uid());

-- Source: visitas.sql
-- Agendamento de visitas ao canil, ligado a um pedido de adopcao.
-- Executar depois de adoption_requests_messages.sql.

create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_adocao(id) on delete cascade,
  canil_id uuid not null references public.canis(id) on delete cascade,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid references public.animais(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'proposta' check (status in ('proposta', 'confirmada', 'cancelada', 'realizada')),
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists visitas_pedido_idx on public.visitas (pedido_id, scheduled_at);
create index if not exists visitas_canil_idx on public.visitas (canil_id, scheduled_at);
create index if not exists visitas_applicant_idx on public.visitas (applicant_profile_id, scheduled_at);

alter table public.visitas enable row level security;

grant select, insert, update on public.visitas to authenticated;

-- Leitura: adotante da visita ou dono do canil (ou admin).
drop policy if exists "Participants can read visits" on public.visitas;
create policy "Participants can read visits"
on public.visitas
for select
to authenticated
using (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = visitas.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
        )
      )
  )
);

-- Criar: adotante propoe visita para o seu proprio pedido.
drop policy if exists "Adopters can propose visits" on public.visitas;
create policy "Adopters can propose visits"
on public.visitas
for insert
to authenticated
with check (
  applicant_profile_id = auth.uid()
  and exists (
    select 1
    from public.pedidos_adocao p
    where p.id = visitas.pedido_id
      and p.applicant_profile_id = auth.uid()
  )
);

-- Atualizar: adotante ou dono do canil (confirmar/cancelar/concluir).
drop policy if exists "Participants can update visits" on public.visitas;
create policy "Participants can update visits"
on public.visitas
for update
to authenticated
using (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = visitas.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
        )
      )
  )
)
with check (
  applicant_profile_id = auth.uid()
  or exists (
    select 1
    from public.canis c
    where c.id = visitas.canil_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
        )
      )
  )
);

-- Source: notificacoes.sql
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

-- Source: app_settings.sql
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute procedure public.set_updated_at();

drop policy if exists "Anyone can read app settings" on public.app_settings;
create policy "Anyone can read app settings"
on public.app_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert app settings" on public.app_settings;
create policy "Admins can insert app settings"
on public.app_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "Admins can update app settings" on public.app_settings;
create policy "Admins can update app settings"
on public.app_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Source: animal_fotos.sql
-- Fotos de animais (galeria real)
-- Liga ficheiros no bucket Supabase Storage 'animal-photos' a animais.
-- Cria o bucket manualmente no painel Storage (publico = true) antes de executar.

create table if not exists public.animal_fotos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animais(id) on delete cascade,
  storage_path text not null,
  public_url text,
  is_primary boolean not null default false,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists animal_fotos_animal_idx on public.animal_fotos (animal_id, created_at desc);
create unique index if not exists animal_fotos_one_primary
  on public.animal_fotos (animal_id)
  where is_primary = true;

alter table public.animal_fotos enable row level security;

grant select on public.animal_fotos to anon, authenticated;
grant insert, update, delete on public.animal_fotos to authenticated;

drop policy if exists "Public can read animal photos" on public.animal_fotos;
create policy "Public can read animal photos"
on public.animal_fotos
for select
to anon, authenticated
using (true);

drop policy if exists "Shelter owner or admin can insert photos" on public.animal_fotos;
create policy "Shelter owner or admin can insert photos"
on public.animal_fotos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Shelter owner or admin can update photos" on public.animal_fotos;
create policy "Shelter owner or admin can update photos"
on public.animal_fotos
for update
to authenticated
using (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "Shelter owner or admin can delete photos" on public.animal_fotos;
create policy "Shelter owner or admin can delete photos"
on public.animal_fotos
for delete
to authenticated
using (
  exists (
    select 1
    from public.animais a
    join public.canis c on c.id = a.canil_id
    where a.id = animal_fotos.animal_id
      and (
        c.owner_profile_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

-- Storage policies para o bucket 'animal-photos'.
-- O bucket tem de ser criado em Storage antes de executar este bloco.
-- Comentar este bloco se a politica ja existir no projeto.
do $$
begin
  if exists (select 1 from storage.buckets where id = 'animal-photos') then
    drop policy if exists "Public can read animal photos in storage" on storage.objects;
    create policy "Public can read animal photos in storage"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'animal-photos');

    drop policy if exists "Shelter owner can upload animal photos" on storage.objects;
    create policy "Shelter owner can upload animal photos"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'animal-photos');

    drop policy if exists "Shelter owner can delete own animal photos" on storage.objects;
    create policy "Shelter owner can delete own animal photos"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'animal-photos' and owner = auth.uid());
  end if;
end
$$;

-- Source: avaliacoes_canil.sql
-- Avaliacoes de canis pelos adotantes.
-- So pode avaliar quem concluiu uma adopcao com esse canil.
-- Executar depois de adoption_complete_cycle.sql.

create table if not exists public.avaliacoes_canil (
  id uuid primary key default gen_random_uuid(),
  canil_id uuid not null references public.canis(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique (canil_id, author_profile_id)
);

create index if not exists avaliacoes_canil_canil_idx
  on public.avaliacoes_canil (canil_id, created_at desc);

alter table public.avaliacoes_canil enable row level security;

grant select on public.avaliacoes_canil to anon, authenticated;
grant insert, update, delete on public.avaliacoes_canil to authenticated;

drop policy if exists "Public can read shelter reviews" on public.avaliacoes_canil;
create policy "Public can read shelter reviews"
on public.avaliacoes_canil
for select
to anon, authenticated
using (true);

drop policy if exists "Adopters with completed adoption can review" on public.avaliacoes_canil;
create policy "Adopters with completed adoption can review"
on public.avaliacoes_canil
for insert
to authenticated
with check (
  author_profile_id = auth.uid()
  and exists (
    select 1
    from public.pedidos_adocao p
    where p.canil_id = avaliacoes_canil.canil_id
      and p.applicant_profile_id = auth.uid()
      and p.status = 'concluido'
  )
);

drop policy if exists "Authors can update own review" on public.avaliacoes_canil;
create policy "Authors can update own review"
on public.avaliacoes_canil
for update
to authenticated
using (author_profile_id = auth.uid())
with check (author_profile_id = auth.uid());

drop policy if exists "Authors can delete own review" on public.avaliacoes_canil;
create policy "Authors can delete own review"
on public.avaliacoes_canil
for delete
to authenticated
using (author_profile_id = auth.uid());

-- Source: avaliacoes_canil_moderacao.sql
-- Moderacao de avaliacoes de canis:
--  - qualquer utilizador autenticado pode submeter uma avaliacao;
--  - a avaliacao fica 'pendente' ate o dono do canil a aprovar;
--  - so avaliacoes 'aprovada' sao visiveis publicamente.
-- Executar depois de avaliacoes_canil.sql.

alter table public.avaliacoes_canil
  add column if not exists estado text not null default 'pendente'
    check (estado in ('pendente', 'aprovada', 'rejeitada'));

alter table public.avaliacoes_canil
  add column if not exists author_name text;

-- INSERT: qualquer utilizador autenticado (deixa de exigir adopcao concluida).
drop policy if exists "Adopters with completed adoption can review" on public.avaliacoes_canil;
drop policy if exists "Authenticated users can submit reviews" on public.avaliacoes_canil;
create policy "Authenticated users can submit reviews"
on public.avaliacoes_canil
for insert
to authenticated
with check (author_profile_id = auth.uid());

-- SELECT: publico ve aprovadas; autor ve as suas; dono do canil ve as do seu canil.
drop policy if exists "Public can read shelter reviews" on public.avaliacoes_canil;

drop policy if exists "Public can read approved reviews" on public.avaliacoes_canil;
create policy "Public can read approved reviews"
on public.avaliacoes_canil
for select
to anon, authenticated
using (estado = 'aprovada');

drop policy if exists "Authors can read own reviews" on public.avaliacoes_canil;
create policy "Authors can read own reviews"
on public.avaliacoes_canil
for select
to authenticated
using (author_profile_id = auth.uid());

drop policy if exists "Shelter owners can read their reviews" on public.avaliacoes_canil;
create policy "Shelter owners can read their reviews"
on public.avaliacoes_canil
for select
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = avaliacoes_canil.canil_id
      and c.owner_profile_id = auth.uid()
  )
);

-- UPDATE: o dono do canil pode moderar (mudar o estado) as avaliacoes do seu canil.
drop policy if exists "Shelter owners can moderate reviews" on public.avaliacoes_canil;
create policy "Shelter owners can moderate reviews"
on public.avaliacoes_canil
for update
to authenticated
using (
  exists (
    select 1
    from public.canis c
    where c.id = avaliacoes_canil.canil_id
      and c.owner_profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.canis c
    where c.id = avaliacoes_canil.canil_id
      and c.owner_profile_id = auth.uid()
  )
);
