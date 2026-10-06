import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
import {
  getReviewsForModeration,
  getReviewReplies,
  reviewAuthorName,
} from "@/lib/canil/reviews";
import { hasShelterExperience } from "@/lib/canil/public-experience";
import { replyReview } from "@/app/canil/reviews/actions";
import { SubmitButton } from "@/components/submit-button";
import { ReviewReportForm } from "@/components/review-report-form";
import { StarRating } from "@/components/star-rating";
export default async function Reviews({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    search = await searchParams;
  if (!c.shelter)
    return (
      <main id="main-content">
        {pt ? "Seleciona um canil." : "Select a shelter."}
      </main>
    );
  const enabled = await hasShelterExperience(c.supabase),
    reviews = await getReviewsForModeration(c.supabase, c.shelter.id, enabled),
    replies = enabled
      ? await getReviewReplies(
          c.supabase,
          reviews.map((r) => r.id),
        )
      : new Map<string, { body: string }>();
  const { data: membership, error } = await c.supabase
    .from("shelter_memberships")
    .select("role")
    .eq("canil_id", c.shelter.id)
    .eq("profile_id", c.user.id)
    .maybeSingle();
  if (error) throw error;
  const edit =
    c.shelter.owner_profile_id === c.user.id || membership?.role === "editor";
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Avaliações e respostas" : "Reviews and replies"}
      </h1>
      <p>
        {pt
          ? "O canil pode responder publicamente e denunciar conteúdo à FYA. Não pode aprovar, ocultar ou alterar a avaliação de um adotante. Até 100 avaliações recentes."
          : "Shelters can reply publicly and report content to FYA. They cannot approve, hide or edit adopters’ reviews. Up to 100 recent reviews."}
      </p>
      {!enabled && (
        <p role="status">
          {pt
            ? "As respostas e denúncias aguardam a atualização da base de dados."
            : "Replies and reports await the database update."}
        </p>
      )}
      {search.success && (
        <p role="status">{pt ? "Resposta guardada." : "Reply saved."}</p>
      )}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar a resposta."
            : "Could not save the reply."}
        </p>
      )}
      <Link
        className="button-secondary"
        href={`/${locale}/canis/${c.shelter.id}#comentarios`}
      >
        {pt ? "Ver avaliações públicas" : "View public reviews"}
      </Link>
      {!reviews.length && (
        <p>{pt ? "Ainda não há avaliações." : "No reviews yet."}</p>
      )}
      {reviews.map((r) => (
        <article key={r.id} className="support-panel">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="font-bold">{reviewAuthorName(r, locale)}</h2>
            <StarRating value={r.rating} />
          </div>
          <p className="text-sm">
            {r.estado === "aprovada"
              ? pt
                ? "Publicada"
                : "Published"
              : r.estado === "pendente"
                ? pt
                  ? "Em análise pela FYA"
                  : "Under FYA review"
                : pt
                  ? "Ocultada pela FYA"
                  : "Hidden by FYA"}
          </p>
          <p className="whitespace-pre-line break-words">{r.comentario}</p>
          {enabled && r.estado === "aprovada" && edit ? (
            <>
              <form action={replyReview} className="support-form space-y-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="reviewId" value={r.id} />
                <label>
                  {pt ? "Resposta pública do canil" : "Public shelter reply"}
                  <textarea
                    name="body"
                    className="field"
                    minLength={3}
                    maxLength={2000}
                    required
                    defaultValue={replies.get(r.id)?.body ?? ""}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  {pt
                    ? "Responde de forma respeitosa e sem partilhar informação privada do processo de adoção."
                    : "Reply respectfully and do not share private adoption information."}
                </p>
                <SubmitButton className="button-primary">
                  {pt ? "Guardar resposta" : "Save reply"}
                </SubmitButton>
              </form>
              <ReviewReportForm locale={locale} reviewId={r.id} />
            </>
          ) : (
            replies.get(r.id) && (
              <p className="rounded-xl bg-muted p-4">
                {replies.get(r.id)!.body}
              </p>
            )
          )}
        </article>
      ))}
    </main>
  );
}
