import { recordsContext } from "@/lib/records/context";
import { requestPrivacy } from "@/app/records/privacy-actions";
import { SubmitButton } from "@/components/submit-button";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "accountPrivacy", "/conta/privacidade");
}
export default async function PrivacyAccount({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    feedback = await searchParams;
  const { data, error } = await c.supabase
    .from("privacy_requests")
    .select("*")
    .eq("profile_id", c.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load requests");
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl p-8 space-y-6">
      <h1 className="page-title">{pt ? "Os teus dados" : "Your data"}</h1>
      <a download className="underline" href="/api/account/export">
        {pt
          ? "Descarregar os dados da tua conta (JSON)"
          : "Download your account data (JSON)"}
      </a>
      <p>
        {pt
          ? "A exportação inclui os teus dados de conta, candidaturas e mensagens que enviaste. Podes pedir acesso complementar, correção ou apagamento. Pedidos de apagamento são analisados para preservar dados cuja conservação seja necessária."
          : "The export includes your account data, applications and messages you sent. Request additional access, correction or erasure. Erasure requests are reviewed for applicable retention requirements."}
      </p>
      {feedback.success && (
        <p role="status">
          {pt
            ? "Pedido registado. Acompanha a resposta nesta página."
            : "Request registered. Follow the response on this page."}
        </p>
      )}
      {feedback.error && (
        <p role="alert">
          {pt
            ? "Não foi possível registar. Verifica se já existe um pedido pendente do mesmo tipo."
            : "Could not register. Check for a pending request of the same type."}
        </p>
      )}
      <form
        action={requestPrivacy}
        className="space-y-4 rounded-2xl border border-border p-6"
      >
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          {pt ? "Tipo de pedido" : "Request type"}
          <select name="kind" className="field">
            <option value="access">{pt ? "Acesso" : "Access"}</option>
            <option value="rectification">
              {pt ? "Correção" : "Correction"}
            </option>
            <option value="erasure">{pt ? "Apagamento" : "Erasure"}</option>
          </select>
        </label>
        <label className="block">
          {pt ? "Detalhes" : "Details"}
          <textarea name="message" maxLength={4000} className="field" />
        </label>
        <SubmitButton className="button-primary">
          {pt ? "Registar pedido" : "Submit request"}
        </SubmitButton>
      </form>
      {data?.map((r) => (
        <article key={r.id} className="rounded-2xl border border-border p-6">
          <p>
            {r.kind} · {r.status} ·{" "}
            {new Date(r.created_at).toLocaleDateString(locale)}
          </p>
          <p className="whitespace-pre-wrap">{r.message}</p>
          <p className="mt-3 whitespace-pre-wrap">{r.response}</p>
        </article>
      ))}
    </main>
  );
}
