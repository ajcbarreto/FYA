import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCatalogPets, getCatalogPetsCount } from "@/lib/pet-catalog/db-pets";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import { FavoriteButton } from "@/components/favorite-button";
import { sexOptions, sizeOptions, speciesOptions, statusOptions } from "@/lib/i18n/animals";

type PetCatalogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; species?: string; sex?: string; size?: string; status?: string; page?: string }>;
};

export default async function PetCatalogPage({ params, searchParams }: PetCatalogPageProps) {
  const { locale } = await params;
  const { q, species, sex, size, status, page } = await searchParams;
  const query = (q ?? "").trim();
  const selectedSpecies = (species ?? "").trim().toLowerCase();
  const selectedSex = (sex ?? "").trim().toLowerCase();
  const selectedSize = (size ?? "").trim().toLowerCase();
  const selectedStatus = (status ?? "").trim().toLowerCase();
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const pageSize = 16;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [pets, totalPets, favoriteIds] = await Promise.all([
    getCatalogPets(supabase, locale, {
      search: query,
      species: selectedSpecies || undefined,
      sex: selectedSex || undefined,
      size: selectedSize || undefined,
      status: selectedStatus || undefined,
      limit: pageSize,
      page: currentPage,
    }),
    getCatalogPetsCount(supabase, {
      search: query,
      species: selectedSpecies || undefined,
      sex: selectedSex || undefined,
      size: selectedSize || undefined,
      status: selectedStatus || undefined,
    }),
    user ? getFavoriteAnimalIds(supabase, user.id) : Promise.resolve(new Set<string>()),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPets / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginationBaseParams = new URLSearchParams();
  if (query) paginationBaseParams.set("q", query);
  if (selectedSpecies) paginationBaseParams.set("species", selectedSpecies);
  if (selectedSex) paginationBaseParams.set("sex", selectedSex);
  if (selectedSize) paginationBaseParams.set("size", selectedSize);
  if (selectedStatus) paginationBaseParams.set("status", selectedStatus);
  const catalogRedirectPath = `/${locale}/pets${
    paginationBaseParams.size > 0 ? `?${paginationBaseParams.toString()}` : ""
  }`;
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams(paginationBaseParams.toString());
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    const serialized = params.toString();
    return serialized ? `/${locale}/pets?${serialized}` : `/${locale}/pets`;
  };
  const visiblePages = Array.from(
    new Set([1, safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, totalPages].filter((value) => value >= 1 && value <= totalPages)),
  ).sort((a, b) => a - b);
  const speciesSelectOptions = speciesOptions(locale);
  const sexSelectOptions = sexOptions(locale);
  const sizeSelectOptions = sizeOptions(locale);
  const statusSelectOptions = statusOptions(locale);

  const labelFor = (options: { value: string; label: string }[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value;
  const buildFilterHrefWithout = (key: string) => {
    const params = new URLSearchParams(paginationBaseParams.toString());
    params.delete(key);
    const serialized = params.toString();
    return serialized ? `/${locale}/pets?${serialized}` : `/${locale}/pets`;
  };
  const activeFilters = [
    query ? { key: "q", label: query } : null,
    selectedSpecies ? { key: "species", label: labelFor(speciesSelectOptions, selectedSpecies) } : null,
    selectedSex ? { key: "sex", label: labelFor(sexSelectOptions, selectedSex) } : null,
    selectedSize ? { key: "size", label: labelFor(sizeSelectOptions, selectedSize) } : null,
    selectedStatus ? { key: "status", label: labelFor(statusSelectOptions, selectedStatus) } : null,
  ].filter((value): value is { key: string; label: string } => value !== null);
  const hasActiveFilters = activeFilters.length > 0;

  const copy =
    locale === "pt"
      ? {
          resultsFound: (count: number) => `${count} ${count === 1 ? "animal encontrado" : "animais encontrados"}`,
          noResultsCount: "Sem animais a corresponder.",
          filters: "Filtros",
          apply: "Aplicar",
          activeFilters: "Filtros ativos:",
          emptySearch: "Nao encontramos resultados para esses filtros.",
          emptyDb: "Sem animais disponiveis de momento.",
          select: { species: speciesSelectOptions, sex: sexSelectOptions, size: sizeSelectOptions, status: statusSelectOptions },
        }
      : {
          resultsFound: (count: number) => `${count} ${count === 1 ? "pet found" : "pets found"}`,
          noResultsCount: "No pets match your filters.",
          filters: "Filters",
          apply: "Apply",
          activeFilters: "Active filters:",
          emptySearch: "We could not find results for these filters.",
          emptyDb: "No pets available right now.",
          select: { species: speciesSelectOptions, sex: sexSelectOptions, size: sizeSelectOptions, status: statusSelectOptions },
        };

  const selectClass =
    "h-10 min-w-[140px] flex-1 rounded-full border border-border/40 bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30";

  const footerCopy =
    locale === "pt"
      ? {
          tagline: "Ajudamos pets a encontrar familias para sempre.",
          discover: "Descobrir",
          support: "Suporte",
          discoverLinks: [
            { label: "Encontrar pet", href: `/${locale}/pets` },
            { label: "Diretorio de canis", href: `/${locale}/canis` },
          ],
          supportLinks: ["Centro de ajuda", "Contactar", "Privacidade", "Termos de servico"],
          crafted: "© 2026 FYA (Found Your Animal). Feito com carinho.",
        }
      : {
          tagline: "Helping pets find their forever families.",
          discover: "Discover",
          support: "Support",
          discoverLinks: [
            { label: "Find a pet", href: `/${locale}/pets` },
            { label: "Shelter directory", href: `/${locale}/canis` },
          ],
          supportLinks: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
          crafted: "© 2026 FYA (Found Your Animal). Made with love.",
        };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-12 pt-8 lg:px-8">
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{dictionary.petCatalog.title}</h1>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {totalPets > 0 ? copy.resultsFound(totalPets) : copy.noResultsCount}
            </p>
          </div>
          <Link
            href={`/${locale}/match`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-105"
          >
            <Sparkles className="h-4 w-4" />
            {locale === "pt" ? "Encontrar o meu match" : "Find my match"}
          </Link>
        </div>

        <form
          method="get"
          className="space-y-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm"
        >
          <div className="relative">
            <label htmlFor="catalog-search" className="sr-only">
              {dictionary.petCatalog.searchPlaceholder}
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="catalog-search"
              name="q"
              type="search"
              placeholder={dictionary.petCatalog.searchPlaceholder}
              defaultValue={query}
              className="h-11 w-full rounded-full border border-border/40 bg-background px-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {copy.filters}
            </span>
            <select name="species" defaultValue={selectedSpecies} className={selectClass}>
              {copy.select.species.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select name="sex" defaultValue={selectedSex} className={selectClass}>
              {copy.select.sex.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select name="size" defaultValue={selectedSize} className={selectClass}>
              {copy.select.size.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={selectedStatus} className={selectClass}>
              {copy.select.status.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {copy.apply}
            </button>
          </div>
        </form>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.activeFilters}</span>
            {activeFilters.map((filter) => (
              <Link
                key={filter.key}
                href={buildFilterHrefWithout(filter.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                {filter.label}
                <X className="h-3 w-3" />
              </Link>
            ))}
            <Link
              href={`/${locale}/pets`}
              className="rounded-full px-3 py-1 text-xs font-bold text-secondary hover:underline"
            >
              {dictionary.petCatalog.clearFilters}
            </Link>
          </div>
        )}
      </header>

      {pets.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground">
          {hasActiveFilters ? copy.emptySearch : copy.emptyDb}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
          {pets.map((pet) => (
            <article
              key={pet.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={pet.imageUrl}
                  alt={pet.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <FavoriteButton
                  animalId={pet.id}
                  locale={locale}
                  isFavorite={favoriteIds.has(pet.id)}
                  redirectTo={catalogRedirectPath}
                />
                {pet.badge && (
                  <span
                    className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white ${
                      pet.badge === "new" ? "bg-secondary" : "bg-primary"
                    }`}
                  >
                    {pet.badge === "new" ? dictionary.petCatalog.tags.newArrival : dictionary.petCatalog.tags.urgent}
                  </span>
                )}
              </div>

              <Link
                href={`/${locale}/pets/${pet.id}`}
                className="flex flex-1 flex-col gap-1.5 p-4"
                aria-label={`${pet.name}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-base font-bold">{pet.name}</h2>
                  <span className="shrink-0 text-xs font-bold text-primary">{pet.age}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pet.species} • {pet.sex}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {pet.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          <Link
            href={buildPageHref(Math.max(1, safeCurrentPage - 1))}
            aria-disabled={safeCurrentPage <= 1}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              safeCurrentPage <= 1 ? "pointer-events-none bg-muted text-muted-foreground/50" : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            {dictionary.petCatalog.pagination.previous}
          </Link>
          {visiblePages.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={buildPageHref(pageNumber)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                pageNumber === safeCurrentPage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-primary"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
          <Link
            href={buildPageHref(Math.min(totalPages, safeCurrentPage + 1))}
            aria-disabled={safeCurrentPage >= totalPages}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              safeCurrentPage >= totalPages
                ? "pointer-events-none bg-muted text-muted-foreground/50"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            {dictionary.petCatalog.pagination.next}
          </Link>
        </nav>
      )}

      <footer className="mt-24 w-full border-t border-border/30 bg-muted/45">
        <div className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-3">
          <div className="space-y-4">
            <div className="text-2xl font-black text-primary">FYA</div>
            <p className="text-sm text-muted-foreground">{footerCopy.tagline}</p>
          </div>
          <div>
            <h4 className="mb-5 text-base font-bold text-secondary">{footerCopy.discover}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerCopy.discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-base font-bold text-secondary">{footerCopy.support}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerCopy.supportLinks.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/20 px-8 py-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {footerCopy.crafted}
        </div>
      </footer>
    </main>
  );
}
