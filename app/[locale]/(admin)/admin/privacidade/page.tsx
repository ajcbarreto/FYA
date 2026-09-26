import { recordsContext } from "@/lib/records/context";
import { respondPrivacy } from "@/app/records/privacy-actions";
import { SubmitButton } from "@/components/submit-button";
import { notFound } from "next/navigation";
export default async function AdminPrivacy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt";
  const { data: profile } = await c.supabase
    .from("profiles")
    .select("role")
    .eq("id", c.user.id)
    .single();
  if (profile?.role !== "admin") notFound();
  const { data, error } = await c.supabase
    .from("privacy_requests")
    .select("*,profiles(email)")
    .order("created_at")
    .limit(100);
  if (error) throw new Error("Unable to load privacy requests");
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Pedidos de privacidade" : "Privacy requests"}
      </h1>
      <p>
        {pt
          ? "A resposta fica disponível na conta. Marcar como concluído regista a decisão; não elimina automaticamente dados. Executa e documenta o tratamento antes de fechar."
          : "The response is available in the account. Completing a request records the decision; it does not automatically erase data. Carry out and document the processing before closing."}
      </p>
      {data?.map((r) => (
        <form
          key={r.id}
          action={respondPrivacy}
          className="rounded-2xl border border-border p-6 space-y-3"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="requestId" value={r.id} />
          <p>
            {r.profiles?.email} · {r.kind} · {r.status} ·{" "}
            {new Date(r.created_at).toLocaleDateString(locale)}
          </p>
          <p>{r.message}</p>
          <label className="block">
            {pt ? "Decisão" : "Decision"}
            <select name="status" className="field">
              <option value="in_progress">
                {pt ? "Em tratamento" : "In progress"}
              </option>
              <option value="completed">
                {pt ? "Concluído" : "Completed"}
              </option>
              <option value="declined">
                {pt ? "Recusado com fundamento" : "Declined with reasons"}
              </option>
            </select>
          </label>
          <label className="block">
            {pt ? "Resposta ao titular" : "Response to the requester"}
            <textarea
              name="response"
              className="field"
              required
              maxLength={4000}
              defaultValue={r.response}
            />
          </label>
          <SubmitButton className="button-primary">
            {pt ? "Guardar resposta" : "Save response"}
          </SubmitButton>
        </form>
      ))}
    </main>
  );
}
