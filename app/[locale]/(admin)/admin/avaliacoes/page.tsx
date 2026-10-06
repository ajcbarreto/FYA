import { notFound } from "next/navigation";
import { recordsContext } from "@/lib/records/context";
import { hasShelterExperience } from "@/lib/canil/public-experience";
import { moderateReview } from "@/app/canil/reviews/actions";
import { SubmitButton } from "@/components/submit-button";
import { StarRating } from "@/components/star-rating";
export default async function ReviewModeration({
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
  const { data: profile } = await c.supabase
    .from("profiles")
    .select("role")
    .eq("id", c.user.id)
    .single();
  if (profile?.role !== "admin") notFound();
  const enabled = await hasShelterExperience(c.supabase);
  if (!enabled)
    return (
      <main id="main-content">
        <h1 className="page-title">
          {pt ? "Moderação de avaliações" : "Review moderation"}
        </h1>
        <p>
          {pt
            ? "Aguarda a atualização da base de dados."
            : "Awaiting the database update."}
        </p>
      </main>
    );
  const { data: reports, error: reportsError } = await c.supabase
    .from("shelter_review_reports")
    .select("*")
    .is("resolved_at", null)
    .order("created_at")
    .limit(100);
  if (reportsError) throw reportsError;
  const ids = [...new Set((reports ?? []).map((r) => r.review_id))];
  let query = c.supabase
    .from("avaliacoes_canil")
    .select(
      "id,canil_id,author_name,rating,comentario,estado,verified_adoption,created_at",
    )
    .order("created_at")
    .limit(100);
  query = ids.length
    ? query.or(`estado.eq.pendente,id.in.(${ids.join(",")})`)
    : query.eq("estado", "pendente");
  const { data: reviews, error } = await query;
  if (error) throw error;
  const { data: decisions, error: historyError } = await c.supabase
    .from("shelter_review_decisions")
    .select("id,review_id,decision,reason,created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (historyError) throw historyError;
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Moderação de avaliações" : "Review moderation"}
      </h1>
      <p>
        {pt
          ? "Analisa denúncias e avaliações pendentes com critérios de abuso, falsidade e privacidade. Uma classificação baixa não é motivo para ocultar. Cada decisão exige justificação e fica registada."
          : "Assess reports and pending reviews for abuse, falsehood and privacy. A low rating is not grounds for hiding a review. Each decision requires a reason and is recorded."}
      </p>
      <p className="text-sm text-muted-foreground">
        {pt
          ? "Primeiras 100 avaliações e 100 denúncias abertas, das mais antigas para as mais recentes."
          : "First 100 reviews and 100 open reports, oldest first."}
      </p>
      {search.success && (
        <p role="status">{pt ? "Decisão registada." : "Decision recorded."}</p>
      )}
      {search.error && (
        <p role="alert">
          {pt ? "Não foi possível guardar." : "Could not save."}
        </p>
      )}
      {!reviews?.length && (
        <p>
          {pt ? "Sem avaliações por tratar." : "No reviews awaiting action."}
        </p>
      )}
      {reviews?.map((r) => (
        <article key={r.id} className="support-panel">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="font-bold">{r.author_name || "—"}</h2>
            <StarRating value={r.rating} />
          </div>
          <p className="whitespace-pre-line break-words">{r.comentario}</p>
          <p className="text-sm text-muted-foreground">
            {r.verified_adoption
              ? pt
                ? "Adoção confirmada"
                : "Confirmed adoption"
              : pt
                ? "Avaliação anterior, sem selo de adoção confirmada"
                : "Legacy review without confirmed adoption badge"}
          </p>
          {reports
            ?.filter((x) => x.review_id === r.id)
            .map((x) => (
              <div key={x.id} className="rounded-xl bg-muted p-4">
                <p className="text-xs font-bold">
                  {pt ? "Denúncia privada" : "Private report"}
                </p>
                <p className="mt-2 whitespace-pre-line break-words text-sm">
                  {x.reason}
                </p>
              </div>
            ))}
          <form action={moderateReview} className="support-form space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="reviewId" value={r.id} />
            <label>
              {pt ? "Decisão" : "Decision"}
              <select name="decision" className="field">
                <option value="aprovada">
                  {pt ? "Publicar / manter visível" : "Publish / keep visible"}
                </option>
                <option value="rejeitada">{pt ? "Ocultar" : "Hide"}</option>
              </select>
            </label>
            <label>
              {pt ? "Justificação interna" : "Internal reason"}
              <textarea
                className="field"
                name="reason"
                required
                minLength={10}
                maxLength={2000}
              />
            </label>
            <SubmitButton className="button-primary">
              {pt ? "Registar decisão" : "Record decision"}
            </SubmitButton>
          </form>
        </article>
      ))}
      <section className="support-panel">
        <h2 className="text-xl font-bold">
          {pt ? "Últimas 20 decisões" : "Latest 20 decisions"}
        </h2>
        {decisions?.map((d) => (
          <article key={d.id} className="border-t pt-3">
            <p className="text-sm font-semibold">
              {d.decision === "aprovada"
                ? pt
                  ? "Visível"
                  : "Visible"
                : pt
                  ? "Ocultada"
                  : "Hidden"}{" "}
              · {new Date(d.created_at).toLocaleString(locale)}
            </p>
            <p className="whitespace-pre-line break-words text-sm">
              {d.reason}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
