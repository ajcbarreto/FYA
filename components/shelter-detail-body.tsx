import { ShelterAnimals } from "@/components/shelter-animals";
import {
  ShelterSupportOverview,
  ShelterNews,
} from "@/components/shelter-support-overview";
import { ReviewReportForm } from "@/components/review-report-form";
import { getPublicShelterExperience } from "@/lib/canil/public-experience";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { setShelterLike } from "@/app/canil/likes-actions";
import { Heart } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  MessageSquareText,
  PawPrint,
  Phone,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCachedPublicShelterById } from "@/lib/canil/cached-shelter";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getAnimalsForPublicShelter } from "@/lib/canil/public-directory";
import {
  getReviewEligibility,
  getReviewReplies,
  getShelterRatingSummaries,
  getShelterReviews,
  reviewAuthorName,
} from "@/lib/canil/reviews";
import { submitShelterReview } from "@/app/canil/reviews/actions";
import { StarRating } from "@/components/star-rating";
import { ToastFeedback } from "@/components/toast-feedback";
import { JsonLd, shelterJsonLd } from "@/lib/seo/json-ld";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";

type ShelterDetailBodyProps = {
  locale: Locale;
  shelterId: string;
  success?: string;
  error?: string;
};

export async function ShelterDetailBody({
  locale,
  shelterId,
  success,
  error,
}: ShelterDetailBodyProps) {
  const supabase = await createServerSupabaseClient();
  const publicDb = createPublicSupabaseClient(
    supabaseUrl,
    supabasePublishableKey,
  );
  const [shelter, { user }, experience] = await Promise.all([
    getCachedPublicShelterById(publicDb, shelterId),
    getAuthUser(),
    getPublicShelterExperience(publicDb, shelterId),
  ]);

  if (!shelter) {
    notFound();
  }

  const [animals, reviews, ratingSummaries, eligibility, likedRow] =
    await Promise.all([
      getAnimalsForPublicShelter(publicDb, shelter.id, locale),
      getShelterReviews(publicDb, shelter.id, experience.enabled),
      getShelterRatingSummaries(publicDb, [shelter.id]),
      user
        ? getReviewEligibility(
            supabase,
            shelter.id,
            user.id,
            experience.enabled,
          )
        : Promise.resolve({ canReview: false, existingReview: null }),
      user
        ? supabase
            .from("canil_likes")
            .select("canil_id")
            .eq("canil_id", shelter.id)
            .eq("user_profile_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const liked = Boolean(likedRow.data);
  const rating = ratingSummaries.get(shelter.id);
  const replies = experience.enabled
    ? await getReviewReplies(
        publicDb,
        reviews.map((r) => r.id),
      )
    : new Map<string, { body: string; updated_at: string }>();
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
          locationLabel: "Localização",
          joinedLabel: "Na FYA desde",
          residentsTitle: "Animais do canil",
          noResidents:
            "Ainda não há animais publicados. Contacta o canil para conhecer as possibilidades de adoção.",
          notProvided: "Não indicado",
          reviewsTitle: "Comentários e avaliações",
          noReviews: "Ainda não há avaliações publicadas.",
          ratingSummary: (avg: number, count: number) =>
            `${avg.toFixed(1)} de 5 · ${count} ${count === 1 ? "avaliação" : "avaliações"}`,
          writeReview: "Deixar avaliação",
          editReview: "Atualizar a tua avaliação",
          ratingLabel: "Classificação",
          commentLabel: "Comentário (opcional)",
          commentPlaceholder: "Como foi a tua experiência com este canil?",
          submitReview: "Enviar avaliação",
          moderationNote:
            "Só quem concluiu uma adoção pode avaliar. A avaliação é publicada com o nome do teu perfil. O canil pode responder, mas não aprovar ou remover avaliações. Denúncias são analisadas pela FYA.",
          pendingNote: "A tua avaliação aguarda análise pela equipa FYA.",
          rejectedNote:
            "A tua avaliação anterior não foi aprovada. Podes editar e reenviar.",
          loginToReview: "Inicia sessão para avaliar este canil.",
          messages: {
            review_saved:
              "Avaliação guardada. Consulta abaixo o estado da publicação.",
            report_saved: "Denúncia recebida pela plataforma. Obrigado.",
            report_failed:
              "Não foi possível enviar. Verifica o motivo ou tenta mais tarde.",
            like_failed: "Não foi possível guardar o gosto. Tenta novamente.",
            review_pending: "Avaliação enviada para análise pela equipa FYA.",
            invalid_review: "Escolhe uma classificação válida.",
            review_failed: "Não foi possível guardar a avaliação.",
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
          residentsTitle: "Shelter animals",
          noResidents: "This shelter has not published pets yet.",
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
            "Only people with a completed adoption can review. Your review is published with your profile name. Shelters can reply but cannot approve or remove reviews. FYA assesses reports.",
          pendingNote: "Your review is awaiting assessment by the FYA team.",
          rejectedNote:
            "Your previous review was not approved. You can edit and resend it.",
          loginToReview: "Sign in to review this shelter.",
          messages: {
            review_saved: "Review saved. Check its publication status below.",
            report_saved: "Report received by the platform. Thank you.",
            report_failed: "Could not report. Check the reason or try later.",
            like_failed: "Could not save your like. Please try again.",
            review_pending: "Review sent. The FYA team will assess it.",
            invalid_review: "Pick a valid rating.",
            review_failed: "Could not save the review.",
          } as Record<string, string>,
        };

  const feedback =
    (success && copy.messages[success]) ||
    (error && copy.messages[error]) ||
    null;

  return (
    <>
      <JsonLd data={shelterJsonLd(shelter, locale)} />
      <Breadcrumbs
        locale={locale}
        items={[sectionCrumb(locale, "shelters"), { label: shelter.nome }]}
        currentPath={`/canis/${shelter.id}`}
      />
      <ToastFeedback
        message={feedback}
        variant={success ? "success" : "error"}
      />

      <header className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:p-8 lg:p-10">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] opacity-70">
          {locale === "pt" ? "Canil ou associação" : "Shelter or rescue group"}
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {shelter.image_url ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={shelter.image_url}
                unoptimized
                alt={shelter.nome}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="inline-flex size-20 shrink-0 items-center justify-center rounded-2xl bg-current/10">
              <Building2 aria-hidden="true" className="size-8" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="display-title text-3xl sm:text-4xl lg:text-5xl">
                {shelter.nome}
              </h1>
              {shelter.verificado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {locale === "pt" ? "Verificado" : "Verified"}
                </span>
              )}
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm opacity-80">
              <MapPin className="h-3.5 w-3.5" />
              {shelter.localizacao}
            </p>
            {shelter.verificado && (
              <details className="mt-2 text-sm">
                <summary className="inline-flex min-h-11 cursor-pointer items-center underline underline-offset-4">
                  {locale === "pt"
                    ? "O que significa verificado?"
                    : "What does verified mean?"}
                </summary>
                <p className="max-w-xl py-2 leading-relaxed">
                  {locale === "pt"
                    ? "O registo deste canil foi aprovado pela administração da FYA. O selo não certifica cuidados veterinários nem confirma os valores dos donativos."
                    : "This shelter’s registration was approved by FYA administration. The badge does not certify veterinary care or verify donation totals."}
                </p>
              </details>
            )}
            {rating && rating.count > 0 && (
              <a
                href="#comentarios"
                className="mt-3 flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                <StarRating value={rating.average} />
                {copy.ratingSummary(rating.average, rating.count)}
              </a>
            )}
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
          <a
            href="#animais"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-bold text-primary hover:opacity-90"
          >
            {locale === "pt" ? "Conhecer os animais" : "Meet the animals"}
          </a>
          <a
            href="#apoiar"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-current/40 px-5 py-3 text-sm font-semibold hover:bg-primary-foreground/10"
          >
            {locale === "pt" ? "Quero ajudar" : "I want to help"}
          </a>
          <a
            href="#contactos"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-current/40 px-5 py-3 text-sm font-semibold hover:bg-primary-foreground/10"
          >
            <Phone aria-hidden="true" className="size-4" />
            {locale === "pt" ? "Contactar o canil" : "Contact the shelter"}
          </a>
          <form action={setShelterLike} className="sm:ml-auto">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="shelterId" value={shelter.id} />
            <input type="hidden" name="liked" value={String(!liked)} />
            <SubmitButton
              aria-pressed={liked}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-current/40 px-5 py-3 text-sm font-semibold hover:bg-primary-foreground/10"
            >
              <Heart
                className="h-4 w-4"
                fill={liked ? "currentColor" : "none"}
              />
              {liked
                ? locale === "pt"
                  ? "Gostaste"
                  : "Liked"
                : locale === "pt"
                  ? "Gosto"
                  : "Like"}
            </SubmitButton>
          </form>
        </div>
      </header>
      <nav
        aria-label={locale === "pt" ? "Nesta página" : "On this page"}
        className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-b border-border py-2 text-sm font-semibold [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center [&>a]:underline-offset-4 [&>a:hover]:underline"
      >
        <a href="#animais">{locale === "pt" ? "Animais" : "Animals"}</a>
        <a href="#sobre">{locale === "pt" ? "Sobre nós" : "About us"}</a>
        <a href="#apoiar">{locale === "pt" ? "Como ajudar" : "How to help"}</a>
        <a href="#contactos">{copy.contactTitle}</a>
        {(experience.news.length > 0 || experience.updates.length > 0) && (
          <a href="#novidades">{locale === "pt" ? "Novidades" : "News"}</a>
        )}
        <a href="#comentarios">
          {locale === "pt" ? "Comentários" : "Comments"}
        </a>
      </nav>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="space-y-6 lg:col-span-8">
          <ShelterAnimals animals={animals} locale={locale} />
          <ShelterSupportOverview
            data={experience}
            locale={locale}
            shelterId={shelter.id}
            donationUrl={shelter.verificado ? shelter.donation_url : null}
            donationMessage={shelter.donation_message}
          />
          <ShelterNews data={experience} locale={locale} />

          <div
            id="sobre"
            className="scroll-mt-24 rounded-3xl border border-border bg-card p-4 sm:p-6"
          >
            <h2 className="text-xl font-bold">{copy.aboutTitle}</h2>
            <p className="mt-3 whitespace-pre-line break-words text-base leading-relaxed text-muted-foreground">
              {shelter.missao ??
                (locale === "pt"
                  ? "O canil ainda não publicou uma apresentação. Podes contactar a equipa para saber mais."
                  : "No public description yet.")}
            </p>
          </div>

          <div
            id="comentarios"
            className="scroll-mt-24 rounded-3xl border border-border bg-card p-4 sm:p-6"
          >
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
                    className="field"
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
                    className="field"
                  />
                </label>
                <SubmitButton type="submit" className="button-primary">
                  {copy.submitReview}
                </SubmitButton>
                <p className="text-xs text-muted-foreground">
                  {copy.moderationNote}
                </p>
              </form>
            ) : (
              <p className="mt-4 rounded-2xl border border-border/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {!experience.enabled ? (
                  locale === "pt" ? (
                    "Consulta as avaliações publicadas. Novas avaliações estarão disponíveis após a atualização do serviço."
                  ) : (
                    "Read published reviews. New reviews will be available after the service update."
                  )
                ) : user ? (
                  locale === "pt" ? (
                    "Podes avaliar depois de concluir uma adoção com este canil. Para dúvidas sobre animais, contacta a equipa."
                  ) : (
                    "You can review after completing an adoption with this shelter. Contact the team with animal questions."
                  )
                ) : (
                  <Link
                    href={`/${locale}/auth/login?next=${encodeURIComponent(`/${locale}/canis/${shelter.id}#comentarios`)}`}
                    className="font-semibold underline underline-offset-4"
                  >
                    {copy.loginToReview}
                  </Link>
                )}
              </p>
            )}

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {locale === "pt"
                ? "As avaliações com o selo “Adoção confirmada” estão associadas a uma adoção concluída na FYA. Avaliações antigas sem selo podem ter sido publicadas com regras anteriores. Até 100 avaliações mais recentes."
                : "Reviews marked “Confirmed adoption” are linked to a completed adoption on FYA. Older reviews without a badge may have been published under previous rules. Up to 100 latest reviews."}
            </p>
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
                    {review.verified_adoption && (
                      <p className="mt-2 text-xs font-semibold text-primary">
                        {locale === "pt"
                          ? "Adoção confirmada"
                          : "Confirmed adoption"}
                      </p>
                    )}
                    {review.comentario && (
                      <p className="mt-2 whitespace-pre-line break-words text-sm text-muted-foreground">
                        {review.comentario}
                      </p>
                    )}
                    {replies.get(review.id) && (
                      <div className="mt-3 rounded-xl bg-muted p-4">
                        <p className="text-sm font-bold">
                          {locale === "pt"
                            ? "Resposta do canil"
                            : "Shelter reply"}
                        </p>
                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                          {replies.get(review.id)!.body}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(
                            replies.get(review.id)!.updated_at,
                          ).toLocaleDateString(locale)}
                        </p>
                      </div>
                    )}
                    {experience.enabled &&
                      user &&
                      review.author_profile_id !== user.id && (
                        <ReviewReportForm
                          locale={locale}
                          reviewId={review.id}
                        />
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

        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <div
            id="contactos"
            className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold">{copy.contactTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {locale === "pt"
                ? "Combina a visita com a equipa antes de te deslocares."
                : "Arrange your visit with the team before travelling."}
            </p>
            {experience.details?.visit_hours && (
              <div className="mt-4 rounded-xl bg-muted p-4">
                <h3 className="text-sm font-bold">
                  {locale === "pt" ? "Horário de atendimento" : "Contact hours"}
                </h3>
                <p className="mt-2 whitespace-pre-line break-words text-sm">
                  {experience.details.visit_hours}
                </p>
              </div>
            )}
            {experience.details?.visit_instructions && (
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed">
                {experience.details.visit_instructions}
              </p>
            )}
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {copy.locationLabel}
                  </p>
                  <p>{shelter.localizacao}</p>
                </div>
              </li>
              {shelter.telefone && (
                <>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {copy.phoneLabel}
                      </p>
                      {shelter.telefone ? (
                        <a
                          className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                          href={`tel:${shelter.telefone.replace(/[^+\d]/g, "")}`}
                        >
                          {shelter.telefone}
                        </a>
                      ) : (
                        <p>{copy.notProvided}</p>
                      )}
                    </div>
                  </li>
                </>
              )}
              {shelter.email_contacto && (
                <>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {copy.emailLabel}
                      </p>
                      <p className="break-all">
                        {shelter.email_contacto ? (
                          <a
                            className="inline-flex min-h-11 items-center underline underline-offset-4"
                            href={`mailto:${shelter.email_contacto}`}
                          >
                            {shelter.email_contacto}
                          </a>
                        ) : (
                          copy.notProvided
                        )}
                      </p>
                    </div>
                  </li>
                </>
              )}
              <li className="flex items-start gap-3">
                <PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
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
    </>
  );
}
