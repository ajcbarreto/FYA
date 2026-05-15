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
