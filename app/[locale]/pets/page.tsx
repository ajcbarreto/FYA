import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { CatalogPetResults } from "@/components/catalog-pet-results";
import { ClientGetForm } from "@/components/client-get-form";
import { CatalogResultsSkeleton } from "@/components/skeletons/catalog-results-skeleton";
import { isLocale } from "@/lib/i18n/config";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getPublicCatalogFilters } from "@/lib/pet-catalog/public-data";
import { normalizePetCatalogFiltersConfig } from "@/lib/pet-catalog/filter-config";
import { configuredOptions } from "@/lib/pet-catalog/options";
import { staticPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "pets");
}

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
  const q = value("q");
  const location = value("location");
  const config = hasSupabaseEnv
    ? await getPublicCatalogFilters()
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
  const speciesSelect = selects.find((s) => s.name === "species")!;
  const ageSelect = selects.find((s) => s.name === "age")!;
  const moreSelects = selects.filter(
    (s) => s.name !== "species" && s.name !== "age",
  );
  const moreActive = moreSelects.filter((s) => selected[s.name]).length;
  const speciesEmoji: Record<string, string> = {
    "": "🐾",
    cao: "🐶",
    gato: "🐱",
  };

  return (
    <main id="main-content" tabIndex={-1} className="page-shell">
      <Breadcrumbs
        locale={locale}
        items={[{ label: sectionCrumb(locale, "pets").label }]}
        currentPath="/pets"
      />
      <header className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h1 className="display-title text-2xl sm:text-3xl">
          {pt ? "Animais para adoção" : "Animals for adoption"}
        </h1>
        <Link
          href={`/${locale}/match`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
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
      <ClientGetForm
        action={`/${locale}/pets`}
        autoSubmit
        className="group/filters mb-6 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <legend className="sr-only">{speciesSelect.label}</legend>
            {[
              { value: "", label: pt ? "Todos" : "All" },
              ...speciesSelect.options.filter((o) => o.value !== "outro"),
            ].map((option) => {
              return (
                <label
                  key={option.value || "all"}
                  className="group/species shrink-0"
                >
                  <input
                    type="radio"
                    name="species"
                    value={option.value}
                    defaultChecked={selected.species === option.value}
                    className="peer sr-only"
                  />
                  <span className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card py-1 pl-1 pr-4 text-sm font-bold transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center rounded-full bg-muted text-base group-has-[:checked]/species:bg-[#e9edb9]"
                    >
                      {speciesEmoji[option.value] ?? "🐾"}
                    </span>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </fieldset>
          <fieldset className="flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-muted p-1 [scrollbar-width:none]">
            <legend className="sr-only">{ageSelect.label}</legend>
            {[
              { value: "", label: pt ? "Qualquer idade" : "Any age" },
              ...ageSelect.options,
            ].map((option) => (
              <label key={option.value || "any"} className="shrink-0">
                <input
                  type="radio"
                  name="age"
                  value={option.value}
                  defaultChecked={selected.age === option.value}
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
            <label className="relative col-span-2 sm:col-span-1">
              <span className="sr-only">
                {pt ? "Nome ou descrição" : "Name or description"}
              </span>
              <Search className="absolute left-4 top-4 size-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder={pt ? "Nome ou raça" : "Name or breed"}
                className="field pl-11"
              />
            </label>
            <label className="relative col-span-2 sm:col-span-1">
              <span className="sr-only">{pt ? "Localização" : "Location"}</span>
              <MapPin className="absolute left-4 top-4 size-4 text-muted-foreground" />
              <input
                name="location"
                defaultValue={location}
                placeholder={pt ? "Cidade ou região" : "City or region"}
                className="field pl-11"
              />
            </label>
            <details className="group/more">
              <summary className="button-secondary h-full w-full cursor-pointer list-none marker:hidden group-open/more:border-primary group-open/more:bg-primary group-open/more:text-primary-foreground [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="size-4" />
                {pt ? "Mais filtros" : "More filters"}
                {moreActive > 0 && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground group-open/more:bg-card group-open/more:text-primary">
                    {moreActive}
                  </span>
                )}
              </summary>
            </details>
            <button className="button-primary">
              {pt ? "Procurar" : "Search"}
              <Search className="size-4" />
            </button>
          </div>
          <div className="hidden gap-5 border-t border-border/50 px-2 pb-2 pt-4 group-has-[details[open]]/filters:grid sm:grid-cols-3">
            {moreSelects.map((group) => (
              <fieldset key={group.name}>
                <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "", label: pt ? "Todos" : "All" },
                    ...group.options,
                  ].map((option) => (
                    <label key={option.value || "all"}>
                      <input
                        type="radio"
                        name={group.name}
                        value={option.value}
                        defaultChecked={selected[group.name] === option.value}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-9 cursor-pointer items-center rounded-full border border-border bg-card px-3.5 text-sm font-semibold transition-colors hover:border-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </ClientGetForm>
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
      <Suspense fallback={<CatalogResultsSkeleton />}>
        <CatalogPetResults
          locale={locale}
          options={options}
          urlParamsString={urlParams.toString()}
          requestedPage={value("page")}
          selects={selects}
        />
      </Suspense>
    </main>
  );
}
