import { notFound, redirect } from "next/navigation";
import { Check, MessageSquareText, X } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getReviewsForModeration, reviewAuthorName, type ReviewEstado } from "@/lib/canil/reviews";
import { moderateReview } from "@/app/canil/reviews/actions";
import { StarRating } from "@/components/star-rating";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";

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

  const copy = getDictionary(locale).canilReviewsPage;
  const estadoLabel: Record<ReviewEstado, string> = {
    pendente: copy.estadoPending,
    aprovada: copy.estadoApproved,
    rejeitada: copy.estadoRejected,
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
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      {!shelter ? (
        <p className="rounded-2xl border border-border/25 bg-card px-6 py-8 text-sm text-muted-foreground">
          {copy.noShelter}
        </p>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {copy.pendingTitle}
              </h2>
              {pending.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </div>
            {pending.length === 0 ? (
  <PageEmpty title={copy.emptyPending} icon={MessageSquareText} />
            ) : (
              <ul className="space-y-3">
                {pending.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-border/25 bg-card p-5">
                    <header className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{reviewAuthorName(review, locale)}</p>
                      <StarRating value={review.rating} />
                    </header>
                    {review.comentario && (
                      <p className="mt-2 text-sm text-muted-foreground">{review.comentario}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/15 pt-4">
                      <form action={moderateReview}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="decision" value="aprovada" />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
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

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {copy.historyTitle}
            </h2>
            {moderated.length === 0 ? (
  <PageEmpty title={copy.emptyHistory} icon={MessageSquareText} />
            ) : (
              <ul className="space-y-3">
                {moderated.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-border/25 bg-card p-5">
                    <header className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{reviewAuthorName(review, locale)}</p>
                      <span className="flex items-center gap-2">
                        <StarRating value={review.rating} />
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${estadoClass(review.estado)}`}>
                          {estadoLabel[review.estado]}
                        </span>
                      </span>
                    </header>
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
