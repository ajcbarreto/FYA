import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, ChevronLeft, Mail, MapPin, MessageSquareText, PawPrint, Phone } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAnimalsForPublicShelter, getPublicShelterById } from "@/lib/canil/public-directory";
import {
  getReviewEligibility,
  getShelterRatingSummaries,
  getShelterReviews,
  reviewAuthorName,
} from "@/lib/canil/reviews";
import { submitShelterReview } from "@/app/canil/reviews/actions";
import { StarRating } from "@/components/star-rating";
import { ToastFeedback } from "@/components/toast-feedback";

type ShelterPublicPageProps = {
  params: Promise<{ locale: string; shelterId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ShelterPublicPage({ params, searchParams }: ShelterPublicPageProps) {
  const { locale, shelterId } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const shelter = await getPublicShelterById(supabase, shelterId);

  if (!shelter) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [animals, reviews, ratingSummaries, eligibility] = await Promise.all([
    getAnimalsForPublicShelter(supabase, shelter.id, locale),
    getShelterReviews(supabase, shelter.id),
    getShelterRatingSummaries(supabase, [shelter.id]),
    user
      ? getReviewEligibility(supabase, shelter.id, user.id)
      : Promise.resolve({ canReview: false, existingReview: null }),
  ]);
  const rating = ratingSummaries.get(shelter.id);
  const availableCount = animals.filter((animal) => animal.status.toLowerCase().includes("disponivel") || animal.status.toLowerCase().includes("available")).length;
  const adoptedCount = animals.filter((animal) => animal.status.toLowerCase().includes("adotado") || animal.status.toLowerCase().includes("adopted")).length;
  const joined = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(shelter.created_at));

  const copy =
    locale === "pt"
      ? {
          back: "Voltar aos canis",
          aboutTitle: "Sobre o canil",
          contactTitle: "Contactos",
          phoneLabel: "Telefone",
          emailLabel: "Email",
          locationLabel: "Localizacao",
          joinedLabel: "Na FYA desde",
          residentsTitle: "Animais a procura de lar",
          noResidents: "Este canil ainda nao tem animais publicados.",
          openPet: "Ver pet",
          stats: {
            total: "Total de animais",
            available: "Disponiveis",
            adopted: "Adotados",
          },
          notProvided: "Nao definido",
          reviewsTitle: "Avaliacoes",
          noReviews: "Este canil ainda nao tem avaliacoes.",
          ratingSummary: (avg: number, count: number) =>
            `${avg.toFixed(1)} de 5 · ${count} ${count === 1 ? "avaliacao" : "avaliacoes"}`,
          writeReview: "Deixar avaliacao",
          editReview: "Atualizar a tua avaliacao",
          ratingLabel: "Classificacao",
          commentLabel: "Comentario (opcional)",
          commentPlaceholder: "Como foi a tua experiencia com este canil?",
          submitReview: "Publicar avaliacao",
          messages: {
            review_saved: "Avaliacao publicada. Obrigado!",
            invalid_review: "Escolhe uma classificacao valida.",
            review_failed: "Nao foi possivel guardar a avaliacao.",
          } as Record<string, string>,
        }
      : {
          back: "Back to shelters",
          aboutTitle: "About the shelter",
          contactTitle: "Contact",
          phoneLabel: "Phone",
          emailLabel: "Email",
          locationLabel: "Location",
          joinedLabel: "On FYA since",
          residentsTitle: "Pets looking for a home",
          noResidents: "This shelter has not published pets yet.",
          openPet: "Open pet",
          stats: {
            total: "Total pets",
            available: "Available",
            adopted: "Adopted",
          },
          notProvided: "Not provided",
          reviewsTitle: "Reviews",
          noReviews: "This shelter has no reviews yet.",
          ratingSummary: (avg: number, count: number) =>
            `${avg.toFixed(1)} of 5 · ${count} ${count === 1 ? "review" : "reviews"}`,
          writeReview: "Leave a review",
          editReview: "Update your review",
          ratingLabel: "Rating",
          commentLabel: "Comment (optional)",
          commentPlaceholder: "How was your experience with this shelter?",
          submitReview: "Publish review",
          messages: {
            review_saved: "Review published. Thank you!",
            invalid_review: "Pick a valid rating.",
            review_failed: "Could not save the review.",
          } as Record<string, string>,
        };

  const feedback =
    (success && copy.messages[success]) || (error && copy.messages[error]) || null;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-8 lg:px-8">
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />
      <Link
        href={`/${locale}/canis`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{shelter.nome}</h1>
              {shelter.verificado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {locale === "pt" ? "Verificado" : "Verified"}
                </span>
              )}
            </div>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {shelter.localizacao}
            </p>
            {rating && rating.count > 0 && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <StarRating value={rating.average} />
                {copy.ratingSummary(rating.average, rating.count)}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="space-y-6 lg:col-span-8">
          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-xl font-bold">{copy.aboutTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {shelter.missao ?? (locale === "pt" ? "Sem descricao publicada." : "No public description yet.")}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.stats.total}</p>
                <p className="mt-1 text-2xl font-black">{animals.length}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.stats.available}</p>
                <p className="mt-1 text-2xl font-black text-secondary">{availableCount}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.stats.adopted}</p>
                <p className="mt-1 text-2xl font-black text-primary">{adoptedCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-xl font-bold">{copy.residentsTitle}</h2>
            {animals.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.noResidents}</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {animals.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/${locale}/pets/${pet.id}`}
                    className="overflow-hidden rounded-2xl border border-border/20 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-square">
                      <Image src={pet.imageUrl} alt={pet.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="font-bold">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.age} • {pet.species}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-xl font-bold">
                <MessageSquareText className="h-5 w-5 text-primary" />
                {copy.reviewsTitle}
              </h2>
              {rating && rating.count > 0 && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <StarRating value={rating.average} />
                  {rating.average.toFixed(1)} / 5
                </span>
              )}
            </div>

            {eligibility.canReview && (
              <form
                action={submitShelterReview}
                className="mt-4 space-y-3 rounded-2xl border border-border/30 bg-muted/40 p-4"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="shelterId" value={shelter.id} />
                <p className="text-sm font-bold">
                  {eligibility.existingReview ? copy.editReview : copy.writeReview}
                </p>
                <label className="block text-xs font-semibold text-muted-foreground">
                  {copy.ratingLabel}
                  <select
                    name="rating"
                    defaultValue={eligibility.existingReview?.rating ?? 5}
                    className="mt-1 h-10 w-full rounded-xl border border-border/30 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {"★".repeat(value)} ({value})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-muted-foreground">
                  {copy.commentLabel}
                  <textarea
                    name="comentario"
                    rows={3}
                    defaultValue={eligibility.existingReview?.comentario ?? ""}
                    placeholder={copy.commentPlaceholder}
                    className="mt-1 w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  {copy.submitReview}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.noReviews}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-border/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{reviewAuthorName(review, locale)}</p>
                      <StarRating value={review.rating} />
                    </div>
                    {review.comentario && (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comentario}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
                        new Date(review.created_at),
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-lg font-bold">{copy.contactTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.locationLabel}</p>
                  <p>{shelter.localizacao}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.phoneLabel}</p>
                  <p>{shelter.telefone ?? copy.notProvided}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.emailLabel}</p>
                  <p className="break-all">{shelter.email_contacto ?? copy.notProvided}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PawPrint className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy.joinedLabel}</p>
                  <p>{joined}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
