import { notFound, redirect } from "next/navigation";
import { Check, MessageSquareText, X } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getReviewsForModeration, reviewAuthorName, type ReviewEstado } from "@/lib/canil/reviews";
import { moderateReview } from "@/app/canil/reviews/actions";
import { StarRating } from "@/components/star-rating";
import { ToastFeedback } from "@/components/toast-feedback";

type CanilReviewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CanilReviewsPage({ params, searchParams }: CanilReviewsPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/avaliacoes`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  const reviews = shelter ? await getReviewsForModeration(supabase, shelter.id) : [];
  const pending = reviews.filter((review) => review.estado === "pendente");
  const moderated = reviews.filter((review) => review.estado !== "pendente");

  const copy =
    locale === "pt"
      ? {
          title: "Avaliacoes do canil",
          subtitle: "Aprova ou rejeita as avaliacoes que os adotantes deixaram. So as aprovadas ficam visiveis.",
          noShelter: "Nao foi encontrado um canil associado a esta conta.",
          pendingTitle: "A aguardar moderacao",
          historyTitle: "Avaliacoes moderadas",
          emptyPending: "Sem avaliacoes pendentes.",
          emptyHistory: "Ainda nao moderaste nenhuma avaliacao.",
          approve: "Aprovar",
          reject: "Rejeitar",
          estados: { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" } as Record<ReviewEstado, string>,
          messages: {
            review_approved: "Avaliacao aprovada.",
            review_rejected: "Avaliacao rejeitada.",
            invalid_review: "Avaliacao invalida.",
            moderation_failed: "Nao foi possivel moderar a avaliacao.",
          } as Record<string, string>,
        }
      : {
          title: "Shelter reviews",
          subtitle: "Approve or reject reviews left by adopters. Only approved ones become visible.",
          noShelter: "No shelter is linked to this account.",
          pendingTitle: "Awaiting moderation",
          historyTitle: "Moderated reviews",
          emptyPending: "No pending reviews.",
          emptyHistory: "You have not moderated any review yet.",
          approve: "Approve",
          reject: "Reject",
          estados: { pendente: "Pending", aprovada: "Approved", rejeitada: "Rejected" } as Record<ReviewEstado, string>,
          messages: {
            review_approved: "Review approved.",
            review_rejected: "Review rejected.",
            invalid_review: "Invalid review.",
            moderation_failed: "Could not moderate the review.",
          } as Record<string, string>,
        };

  const feedback = (success && copy.messages[success]) || (error && copy.messages[error]) || null;

  const estadoClass = (estado: ReviewEstado) =>
    estado === "aprovada"
      ? "bg-secondary/15 text-secondary"
      : estado === "rejeitada"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <main className="space-y-6">
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />
      <header className="rounded-2xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      {!shelter ? (
        <p className="rounded-2xl border border-border/20 bg-card px-6 py-8 text-sm text-muted-foreground">
          {copy.noShelter}
        </p>
      ) : (
        <>
          <section className="rounded-2xl border border-border/20 bg-card p-6">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold">
              <MessageSquareText className="h-5 w-5 text-primary" />
              {copy.pendingTitle}
              {pending.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </h2>
            {pending.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.emptyPending}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {pending.map((review) => (
                  <li key={review.id} className="rounded-xl border border-border/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{reviewAuthorName(review, locale)}</p>
                      <StarRating value={review.rating} />
                    </div>
                    {review.comentario && (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comentario}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <form action={moderateReview}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="decision" value="aprovada" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {copy.approve}
                        </button>
                      </form>
                      <form action={moderateReview}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="decision" value="rejeitada" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                          {copy.reject}
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border/20 bg-card p-6">
            <h2 className="text-lg font-bold">{copy.historyTitle}</h2>
            {moderated.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.emptyHistory}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {moderated.map((review) => (
                  <li key={review.id} className="rounded-xl border border-border/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{reviewAuthorName(review, locale)}</p>
                      <span className="flex items-center gap-2">
                        <StarRating value={review.rating} />
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${estadoClass(review.estado)}`}>
                          {copy.estados[review.estado]}
                        </span>
                      </span>
                    </div>
                    {review.comentario && (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comentario}</p>
                    )}
                    {review.estado === "aprovada" && (
                      <form action={moderateReview} className="mt-3">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="decision" value="rejeitada" />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-muted-foreground hover:text-destructive"
                        >
                          {copy.reject}
                        </button>
                      </form>
                    )}
                    {review.estado === "rejeitada" && (
                      <form action={moderateReview} className="mt-3">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="decision" value="aprovada" />
                        <button type="submit" className="text-xs font-semibold text-primary hover:underline">
                          {copy.approve}
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
