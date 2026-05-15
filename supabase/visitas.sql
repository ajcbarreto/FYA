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
