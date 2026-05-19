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
