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
