import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Search, PawPrint } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getPublicCatalogPets } from "@/lib/pet-catalog/public-data";
import { AboutFamily } from "@/components/about-family";
import { ClientGetForm } from "@/components/client-get-form";
import { Suspense } from "react";
import { PetCardSkeleton } from "@/components/skeletons/pet-card-skeleton";
import type { Locale } from "@/lib/i18n/config";
import { PetCard } from "@/components/pet-card";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "home");
}

const speciesLinks = [
  ["cao", "dog"] as const,
  ["gato", "cat"] as const,
  ["outro", "other"] as const,
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const { hero, featured, journey } = dictionary.home;

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={[organizationJsonLd(locale), websiteJsonLd(locale)]} />
      <section className="page-shell grid items-center gap-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20">
        <div className="py-4 lg:py-10">
          <span className="eyebrow inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-accent"
            />
            {hero.eyebrow}
          </span>
          <h1 className="display-title mt-6 max-w-2xl text-5xl sm:text-6xl xl:text-7xl">
            {hero.titleLine1} <br />
            <span className="italic text-secondary">{hero.titleLine2}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            {hero.subtitle}
          </p>
          <ClientGetForm
            action={`/${locale}/pets`}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border/60 bg-white p-2 shadow-sm"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <label htmlFor="home-search" className="sr-only">
              {hero.searchLabel}
            </label>
            <input
              id="home-search"
              name="q"
              placeholder={hero.searchPlaceholder}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              className="button-primary px-5"
              aria-label={hero.searchAriaLabel}
            >
              <ArrowRight className="size-5" />
            </button>
          </ClientGetForm>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="mr-1 text-muted-foreground">
              {hero.quickMeetLabel}
            </span>
            {speciesLinks.map(([value, key]) => (
              <Link
                key={value}
                href={`/${locale}/pets?species=${value}`}
                className="rounded-full border border-border px-3.5 py-2 transition-colors hover:bg-muted"
              >
                {hero.species[key]}
                <ArrowUpRight className="ml-1 inline size-3" />
              </Link>
            ))}
          </div>
        </div>
        {/* TODO(FYA): quando houver fotografias reais de animais de um canil parceiro (com autorização), podem entrar aqui ao lado dos passos. */}
        <section
          aria-labelledby="how-it-works-title"
          className="rounded-[1.75rem] bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10"
        >
          <h2
            id="how-it-works-title"
            className="display-title text-3xl sm:text-4xl"
          >
            {journey.title}
          </h2>
          <ol className="mt-8 space-y-7">
            {journey.steps.map(({ title, text }, i) => (
              <li key={title} className="grid grid-cols-[2.25rem_1fr] gap-4">
                <span
                  aria-hidden="true"
                  className="font-serif text-3xl leading-none text-[#dce6ae]"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/75">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href={`/${locale}/match`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-8"
          >
            {journey.helpChoose}
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </section>
      </section>
      <section className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">{featured.eyebrow}</p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">
              {featured.title}
            </h2>
          </div>
          <Link href={`/${locale}/pets`} className="button-secondary">
            {featured.viewAll}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <PetCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <FeaturedPets locale={locale} />
        </Suspense>
      </section>
      <AboutFamily locale={locale} />
    </main>
  );
}

async function FeaturedPets({ locale }: { locale: Locale }) {
  const { featured } = getDictionary(locale).home;
  const pets = hasSupabaseEnv
    ? await getPublicCatalogPets(locale, {
        limit: 4,
      })
    : [];

  return (
    <>
      {pets.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="surface flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <PawPrint className="size-10 text-secondary" />
          <p className="flex-1 text-muted-foreground">
            {featured.emptyDescription}
          </p>
          <Link href={`/${locale}/pets`} className="button-primary">
            {featured.exploreCatalog}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </>
  );
}
