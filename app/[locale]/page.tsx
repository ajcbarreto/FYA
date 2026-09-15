import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Search,
  PawPrint,
  MessageCircle,
  House,
} from "lucide-react";
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

const speciesLinks = [
  ["cao", "dog"] as const,
  ["gato", "cat"] as const,
  ["outro", "other"] as const,
];

const journeyIcons = [Search, MessageCircle, House];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const { hero, trustBar, featured, journey } = dictionary.home;

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="page-shell grid items-center gap-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20">
        <div className="py-4 lg:py-10">
          <span className="eyebrow inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            {hero.eyebrow}
          </span>
          <h1 className="display-title mt-6 max-w-2xl text-6xl sm:text-7xl xl:text-[88px]">
            {hero.titleLine1}
            <br />
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
        <div className="relative isolate mx-auto w-full max-w-xl pb-5">
          <div className="absolute -right-2 top-8 -z-10 h-[85%] w-[94%] rotate-3 rounded-[45%_45%_15%_15%] bg-[#dce5ce]" />
          <div className="relative aspect-[.95] overflow-hidden rounded-[45%_45%_12%_12%] bg-[#e5d6bd]">
            <Image
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85"
              alt={hero.heroImageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <span className="absolute bottom-5 right-5 rounded-full bg-black/25 px-3 py-1 text-[10px] text-white">
              {hero.illustrativeBadge}
            </span>
          </div>
          <span className="absolute right-0 top-5 flex size-20 rotate-12 items-center justify-center rounded-full bg-[#e9edb9] text-primary shadow-sm">
            <PawPrint className="size-9" />
          </span>
          <div className="absolute -left-2 bottom-6 flex max-w-[85%] items-center gap-3 rounded-2xl border border-white bg-white/95 p-4 shadow-lg sm:-left-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f9e6dc] text-accent">
              <Heart className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">{hero.cardTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {hero.cardSubtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border/50 bg-muted/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-6">
          {trustBar.map((text, i) => (
            <p
              key={text}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <span className="text-accent">0{i + 1}</span>
              {text}
            </p>
          ))}
        </div>
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
      <section className="page-shell pt-4">
        <div className="rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground sm:p-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">
                {journey.eyebrow}
              </p>
              <h2 className="display-title mt-3 text-4xl sm:text-5xl">
                {journey.title}
              </h2>
            </div>
            <Link
              href={`/${locale}/match`}
              className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-8"
            >
              {journey.helpChoose}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {journey.steps.map(({ title, text }, i) => {
              const Icon = journeyIcons[i] ?? Search;
              return (
                <article key={title} className="border-t border-white/20 pt-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="size-6 text-[#dce6ae]" />
                    <span className="text-xs text-white/50">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">
                    {text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
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
