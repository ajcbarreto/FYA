import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  House,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Scissors,
  Activity,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetById, getRelatedPets } from "@/lib/pet-catalog/db-pets";
import { submitAdoptionRequest } from "@/app/adoption/actions";

type PetDetailsPageProps = {
  params: Promise<{ locale: string; petId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function PetDetailsPage({ params, searchParams }: PetDetailsPageProps) {
  const { locale, petId } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [pet, relatedPets] = await Promise.all([
    getPetById(supabase, petId, locale),
    getRelatedPets(supabase, petId, locale),
  ]);

  if (!pet) {
    notFound();
  }
  const healthStatus = [locale === "pt" ? "Vacinacao em dia" : "Vaccinations up to date", pet.status];
  const personality = pet.traits;
  const galleryImages = [
    pet.imageUrl,
    `${pet.imageUrl}&sat=-20`,
    `${pet.imageUrl}&sat=20`,
    `${pet.imageUrl}&blur=1`,
  ];
  const subtitle =
    locale === "pt" ? `A alma especial do ${pet.shelterName}` : `The golden soul of ${pet.shelterName}`;
  const weight =
    pet.traits.join(" ").toLowerCase().includes("pequeno") || pet.traits.join(" ").toLowerCase().includes("small")
      ? locale === "pt"
        ? "8-12 kg"
        : "18-26 lbs"
      : pet.traits.join(" ").toLowerCase().includes("grande") || pet.traits.join(" ").toLowerCase().includes("large")
        ? locale === "pt"
          ? "24-32 kg"
          : "53-70 lbs"
        : locale === "pt"
          ? "14-22 kg"
          : "30-48 lbs";
  const adoptionFee = locale === "pt" ? "Taxa de adocao: 180€" : "Adoption fee: $250";
  const adoptionHint =
    locale === "pt"
      ? "Inclui microchip, vacinas iniciais e acompanhamento inicial do abrigo."
      : "Includes microchip, initial vaccines, and early shelter follow-up.";
  const feedbackMap =
    locale === "pt"
      ? {
          request_created: "Candidatura enviada com sucesso.",
          only_users_can_apply: "Apenas adotantes podem candidatar-se.",
          pet_not_found: "Nao encontramos este animal.",
          request_failed: "Nao foi possivel enviar a candidatura.",
          conversation_failed: "A candidatura foi criada, mas nao foi possivel iniciar conversa.",
          invalid_pet: "Animal invalido.",
        }
      : {
          request_created: "Application submitted successfully.",
          only_users_can_apply: "Only adopters can submit applications.",
          pet_not_found: "Pet not found.",
          request_failed: "Could not submit the application.",
          conversation_failed: "Application created, but conversation could not be started.",
          invalid_pet: "Invalid pet.",
        };
  const feedback =
    (success && feedbackMap[success as keyof typeof feedbackMap]) ||
    (error && feedbackMap[error as keyof typeof feedbackMap]) ||
    null;
  const feedbackIsError = Boolean(error);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-8 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/pets`} className="inline-flex items-center gap-1 font-medium hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {dictionary.petDetails.backToCatalog}
        </Link>
        <span>/</span>
        <span>{pet.species}</span>
        <span>/</span>
        <span className="font-bold text-primary">{pet.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <article className="relative">
            <div className="aspect-[16/10] overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={pet.imageUrl}
                alt={pet.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground shadow-lg">
              <Heart className="h-4 w-4 fill-current" />
              {locale === "pt" ? "Escolha popular" : "Popular choice"}
            </div>
          </article>

          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={image}
                  alt={`${pet.name} ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 16vw"
                  className="object-cover"
                />
                {index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">
                    +2
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-8 pt-6">
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold tracking-tight">{pet.name}</h1>
              <p className="text-xl italic text-secondary">{subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {personality.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-2 text-sm font-bold text-secondary"
                >
                  <Sparkles className="h-4 w-4" />
                  {item}
                </span>
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">{locale === "pt" ? `${pet.name} e a sua historia` : `${pet.name}'s story`}</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {pet.description || (locale === "pt" ? "Sem descricao disponivel para este animal." : "No description available for this pet.")}
              </p>
            </section>

            <section className="rounded-3xl bg-muted/55 p-8">
              <h3 className="mb-6 text-xl font-bold">{locale === "pt" ? "Saude e cuidados" : "Health & grooming"}</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Syringe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold">{locale === "pt" ? "Vacinacao" : "Vaccinations"}</p>
                    <p className="text-sm text-muted-foreground">{healthStatus[0]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Scissors className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold">{locale === "pt" ? "Cuidados de pelo" : "Grooming needs"}</p>
                    <p className="text-sm text-muted-foreground">
                      {locale === "pt" ? "Escovagem regular recomendada." : "Regular brushing recommended."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold">{locale === "pt" ? "Estado atual" : "Current status"}</p>
                    <p className="text-sm text-muted-foreground">{pet.status}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-bold">{locale === "pt" ? "Condicoes medicas" : "Medical conditions"}</p>
                    <p className="text-sm text-muted-foreground">
                      {locale === "pt" ? "Sem condicoes criticas registadas." : "No critical conditions registered."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          {feedback && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                feedbackIsError
                  ? "border border-destructive/40 bg-destructive/10 text-destructive"
                  : "border border-secondary/30 bg-secondary/10 text-secondary"
              }`}
            >
              {feedback}
            </p>
          )}
          <article className="space-y-8 rounded-[2.5rem] border border-border/35 bg-card p-8 shadow-sm">
            <h3 className="border-b border-border/35 pb-4 text-xl font-bold">
              {locale === "pt" ? "Estatisticas principais" : "Key statistics"}
            </h3>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "pt" ? "Raca" : "Breed"}
                </p>
                <p className="font-semibold">{pet.species}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "pt" ? "Idade" : "Age"}
                </p>
                <p className="font-semibold">{pet.age}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "pt" ? "Genero" : "Gender"}
                </p>
                <p className="font-semibold">{pet.sex}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "pt" ? "Peso" : "Weight"}
                </p>
                <p className="font-semibold">{weight}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "pt" ? "Localizacao" : "Location"}
                </p>
                <p className="font-semibold">{pet.location}</p>
              </div>
            </div>

            <form action={submitAdoptionRequest} className="space-y-3 pt-2">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="petId" value={pet.id} />
              <textarea
                name="message"
                rows={3}
                placeholder={locale === "pt" ? "Escreve uma mensagem inicial para o canil..." : "Write an initial message to the shelter..."}
                className="w-full rounded-2xl border border-border/30 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-5 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:scale-[1.01]"
              >
                {dictionary.petDetails.applyCta}
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3.5 text-base font-bold text-primary transition-colors hover:bg-primary/5"
              >
                <Heart className="h-4 w-4" />
                {dictionary.petDetails.saveCta}
              </button>
            </form>
          </article>

          <article className="space-y-5 rounded-[2.5rem] bg-secondary p-8 text-secondary-foreground">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-white shadow-inner" />
              <div>
                <h4 className="font-bold">{pet.shelterName}</h4>
                <p className="text-sm opacity-85">{locale === "pt" ? "Abrigo certificado" : "Certified shelter"}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {pet.location}
              </p>
              <p className="inline-flex items-center gap-2">
                <House className="h-4 w-4" />
                {locale === "pt" ? "Visitas: Seg-Sab, 10h - 16h" : "Visits: Mon-Sat, 10am - 4pm"}
              </p>
            </div>
            <div className="h-36 rounded-3xl bg-white/12" />
            <Link href={`/${locale}/canil/perfil`} className="block text-center text-sm font-bold underline underline-offset-4">
              {locale === "pt" ? "Ver perfil do abrigo" : "View shelter profile"}
            </Link>
          </article>

          <article className="rounded-3xl border border-border/30 bg-muted/45 p-6">
            <p className="inline-flex items-center gap-2 font-bold text-primary">
              <Stethoscope className="h-4 w-4" />
              {adoptionFee}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{adoptionHint}</p>
          </article>
        </aside>
      </div>

      <section className="mt-24 space-y-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">{dictionary.petDetails.similarPetsTitle}</h2>
            <p className="mt-2 text-muted-foreground">
              {locale === "pt"
                ? `Mais amigos do ${pet.shelterName}`
                : `More friends from ${pet.shelterName}`}
            </p>
          </div>
          <Link href={`/${locale}/pets`} className="inline-flex items-center gap-1 text-sm font-bold text-secondary transition-all hover:gap-2">
            {locale === "pt" ? "Ver todos os pets" : "View all pets"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {relatedPets.map((relatedPet) => (
            <Link
              key={relatedPet.id}
              href={`/${locale}/pets/${relatedPet.id}`}
              className="group overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-border/35 transition-all hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={relatedPet.imageUrl}
                  alt={relatedPet.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {relatedPet.badge && (
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                      relatedPet.badge === "new" ? "bg-primary/10 text-primary" : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {relatedPet.badge === "new"
                      ? locale === "pt"
                        ? "Jovem"
                        : "Young"
                      : locale === "pt"
                        ? "Adulto"
                        : "Adult"}
                  </span>
                )}
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-bold">{relatedPet.name}</h3>
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
