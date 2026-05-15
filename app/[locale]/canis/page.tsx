import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, MapPin, PawPrint, Search } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { countAnimalsByShelter, listPublicShelters } from "@/lib/canil/public-directory";
import { getShelterRatingSummaries } from "@/lib/canil/reviews";
import { StarRating } from "@/components/star-rating";

type SheltersDirectoryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SheltersDirectoryPage({ params, searchParams }: SheltersDirectoryPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const shelters = await listPublicShelters(supabase, { search: query || undefined });
  const shelterIds = shelters.map((shelter) => shelter.id);
  const [animalsCount, ratingSummaries] = await Promise.all([
    countAnimalsByShelter(supabase, shelterIds),
    getShelterRatingSummaries(supabase, shelterIds),
  ]);

  const copy =
    locale === "pt"
      ? {
          title: "Canis e abrigos parceiros",
          subtitle: "Conhece as organizacoes que dao casa aos animais na FYA.",
          searchPlaceholder: "Procurar por nome, cidade ou missao...",
          empty: "Sem canis encontrados para essa pesquisa.",
          totalPets: (count: number) => `${count} ${count === 1 ? "animal" : "animais"}`,
          openCanil: "Ver canil",
          submit: "Procurar",
        }
      : {
          title: "Partner shelters",
          subtitle: "Meet the organizations that give pets a home through FYA.",
          searchPlaceholder: "Search by name, city or mission...",
          empty: "No shelters match this search.",
          totalPets: (count: number) => `${count} ${count === 1 ? "pet" : "pets"}`,
          openCanil: "Open shelter",
          submit: "Search",
        };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{copy.subtitle}</p>
      </header>

      <form method="get" className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={copy.searchPlaceholder}
            className="h-11 w-full rounded-full bg-muted px-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          {copy.submit}
        </button>
      </form>

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
                className="group rounded-3xl border border-border/30 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {shelter.verificado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
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
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{shelter.missao}</p>
                )}
                <div className="mt-5 flex items-center justify-between text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-secondary">
                    <PawPrint className="h-3.5 w-3.5" />
                    {copy.totalPets(count)}
                  </span>
                  <span className="text-primary transition-colors group-hover:underline">{copy.openCanil}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
