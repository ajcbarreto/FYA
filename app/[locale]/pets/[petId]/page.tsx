import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, MapPin, ShieldCheck, Stethoscope } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetById, getRelatedPets } from "@/lib/pet-catalog/db-pets";

type PetDetailsPageProps = {
  params: Promise<{ locale: string; petId: string }>;
};

export default async function PetDetailsPage({ params }: PetDetailsPageProps) {
  const { locale, petId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const pet = await getPetById(supabase, petId, locale);

  if (!pet) {
    notFound();
  }

  const relatedPets = await getRelatedPets(supabase, pet.id, locale);
  const healthStatus = [locale === "pt" ? "Vacinado" : "Vaccinated", pet.status];
  const personality = pet.traits;
  const medicalSummary = [
    { label: locale === "pt" ? "Estado" : "Status", value: pet.status },
    { label: locale === "pt" ? "Origem" : "Shelter", value: pet.shelterName },
    { label: locale === "pt" ? "Localizacao" : "Location", value: pet.location },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:py-10">
      <Link
        href={`/${locale}/pets`}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {dictionary.petDetails.backToCatalog}
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/40">
          <div className="relative flex min-h-80 items-end justify-between p-6">
            <img src={pet.imageUrl} alt={pet.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <button
              type="button"
              className="relative z-10 ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/85 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
              aria-label={`Favorite ${pet.name}`}
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            <header className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{pet.name}</h1>
              <p className="text-base text-muted-foreground">
                {pet.age} • {pet.species} • {pet.sex}
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {pet.location}
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                {pet.shelterName}
              </p>
            </header>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {dictionary.petDetails.healthStatus}
              </h2>
              <div className="flex flex-wrap gap-2">
                {healthStatus.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {dictionary.petDetails.personality}
              </h2>
              <div className="flex flex-wrap gap-2">
                {personality.map((item) => (
                  <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{dictionary.petDetails.storyTitle}</h2>
              <p className="leading-relaxed text-muted-foreground">
                {pet.description || (locale === "pt" ? "Sem descricao disponivel para este animal." : "No description available for this pet.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{dictionary.petDetails.medicalSummaryTitle}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {medicalSummary.map((entry) => (
                  <div key={entry.label} className="rounded-2xl bg-muted/70 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{entry.label}</p>
                    <p className="mt-2 text-sm font-medium">{entry.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </article>

        <aside className="h-fit space-y-5 rounded-3xl bg-muted/55 p-6">
          <h2 className="text-xl font-semibold">{dictionary.petDetails.contactCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{pet.shelterName}</p>
          <p className="text-sm text-muted-foreground">{dictionary.petDetails.contactCardSubtitle}</p>

          <button
            type="button"
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {dictionary.petDetails.applyCta}
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {dictionary.petDetails.saveCta}
          </button>

          <div className="rounded-2xl bg-background/70 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              {dictionary.petDetails.adoptionHintTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{dictionary.petDetails.adoptionHintDescription}</p>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{dictionary.petDetails.similarPetsTitle}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {relatedPets.map((relatedPet) => (
            <Link
              key={relatedPet.id}
              href={`/${locale}/pets/${relatedPet.id}`}
              className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/40 transition-transform hover:-translate-y-1"
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden">
                <img src={relatedPet.imageUrl} alt={relatedPet.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">{relatedPet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {relatedPet.age} • {relatedPet.species}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
