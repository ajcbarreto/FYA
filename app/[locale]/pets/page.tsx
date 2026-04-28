import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

type PetCatalogPageProps = {
  params: Promise<{ locale: string }>;
};

type PetCard = {
  name: string;
  age: string;
  species: string;
  sex: string;
  traits: [string, string];
  badge?: "new" | "urgent";
  emoji: string;
  accent: string;
};

const petCards: PetCard[] = [
  {
    name: "Cooper",
    age: "2 Months",
    species: "Golden Retriever",
    sex: "Male",
    traits: ["Energetic", "Kid Friendly"],
    badge: "new",
    emoji: "🐶",
    accent: "from-amber-100 via-orange-100 to-rose-100",
  },
  {
    name: "Luna",
    age: "3 Years",
    species: "Russian Blue",
    sex: "Female",
    traits: ["Calm", "Indoor Only"],
    emoji: "🐱",
    accent: "from-slate-100 via-zinc-100 to-blue-100",
  },
  {
    name: "Benson",
    age: "5 Years",
    species: "French Bulldog",
    sex: "Male",
    traits: ["Apartment Life", "Well Trained"],
    badge: "urgent",
    emoji: "🐕",
    accent: "from-orange-100 via-red-100 to-rose-100",
  },
  {
    name: "Marshmallow",
    age: "1 Year",
    species: "Persian",
    sex: "Female",
    traits: ["Sweet", "Cuddly"],
    emoji: "🐈",
    accent: "from-zinc-100 via-stone-100 to-neutral-100",
  },
  {
    name: "Duke",
    age: "7 Years",
    species: "Labrador Mix",
    sex: "Male",
    traits: ["Loyal", "Senior Friendly"],
    emoji: "🐕‍🦺",
    accent: "from-emerald-100 via-teal-100 to-cyan-100",
  },
  {
    name: "Mittens",
    age: "4 Months",
    species: "Domestic Shorthair",
    sex: "Female",
    traits: ["Playful", "Social"],
    emoji: "🐾",
    accent: "from-sky-100 via-indigo-100 to-purple-100",
  },
];

export default async function PetCatalogPage({ params }: PetCatalogPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const filters = dictionary.petCatalog.sections;
  const species = dictionary.petCatalog.speciesOptions;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-8 md:gap-8 md:py-10">
      <aside className="hidden h-fit w-64 shrink-0 space-y-5 rounded-3xl bg-muted/55 p-5 md:block">
        <div>
          <h2 className="text-lg font-semibold">{dictionary.petCatalog.filtersTitle}</h2>
          <p className="text-xs text-muted-foreground">{dictionary.petCatalog.filtersSubtitle}</p>
        </div>

        <section className="space-y-2">
          <p className="text-sm font-medium">{filters.species}</p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" />
            {species.dog}
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input" />
            {species.cat}
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input" />
            {species.other}
          </label>
        </section>

        <section className="space-y-3 text-sm text-muted-foreground">
          <p>{filters.ageRange}</p>
          <p>{filters.size}</p>
          <p>{filters.gender}</p>
          <p>{filters.compatibility}</p>
        </section>

        <button
          type="button"
          className="w-full rounded-full border border-border/60 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background"
        >
          {dictionary.petCatalog.clearFilters}
        </button>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="mb-8 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{dictionary.petCatalog.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{dictionary.petCatalog.subtitle}</p>
            <p className="text-sm text-muted-foreground">{dictionary.petCatalog.resultCount}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              placeholder={dictionary.petCatalog.searchPlaceholder}
              className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm"
            />
            <div className="inline-flex w-fit items-center rounded-full bg-muted p-1">
              <button type="button" className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold shadow-sm">
                {dictionary.petCatalog.gridView}
              </button>
              <button type="button" className="rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                {dictionary.petCatalog.listView}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {petCards.map((pet) => (
            <article
              key={pet.name}
              className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/40 transition-transform hover:-translate-y-1"
            >
              <div className={`relative flex aspect-[4/5] items-start justify-between bg-gradient-to-br p-4 ${pet.accent}`}>
                <span className="text-6xl" aria-hidden>
                  {pet.emoji}
                </span>
                <button
                  type="button"
                  aria-label={`Favorite ${pet.name}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
                >
                  <Heart className="h-4 w-4" />
                </button>

                {pet.badge && (
                  <span
                    className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${
                      pet.badge === "new" ? "bg-emerald-600" : "bg-orange-600"
                    }`}
                  >
                    {pet.badge === "new" ? dictionary.petCatalog.tags.newArrival : dictionary.petCatalog.tags.urgent}
                  </span>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{pet.name}</h2>
                  <p className="text-sm font-medium text-primary">{pet.age}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pet.species} • {pet.sex}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pet.traits.map((trait) => (
                    <span key={trait} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            aria-label={dictionary.petCatalog.pagination.previous}
            className="h-10 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
          >
            &lt;
          </button>
          <button type="button" className="h-10 min-w-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
            1
          </button>
          <button type="button" className="h-10 min-w-10 rounded-full px-4 text-sm text-muted-foreground">
            2
          </button>
          <button type="button" className="h-10 min-w-10 rounded-full px-4 text-sm text-muted-foreground">
            3
          </button>
          <span className="h-10 px-1 text-sm text-muted-foreground">...</span>
          <button
            type="button"
            aria-label={dictionary.petCatalog.pagination.next}
            className="h-10 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
          >
            &gt;
          </button>
        </nav>
      </section>
    </main>
  );
}
