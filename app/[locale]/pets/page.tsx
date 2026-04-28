import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  PawPrint,
  Search,
  StretchHorizontal,
  VenusAndMars,
  Users,
  Timer,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetCatalogFiltersConfig } from "@/lib/pet-catalog/filter-config";
import { getCatalogPets, getCatalogPetsCount } from "@/lib/pet-catalog/db-pets";

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
  const pageSize = 12;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const filters = dictionary.petCatalog.sections;
  const supabase = await createServerSupabaseClient();
  const [filterConfig, pets, totalPets] = await Promise.all([
    getPetCatalogFiltersConfig(supabase),
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
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPets / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginationBaseParams = new URLSearchParams();
  if (query) paginationBaseParams.set("q", query);
  if (selectedSpecies) paginationBaseParams.set("species", selectedSpecies);
  if (selectedSex) paginationBaseParams.set("sex", selectedSex);
  if (selectedSize) paginationBaseParams.set("size", selectedSize);
  if (selectedStatus) paginationBaseParams.set("status", selectedStatus);
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
  const speciesOptions = [
    { value: "", label: locale === "pt" ? "Todas as especies" : "All species" },
    { value: "cao", label: locale === "pt" ? "Caes" : "Dogs" },
    { value: "gato", label: locale === "pt" ? "Gatos" : "Cats" },
  ];
  const sexOptions = [
    { value: "", label: locale === "pt" ? "Qualquer genero" : "Any gender" },
    { value: "macho", label: locale === "pt" ? "Macho" : "Male" },
    { value: "femea", label: locale === "pt" ? "Femea" : "Female" },
  ];
  const sizeOptions = [
    { value: "", label: locale === "pt" ? "Qualquer porte" : "Any size" },
    { value: "pequeno", label: locale === "pt" ? "Pequeno" : "Small" },
    { value: "medio", label: locale === "pt" ? "Medio" : "Medium" },
    { value: "grande", label: locale === "pt" ? "Grande" : "Large" },
  ];
  const statusOptions = [
    { value: "", label: locale === "pt" ? "Qualquer estado" : "Any status" },
    { value: "disponivel", label: locale === "pt" ? "Disponivel" : "Available" },
    { value: "reservado", label: locale === "pt" ? "Reservado" : "Reserved" },
    { value: "em_tratamento", label: locale === "pt" ? "Em tratamento" : "In treatment" },
    { value: "adotado", label: locale === "pt" ? "Adotado" : "Adopted" },
  ];
  const sectionRows = [
    { icon: Timer, label: filters.ageRange, values: filterConfig.ageRanges },
    { icon: StretchHorizontal, label: filters.size, values: filterConfig.sizes },
    { icon: VenusAndMars, label: filters.gender, values: filterConfig.genders },
    { icon: Users, label: filters.compatibility, values: filterConfig.compatibilities },
  ];
  const footerCopy =
    locale === "pt"
      ? {
          tagline: "Ajudamos pets a encontrar familias para sempre.",
          discover: "Descobrir",
          support: "Suporte",
          journey: "Junta-te a jornada",
          discoverLinks: ["Encontrar pet", "Historias de sucesso", "Diretorio de canis", "Guia de cuidados"],
          supportLinks: ["Centro de ajuda", "Contactar", "Privacidade", "Termos de servico"],
          updates: "Recebe novidades de adocao e historias de sucesso no teu email.",
          email: "Email",
          crafted: "© 2026 FYA (Found Your Animal). Feito com carinho.",
        }
      : {
          tagline: "Helping pets find their forever families.",
          discover: "Discover",
          support: "Support",
          journey: "Join our journey",
          discoverLinks: ["Find a pet", "Success stories", "Shelter directory", "Pet care guide"],
          supportLinks: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
          updates: "Get adoption updates and success stories in your inbox.",
          email: "Email address",
          crafted: "© 2026 FYA (Found Your Animal). Made with love.",
        };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 pb-12 pt-8 lg:px-8">
      <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 shrink-0 flex-col gap-4 overflow-y-auto rounded-3xl bg-muted/55 p-6 md:flex">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-secondary">{dictionary.petCatalog.filtersTitle}</h2>
          <p className="text-xs text-muted-foreground">{dictionary.petCatalog.filtersSubtitle}</p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3 font-semibold text-primary">
            <PawPrint className="h-4 w-4" />
            <span className="text-sm">{filters.species}</span>
          </div>
          <div className="space-y-2 pl-10">
            {filterConfig.species.map((option) => (
              <p key={option} className="text-sm text-muted-foreground">
                {option}
              </p>
            ))}
          </div>
        </section>

        {sectionRows.map((row) => (
          <section key={row.label} className="space-y-2">
            <div className="flex items-center gap-3 p-2.5 text-sm text-muted-foreground transition-all hover:translate-x-1 hover:text-primary">
              <row.icon className="h-4 w-4" />
              <span>{row.label}</span>
            </div>
            <div className="space-y-1 pl-10 text-xs text-muted-foreground/90">
              {row.values.slice(0, 2).map((option) => (
                <p key={option}>{option}</p>
              ))}
            </div>
          </section>
        ))}

        <Link
          href={`/${locale}/pets`}
          className="mt-auto inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-secondary transition-colors hover:bg-secondary/10"
        >
          {dictionary.petCatalog.clearFilters}
        </Link>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="mb-8 space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">{dictionary.petCatalog.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {totalPets > 0 ? `${totalPets} ${locale === "pt" ? "animais encontrados." : "pets found."}` : dictionary.petCatalog.resultCount}
            </p>
          </div>

          <form method="get" className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="relative w-full md:max-w-md">
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
                  className="h-11 w-full rounded-full bg-muted px-11 pr-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="inline-flex w-fit items-center rounded-full bg-muted p-1.5">
                <button type="button" className="rounded-full bg-card px-6 py-1.5 text-sm font-bold text-primary shadow-sm">
                  {dictionary.petCatalog.gridView}
                </button>
                <button type="button" className="rounded-full px-6 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70">
                  {dictionary.petCatalog.listView}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <select
                name="species"
                defaultValue={selectedSpecies}
                className="h-11 rounded-full bg-muted px-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-primary/40"
              >
                {speciesOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="sex"
                defaultValue={selectedSex}
                className="h-11 rounded-full bg-muted px-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-primary/40"
              >
                {sexOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="size"
                defaultValue={selectedSize}
                className="h-11 rounded-full bg-muted px-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-primary/40"
              >
                {sizeOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="h-11 rounded-full bg-muted px-4 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-primary/40"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {locale === "pt" ? "Aplicar filtros" : "Apply filters"}
              </button>
            </div>
          </form>
        </header>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <article
              key={pet.id}
              className="group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={pet.imageUrl}
                  alt={pet.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  type="button"
                  aria-label={`Favorite ${pet.name}`}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/40 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <Heart className="h-4 w-4" />
                </button>

                {pet.badge && (
                  <span
                    className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white ${
                      pet.badge === "new" ? "bg-secondary" : "bg-primary"
                    }`}
                  >
                    {pet.badge === "new" ? dictionary.petCatalog.tags.newArrival : dictionary.petCatalog.tags.urgent}
                  </span>
                )}
              </div>

              <Link href={`/${locale}/pets/${pet.id}`} className="block space-y-4 p-6" aria-label={`Open ${pet.name} details`}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{pet.name}</h2>
                  <p className="text-sm font-bold text-primary">{pet.age}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pet.species} • {pet.sex}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pet.traits.map((trait) => (
                    <span key={trait} className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
                      {trait}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
        {pets.length === 0 && (
          <div className="rounded-2xl border border-border/40 bg-card p-8 text-center text-muted-foreground">
            {query
              ? locale === "pt"
                ? "Nao encontrámos resultados para essa pesquisa."
                : "We could not find results for that search."
              : locale === "pt"
                ? "Sem animais encontrados na base de dados."
                : "No pets were found in the database."}
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
          <div className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-4">
            <div className="space-y-4">
              <div className="text-2xl font-black text-primary">FYA</div>
              <p className="text-sm text-muted-foreground">{footerCopy.tagline}</p>
            </div>
            <div>
              <h4 className="mb-5 text-base font-bold text-secondary">{footerCopy.discover}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {footerCopy.discoverLinks.map((link) => (
                  <li key={link}>{link}</li>
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
            <div>
              <h4 className="mb-5 text-base font-bold text-secondary">{footerCopy.journey}</h4>
              <p className="mb-4 text-xs text-muted-foreground">{footerCopy.updates}</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder={footerCopy.email}
                  className="h-11 w-full rounded-full border border-border/50 bg-card px-4 pr-12 text-sm outline-none ring-0 focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" className="absolute right-1.5 top-1.5 rounded-full bg-primary px-3 py-2 text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-border/20 px-8 py-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {footerCopy.crafted}
          </div>
        </footer>
      </section>
    </main>
  );
}
