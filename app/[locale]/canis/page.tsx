import { ClientGetForm } from "@/components/client-get-form";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Map as MapIcon,
  MapPin,
  PawPrint,
  Search,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { listPublicShelters } from "@/lib/canil/public-directory";
import { getShelterRatingSummaries } from "@/lib/canil/reviews";
import { filterDirectory, normalized } from "@/lib/canil/directory-filters";
import { ShelterDirectoryMap } from "@/components/shelter-directory-map";
import { localityCoordinates } from "@/lib/canil/locality-coordinates";
import { StarRating } from "@/components/star-rating";
import { staticPageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "shelters");
}

type SheltersDirectoryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    location?: string;
    species?: string;
    available?: string;
    sort?: string;
  }>;
};

export default async function SheltersDirectoryPage({
  params,
  searchParams,
}: SheltersDirectoryPageProps) {
  const { locale } = await params;
  const {
    q,
    location = "",
    species: requestedSpecies = "",
    available,
    sort = "name",
  } = await searchParams;
  const species = ["cao", "gato"].includes(requestedSpecies)
    ? requestedSpecies
    : "";
  const query = (q ?? "").trim();

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = createPublicSupabaseClient(
    supabaseUrl,
    supabasePublishableKey,
  );
  const allShelters = await listPublicShelters(supabase);
  const animals = [];
  // Read in pages so availability filters are not silently truncated by PostgREST.
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase
      .from("animais")
      .select("id,canil_id,especie,status")
      .order("id")
      .range(start, start + 499);
    if (error)
      throw new Error("Unable to load shelter animals", { cause: error });
    animals.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }
  const shelters = filterDirectory(allShelters, animals, {
    query,
    location,
    species,
    available: available === "1",
    sort,
  });
  const locations = [
    ...new Map(
      allShelters
        .filter((s) => s.localizacao.trim())
        .map((s) => [normalized(s.localizacao), s.localizacao.trim()]),
    ).values(),
  ].sort((a, b) => a.localeCompare(b, "pt"));
  const availableCount = new Map<string, number>();
  for (const animal of animals)
    if (animal.status === "disponivel")
      availableCount.set(
        animal.canil_id,
        (availableCount.get(animal.canil_id) ?? 0) + 1,
      );
  const animalsCount = new Map<string, number>();
  for (const animal of animals)
    animalsCount.set(
      animal.canil_id,
      (animalsCount.get(animal.canil_id) ?? 0) + 1,
    );
  const ratingSummaries = await getShelterRatingSummaries(
    supabase,
    shelters.map((s) => s.id),
  );
  const hasFilters = Boolean(
    query || location || species || available === "1" || sort === "available",
  );

  const sortOptions = [
    { value: "name", label: locale === "pt" ? "A–Z" : "A–Z" },
    {
      value: "available",
      label: locale === "pt" ? "Mais animais" : "Most animals",
    },
  ];

  const copy =
    locale === "pt"
      ? {
          title: "Canis e abrigos parceiros",
          subtitle:
            "Encontra um abrigo, conhece os seus animais e descobre como podes ajudar.",
          searchPlaceholder: "Nome do abrigo ou missão",
          empty: "Sem canis encontrados para essa pesquisa.",
          totalPets: (count: number) =>
            `${count} ${count === 1 ? "animal" : "animais"}`,
          openCanil: "Conhecer e ajudar",
          submit: "Procurar",
        }
      : {
          title: "Shelters and rescue groups",
          subtitle:
            "Organisations registered on FYA, with the animals they have for adoption and how to contact them.",
          searchPlaceholder: "Name or town",
          empty: "No shelters match this search.",
          totalPets: (count: number) =>
            `${count} ${count === 1 ? "pet" : "pets"}`,
          openCanil: "Meet and support",
          submit: "Search",
        };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-5 pb-16 pt-10 sm:px-8"
    >
      <Breadcrumbs
        locale={locale}
        items={[{ label: sectionCrumb(locale, "shelters").label }]}
        currentPath="/canis"
      />
      <header className="mb-4">
        <h1 className="display-title text-2xl sm:text-3xl">{copy.title}</h1>
      </header>

      <ClientGetForm
        action={`/${locale}/canis`}
        key={`${query}|${location}|${species}|${available}|${sort}`}
        autoSubmit
        className="mb-4 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label>
              <input
                type="checkbox"
                name="available"
                value="1"
                defaultChecked={available === "1"}
                className="peer sr-only"
              />
              <span className="flex h-10 cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card px-4 text-sm font-bold transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <PawPrint className="size-4" aria-hidden="true" />
                {locale === "pt"
                  ? "Com animais para adoção"
                  : "With animals to adopt"}
              </span>
            </label>
          </div>
          <fieldset className="flex gap-0.5 rounded-full bg-muted p-1">
            <legend className="sr-only">
              {locale === "pt" ? "Ordenar por" : "Sort by"}
            </legend>
            {sortOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  defaultChecked={
                    (sort === "available" ? "available" : "name") ===
                    option.value
                  }
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground peer-checked:bg-card peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
          <label className="relative col-span-2 sm:col-span-1">
            <span className="sr-only">
              {locale === "pt" ? "Procurar abrigos" : "Search shelters"}
            </span>
            <Search className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder={copy.searchPlaceholder}
              className="field pl-11"
            />
          </label>
          <label className="relative col-span-2 sm:col-span-1">
            <span className="sr-only">
              {locale === "pt" ? "Localidade" : "Location"}
            </span>
            <MapPin className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
            <select
              name="location"
              defaultValue={location}
              className="field pl-11"
            >
              <option value="">
                {locale === "pt" ? "Todas as localidades" : "All locations"}
              </option>
              {location && !locations.includes(location) && (
                <option value={location}>{location}</option>
              )}
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton
            type="submit"
            className="button-primary col-span-2 sm:col-span-1"
          >
            {copy.submit}
            <Search className="size-4" />
          </SubmitButton>
        </div>
      </ClientGetForm>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p role="status" className="text-sm font-semibold">
            {shelters.length}{" "}
            {locale === "pt" ? "abrigos encontrados" : "shelters found"}
          </p>
          {hasFilters && (
            <Link
              href={`/${locale}/canis`}
              className="text-sm font-bold text-accent hover:underline"
            >
              {locale === "pt" ? "Limpar filtros" : "Clear filters"}
            </Link>
          )}
        </div>
        {shelters.some((s) => localityCoordinates(s.localizacao)) && (
          <a
            href="#mapa"
            className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-border bg-card px-4 text-sm font-bold transition-colors hover:border-primary/50"
          >
            <MapIcon className="size-4" aria-hidden="true" />
            {locale === "pt" ? "Ver no mapa" : "Show on map"}
          </a>
        )}
      </div>
      {shelters.length === 0 ? (
        <p className="rounded-3xl border border-border/30 bg-card p-10 text-center text-sm text-muted-foreground">
          {copy.empty}
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shelters.map((shelter) => {
            const count = animalsCount.get(shelter.id) ?? 0;
            const rating = ratingSummaries.get(shelter.id);
            return (
              <Link
                key={shelter.id}
                href={`/${locale}/canis/${shelter.id}`}
                className="group flex min-w-0 flex-col rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg sm:p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  {shelter.image_url ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                      <Image
                        src={shelter.image_url}
                        unoptimized
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-muted text-primary">
                      <Building2 aria-hidden="true" className="size-6" />
                    </div>
                  )}
                  {shelter.verificado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-primary">
                      <BadgeCheck className="h-3 w-3" />
                      {locale === "pt" ? "Verificado" : "Verified"}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">{shelter.nome}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {shelter.localizacao}
                </p>
                {rating && rating.count > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <StarRating value={rating.average} />
                    {rating.average.toFixed(1)} ({rating.count})
                  </p>
                )}
                {shelter.missao && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {shelter.missao}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-sm font-semibold">
                  <span className="inline-flex items-center gap-1 text-secondary">
                    <PawPrint className="h-3.5 w-3.5" />
                    {copy.totalPets(count)}
                  </span>
                  <span className="text-primary transition-colors group-hover:underline">
                    {copy.openCanil}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
      <ShelterDirectoryMap
        shelters={shelters.map(({ id, nome, localizacao }) => ({
          id,
          nome,
          localizacao,
          animals: availableCount.get(id) ?? 0,
          href: `/${locale}/canis/${id}`,
        }))}
        locale={locale}
      />
    </main>
  );
}
