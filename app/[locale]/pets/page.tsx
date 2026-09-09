import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  PawPrint,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCatalogPets, getCatalogPetsCount } from "@/lib/pet-catalog/db-pets";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import {
  getPetCatalogFiltersConfig,
  normalizePetCatalogFiltersConfig,
} from "@/lib/pet-catalog/filter-config";
import { configuredOptions } from "@/lib/pet-catalog/options";
import { PetCard } from "@/components/pet-card";
export default async function Catalog({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const values = await searchParams;
  const value = (key: string) =>
    typeof values[key] === "string" ? values[key]!.trim().slice(0, 120) : "";
  const q = value("q"),
    location = value("location");
  const supabase = hasSupabaseEnv ? await createServerSupabaseClient() : null;
  const config = supabase
    ? await getPetCatalogFiltersConfig(supabase)
    : normalizePetCatalogFiltersConfig(null);
  const selects = [
    {
      name: "species",
      label: pt ? "Espécie" : "Species",
      options: configuredOptions("species", config.species, locale),
    },
    {
      name: "sex",
      label: pt ? "Sexo" : "Sex",
      options: configuredOptions("genders", config.genders, locale),
    },
    {
      name: "size",
      label: pt ? "Porte" : "Size",
      options: configuredOptions("sizes", config.sizes, locale),
    },
    {
      name: "age",
      label: pt ? "Idade" : "Age",
      options: configuredOptions("ageRanges", config.ageRanges, locale),
    },
    {
      name: "compatibility",
      label: pt ? "Compatibilidade" : "Compatibility",
      options: configuredOptions(
        "compatibilities",
        config.compatibilities,
        locale,
      ),
    },
  ];
  const selected = Object.fromEntries(
    selects.map((s) => [
      s.name,
      s.options.some((o) => o.value === value(s.name)) ? value(s.name) : "",
    ]),
  );
  const options = {
    search: q,
    location,
    species: selected.species,
    sex: selected.sex,
    size: selected.size,
    age: selected.age,
    compatibility: selected.compatibility,
  };
  const urlParams = new URLSearchParams();
  if (q) urlParams.set("q", q);
  if (location) urlParams.set("location", location);
  for (const [k, v] of Object.entries(selected)) if (v) urlParams.set(k, v);
  const href = (page: number) => {
    const p = new URLSearchParams(urlParams);
    if (page > 1) p.set("page", String(page));
    return `/${locale}/pets${p.size ? `?${p}` : ""}`;
  };
  const total = supabase ? await getCatalogPetsCount(supabase, options) : 0;
  const pages = Math.max(1, Math.ceil(total / 16));
  const requested = Math.max(1, Number.parseInt(value("page"), 10) || 1);
  const page = Math.min(requested, pages);
  if (requested !== page) redirect(href(page));
  const [pets, auth] = supabase
    ? await Promise.all([
        getCatalogPets(supabase, locale, { ...options, limit: 16, page }),
        supabase.auth.getUser(),
      ])
    : [[], { data: { user: null } }];
  const favorites =
    supabase && auth.data.user
      ? await getFavoriteAnimalIds(supabase, auth.data.user.id)
      : new Set<string>();
  const active = Array.from(urlParams.entries());
  const pageNumbers = Array.from(new Set([1, page - 1, page, page + 1, pages]))
    .filter((n) => n > 0 && n <= pages)
    .sort((a, b) => a - b);
  return (
    <main id="main-content" tabIndex={-1} className="page-shell">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow hidden sm:block">
            {pt
              ? "O próximo capítulo começa aqui"
              : "The next chapter starts here"}
          </p>
          <h1 className="display-title text-2xl sm:mt-1 sm:text-3xl lg:text-4xl">
            {pt ? "Encontra o teu companheiro." : "Find your companion."}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            {pt
              ? "Cada um com a sua personalidade. Todos com uma história para partilhar."
              : "Each with a personality. All with a story to share."}
          </p>
        </div>
        <Link href={`/${locale}/match`} className="button-secondary">
          {pt ? "Ajuda-me a escolher" : "Help me choose"}
          <ArrowUpRight className="size-4" />
        </Link>
      </header>
      {value("match") === "true" && (
        <p className="mb-6 rounded-2xl bg-muted p-5 text-sm leading-6">
          {pt
            ? "Estes resultados seguem a espécie escolhida e, se aplicável, a compatibilidade com apartamento confirmada pelo abrigo. A disponibilidade de tempo e as necessidades de cada animal devem ser conversadas com a equipa; o porte não determina a sua rotina."
            : "These results follow your preferred species and, where relevant, apartment compatibility confirmed by the shelter. Discuss your available time and each animal’s needs with the team; size does not determine their routine."}
        </p>
      )}
      <form method="get" className="surface mb-8 space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">
              {pt ? "Nome ou descrição" : "Name or description"}
            </span>
            <Search className="absolute left-4 top-4 size-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder={
                pt
                  ? "Nome, raça ou uma palavra especial…"
                  : "Name, breed or a special word…"
              }
              className="field pl-11"
            />
          </label>
          <label>
            <span className="sr-only">{pt ? "Localização" : "Location"}</span>
            <input
              name="location"
              defaultValue={location}
              placeholder={pt ? "Cidade ou região" : "City or region"}
              className="field"
            />
          </label>
          <button className="button-primary">
            {pt ? "Encontrar amigos" : "Find friends"}
            <Search className="size-4" />
          </button>
        </div>
        <details className="group" open={Object.values(selected).some(Boolean)}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-muted-foreground marker:hidden [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>
              {pt ? "Mostrar filtros avançados" : "Show advanced filters"}
            </span>
            <span className="ml-auto rounded-full bg-muted px-2 py-1 text-[10px] font-bold group-open:hidden">
              {pt ? "Opcional" : "Optional"}
            </span>
            <span className="ml-auto hidden text-primary group-open:inline">
              {pt ? "Esconder" : "Hide"}
            </span>
          </summary>
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border/40 pt-4">
            {selects.map((s) => (
              <label
                key={s.name}
                className="min-w-[125px] flex-1 text-xs font-semibold text-muted-foreground"
              >
                {s.label}
                <select
                  name={s.name}
                  defaultValue={selected[s.name]}
                  className="field mt-1"
                >
                  <option value="">{pt ? "Todos" : "All"}</option>
                  {s.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </details>
      </form>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {total}{" "}
          {pt
            ? total === 1
              ? "animal encontrado"
              : "animais encontrados"
            : total === 1
              ? "animal found"
              : "animals found"}
        </p>
        <div className="flex flex-wrap gap-2">
          {active.map(([key, v]) => {
            const p = new URLSearchParams(urlParams);
            p.delete(key);
            const label =
              selects
                .find((s) => s.name === key)
                ?.options.find((o) => o.value === v)?.label ?? v;
            return (
              <Link
                key={key}
                href={`/${locale}/pets?${p}`}
                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs"
                aria-label={`${pt ? "Remover" : "Remove"} ${label}`}
              >
                {label}
                <X className="size-3" />
              </Link>
            );
          })}
        </div>
      </div>
      {!hasSupabaseEnv && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-border bg-muted p-4 text-sm"
        >
          {pt
            ? "O catálogo está temporariamente indisponível. Tenta novamente mais tarde."
            : "The catalog is temporarily unavailable. Please try again later."}
        </p>
      )}
      {pets.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              locale={locale}
              isFavorite={favorites.has(pet.id)}
              returnTo={href(page)}
            />
          ))}
        </div>
      ) : (
        hasSupabaseEnv && (
          <div className="surface py-16 text-center">
            <PawPrint className="mx-auto mb-5 size-10 text-secondary" />
            <h2 className="text-2xl font-semibold">
              {pt
                ? "Ainda não encontrámos esse amigo."
                : "We haven't found that friend yet."}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {pt
                ? "Experimenta uma pesquisa mais ampla ou remove alguns filtros."
                : "Try a broader search or remove a few filters."}
            </p>
            {active.length > 0 && (
              <Link href={`/${locale}/pets`} className="button-secondary mt-6">
                {pt ? "Limpar filtros" : "Clear filters"}
              </Link>
            )}
          </div>
        )
      )}
      {pages > 1 && (
        <nav
          aria-label={pt ? "Paginação" : "Pagination"}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {page > 1 && (
            <Link href={href(page - 1)} className="button-secondary">
              {pt ? "Anterior" : "Previous"}
            </Link>
          )}
          {pageNumbers.map((n) => (
            <Link
              key={n}
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className={n === page ? "button-primary" : "button-secondary"}
            >
              {n}
            </Link>
          ))}
          {page < pages && (
            <Link href={href(page + 1)} className="button-secondary">
              {pt ? "Seguinte" : "Next"}
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
