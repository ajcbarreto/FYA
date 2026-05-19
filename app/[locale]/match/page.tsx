import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Cat, Check, Dog, Home, PawPrint, RotateCcw, Sparkles } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { rankMatches, type MatchHome, type MatchSpecies, type MatchTime } from "@/lib/pet-catalog/match";
import { findMatches } from "@/app/match/actions";

type MatchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ results?: string; species?: string; home?: string; time?: string }>;
};

const VALID_SPECIES = new Set(["cao", "gato"]);
const VALID_HOME = new Set(["apartamento", "casa", "casa_grande"]);
const VALID_TIME = new Set(["pouco", "medio", "muito"]);

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const { locale } = await params;
  const { results, species, home, time } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale as Locale).match;
  const showResults = results === "1";

  if (showResults) {
    const profile = {
      species: (VALID_SPECIES.has(species ?? "") ? species : "") as MatchSpecies,
      home: (VALID_HOME.has(home ?? "") ? home : "") as MatchHome,
      time: (VALID_TIME.has(time ?? "") ? time : "") as MatchTime,
    };
    const supabase = await createServerSupabaseClient();
    const matches = await rankMatches(supabase, locale, profile, 6);

    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{t.resultsTitle}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t.resultsSubtitle}</p>
          </div>
          <Link
            href={`/${locale}/match`}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border/50 px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            {t.retake}
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border/40 bg-card p-10 text-center">
            <p className="text-base font-bold">{t.resultsEmptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.resultsEmptyText}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, index) => (
              <article
                key={match.pet.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href={`/${locale}/pets/${match.pet.id}`} className="flex flex-1 flex-col">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={match.pet.imageUrl}
                      alt={match.pet.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
                      {match.score}% {t.compatibility}
                    </span>
                    {index === 0 && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                        {t.topMatch}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-base font-bold">{match.pet.name}</h2>
                      <span className="shrink-0 text-xs font-bold text-primary">{match.pet.age}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {match.pet.species} • {match.pet.location}
                    </p>
                    {match.reasons.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {match.reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                            {t.reasons[reason]}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    );
  }

  const questions = [
    {
      name: "species",
      label: t.q1,
      icon: PawPrint,
      options: [
        { value: "", label: t.q1Options.any },
        { value: "cao", label: t.q1Options.dog },
        { value: "gato", label: t.q1Options.cat },
      ],
    },
    {
      name: "home",
      label: t.q2,
      icon: Home,
      options: [
        { value: "apartamento", label: t.q2Options.apartment },
        { value: "casa", label: t.q2Options.house },
        { value: "casa_grande", label: t.q2Options.bigHouse },
      ],
    },
    {
      name: "time",
      label: t.q3,
      icon: Sparkles,
      options: [
        { value: "pouco", label: t.q3Options.little },
        { value: "medio", label: t.q3Options.medium },
        { value: "muito", label: t.q3Options.plenty },
      ],
    },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <div className="rounded-3xl bg-primary p-8 text-center text-primary-foreground md:p-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          {t.eyebrow}
        </p>
        <h1 className="mx-auto mt-5 max-w-md text-3xl font-extrabold tracking-tight md:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/85">{t.subtitle}</p>
        <div className="mt-6 flex items-center justify-center gap-4 text-primary-foreground/80">
          <Dog className="h-7 w-7" />
          <Cat className="h-7 w-7" />
        </div>
      </div>

      <form action={findMatches} className="mt-8 space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {questions.map((question, index) => {
          const Icon = question.icon;
          return (
            <fieldset key={question.name} className="rounded-2xl border border-border/40 bg-card p-5">
              <legend className="flex items-center gap-2 px-1 text-sm font-bold">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <Icon className="h-4 w-4 text-primary" />
                {question.label}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={option.value || "any"}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/30 px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name={question.name}
                      value={option.value}
                      defaultChecked={optionIndex === 0}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="space-y-3 text-center">
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:brightness-105"
          >
            {t.submit}
          </button>
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      </form>
    </main>
  );
}
