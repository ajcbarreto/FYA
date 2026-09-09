import { setShelterLike } from "@/app/canil/likes-actions";
import { Heart, ArrowUpRight } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  Mail,
  MapPin,
  MessageSquareText,
  PawPrint,
  Phone,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import {
  getAnimalsForPublicShelter,
  getPublicShelterById,
} from "@/lib/canil/public-directory";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; shelterId: string }>;
}): Promise<Metadata> {
  const { locale, shelterId } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const supabase = await createServerSupabaseClient();
  const shelter = await getPublicShelterById(supabase, shelterId);

  if (!shelter) {
    return {
      title:
        locale === "pt"
          ? "Canil nao encontrado | FYA"
          : "Shelter not found | FYA",
    };
  }

  const title = `${shelter.nome} | FYA`;
  const description =
    shelter.missao?.trim().slice(0, 160) ||
    (locale === "pt"
      ? `Conhece o canil ${shelter.nome} em ${shelter.localizacao} e os animais para adocao.`
      : `Discover ${shelter.nome} shelter in ${shelter.localizacao} and its pets available for adoption.`);

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function ShelterPublicPage({
  params,
  searchParams,
}: ShelterPublicPageProps) {
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
  const { data: likedRow } = user
    ? await supabase.from("canil_likes").select("canil_id").eq("canil_id", shelter.id).eq("user_profile_id", user.id).maybeSingle()
    : { data: null };
  const liked = Boolean(likedRow);
  const rating = ratingSummaries.get(shelter.id);
  const availableCount = animals.filter(
    (animal) =>
      animal.status.toLowerCase().includes("disponivel") ||
      animal.status.toLowerCase().includes("available"),
  ).length;
  const adoptedCount = animals.filter(
    (animal) =>
      animal.status.toLowerCase().includes("adotado") ||
      animal.status.toLowerCase().includes("adopted"),
  ).length;
  const joined = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(shelter.created_at));

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
          reviewsTitle: "Comentários e avaliações",
          noReviews: "Este canil ainda nao tem avaliacoes.",
          ratingSummary: (avg: number, count: number) =>
            `${avg.toFixed(1)} de 5 · ${count} ${count === 1 ? "avaliacao" : "avaliacoes"}`,
          writeReview: "Deixar avaliacao",
          editReview: "Atualizar a tua avaliacao",
          ratingLabel: "Classificacao",
          commentLabel: "Comentario (opcional)",
          commentPlaceholder: "Como foi a tua experiencia com este canil?",
          submitReview: "Enviar avaliacao",
          moderationNote:
            "A tua avaliacao so fica visivel depois de o canil a aprovar.",
          pendingNote:
            "A tua avaliacao foi enviada e aguarda aprovacao do canil.",
          rejectedNote:
            "A tua avaliacao anterior nao foi aprovada. Podes editar e reenviar.",
          loginToReview: "Inicia sessao para avaliar este canil.",
          messages: {
            like_failed: "Não foi possível guardar o gosto. Tenta novamente.",
            review_pending:
              "Avaliacao enviada. Vai ser revista pelo canil antes de aparecer.",
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
          reviewsTitle: "Comments and reviews",
          noReviews: "This shelter has no reviews yet.",
          ratingSummary: (avg: number, count: number) =>
            `${avg.toFixed(1)} of 5 · ${count} ${count === 1 ? "review" : "reviews"}`,
          writeReview: "Leave a review",
          editReview: "Update your review",
          ratingLabel: "Rating",
          commentLabel: "Comment (optional)",
          commentPlaceholder: "How was your experience with this shelter?",
          submitReview: "Send review",
          moderationNote:
            "Your review is only visible after the shelter approves it.",
          pendingNote:
            "Your review was sent and is awaiting the shelter's approval.",
          rejectedNote:
            "Your previous review was not approved. You can edit and resend it.",
          loginToReview: "Sign in to review this shelter.",
          messages: {
            like_failed: "Could not save your like. Please try again.",
            review_pending:
              "Review sent. The shelter will review it before it appears.",
            invalid_review: "Pick a valid rating.",
            review_failed: "Could not save the review.",
          } as Record<string, string>,
        };

  const feedback =
    (success && copy.messages[success]) ||
    (error && copy.messages[error]) ||
    null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-8 lg:px-8"
    >
      <ToastFeedback
        message={feedback}
        variant={success ? "success" : "error"}
      />
      <Link
        href={`/${locale}/canis`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground sm:p-10">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] opacity-70">{locale === "pt" ? "Pessoas que cuidam. Animais que importam." : "People who care. Animals who matter."}</p>
        <div className="flex items-center gap-5">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {shelter.nome}
              </h1>
              {shelter.verificado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {locale === "pt" ? "Verificado" : "Verified"}
                </span>
              )}
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm opacity-80">
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
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#animais" className="rounded-full bg-primary-foreground px-5 py-3 text-sm font-bold text-primary">{locale === "pt" ? "Conhecer os animais" : "Meet the animals"}</a>
          <a href="#apoiar" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold">{locale === "pt" ? "Quero ajudar" : "I want to help"}</a>
          <form action={setShelterLike}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="shelterId" value={shelter.id} />
            <input type="hidden" name="liked" value={String(!liked)} />
            <SubmitButton aria-pressed={liked} className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold">
              <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
              {liked ? (locale === "pt" ? "Gostaste" : "Liked") : (locale === "pt" ? "Gosto" : "Like")}
            </SubmitButton>
          </form>
        </div>
      </header>
      <nav aria-label={locale === "pt" ? "Nesta página" : "On this page"} className="mt-4 flex gap-6 overflow-x-auto border-b py-4 text-sm font-semibold">
        <a href="#animais">{locale === "pt" ? "Animais" : "Animals"}</a>
        <a href="#sobre">{locale === "pt" ? "Sobre nós" : "About us"}</a>
        <a href="#apoiar">{locale === "pt" ? "Donativos" : "Donations"}</a>
        <a href="#comentarios">{locale === "pt" ? "Comentários" : "Comments"}</a>
      </nav>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="space-y-6 lg:col-span-8">
          <div id="sobre" className="scroll-mt-24 rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-xl font-bold">{copy.aboutTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {shelter.missao ??
                (locale === "pt"
                  ? "Sem descricao publicada."
                  : "No public description yet.")}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {copy.stats.total}
                </p>
                <p className="mt-1 text-2xl font-bold">{animals.length}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {copy.stats.available}
                </p>
                <p className="mt-1 text-2xl font-bold text-secondary">
                  {availableCount}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {copy.stats.adopted}
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {adoptedCount}
                </p>
              </div>
            </div>
          </div>

          <div id="animais" className="scroll-mt-24 rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-xl font-bold">{copy.residentsTitle}</h2>
            {animals.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {copy.noResidents}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {animals.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/${locale}/pets/${pet.id}`}
                    className="overflow-hidden rounded-2xl border border-border/20 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={pet.imageUrl}
                        alt={pet.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="font-bold">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pet.age} • {pet.species}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div id="comentarios" className="scroll-mt-24 rounded-3xl border border-border/20 bg-card p-6">
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

            {eligibility.canReview ? (
              <form
                action={submitShelterReview}
                className="mt-4 space-y-3 rounded-2xl border border-border/30 bg-muted/40 p-4"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="shelterId" value={shelter.id} />
                <p className="text-sm font-bold">
                  {eligibility.existingReview
                    ? copy.editReview
                    : copy.writeReview}
                </p>
                {eligibility.existingReview?.estado === "pendente" && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {copy.pendingNote}
                  </p>
                )}
                {eligibility.existingReview?.estado === "rejeitada" && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {copy.rejectedNote}
                  </p>
                )}
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
                    maxLength={2000}
                    defaultValue={eligibility.existingReview?.comentario ?? ""}
                    placeholder={copy.commentPlaceholder}
                    className="mt-1 w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <SubmitButton
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {copy.submitReview}
                </SubmitButton>
                <p className="text-xs text-muted-foreground">
                  {copy.moderationNote}
                </p>
              </form>
            ) : (
              <p className="mt-4 rounded-2xl border border-border/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <Link href={`/${locale}/auth/login?next=${encodeURIComponent(`/${locale}/canis/${shelter.id}#comentarios`)}`} className="font-semibold underline underline-offset-4">{copy.loginToReview}</Link>
              </p>
            )}

            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {copy.noReviews}
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-2xl border border-border/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {reviewAuthorName(review, locale)}
                      </p>
                      <StarRating value={review.rating} />
                    </div>
                    {review.comentario && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comentario}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {new Intl.DateTimeFormat(locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(review.created_at))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <aside className="space-y-6 lg:col-span-4">
          <section id="apoiar" className="scroll-mt-24 rounded-3xl border border-primary/15 bg-secondary/10 p-6 sm:p-8">
            <Heart className="mb-5 h-7 w-7 text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{locale === "pt" ? "Faz parte desta missão" : "Be part of this mission"}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{locale === "pt" ? "O teu apoio faz a diferença." : "Your support makes a difference."}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{shelter.donation_message || (locale === "pt" ? "Ajuda quem cuida deles todos os dias. Contacta o canil para conhecer as necessidades atuais: alimentação, mantas, voluntariado ou apoio veterinário." : "Help the people caring for them every day. Contact the shelter about food, blankets, volunteering or veterinary support.")}</p>
            {shelter.verificado && shelter.donation_url?.startsWith("https://") ? (
              <>
                <a href={shelter.donation_url} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
                  {locale === "pt" ? "Fazer um donativo" : "Make a donation"}<ArrowUpRight className="h-5 w-5" />
                </a>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{locale === "pt" ? "Abre a página de donativos indicada pelo canil. O pagamento é realizado fora da FYA." : "Opens the shelter’s donation page. Payment takes place outside FYA."}</p>
              </>
            ) : <p className="mt-5 rounded-xl bg-background/70 p-4 text-sm">{locale === "pt" ? "Donativos online ainda não disponíveis. Fala diretamente com o canil para ajudar." : "Online donations are not available yet. Contact the shelter to help."}</p>}
          </section>
          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <h2 className="text-lg font-bold">{copy.contactTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {copy.locationLabel}
                  </p>
                  <p>{shelter.localizacao}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {copy.phoneLabel}
                  </p>
                  <p>{shelter.telefone ?? copy.notProvided}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {copy.emailLabel}
                  </p>
                  <p className="break-all">
                    {shelter.email_contacto ?? copy.notProvided}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PawPrint className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {copy.joinedLabel}
                  </p>
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
