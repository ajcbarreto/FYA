import Link from "next/link";
import { notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
import { supportAmount } from "@/lib/support/format";
import { SupportProjectForm } from "@/components/support-project-form";
import { SubmitButton } from "@/components/submit-button";
import {
  recordSupport,
  voidSupport,
  publishSupportUpdate,
} from "@/app/support/actions";
export default async function ManageSupport({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale, projectId } = await params;
  if (!validId(projectId)) notFound();
  const c = await recordsContext(locale),
    pt = locale === "pt";
  const { data: p, error } = await c.supabase
    .from("support_projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error || !p || !c.shelters.some((s) => s.id === p.canil_id)) notFound();
  const shelter = c.shelters.find((s) => s.id === p.canil_id)!;
  const [pledges, receipts, updates, membership] = await Promise.all([
    c.supabase
      .from("support_pledges")
      .select("*")
      .eq("project_id", p.id)
      .eq("status", "pending")
      .order("created_at")
      .limit(100),
    c.supabase
      .from("support_receipts")
      .select("*")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(100),
    c.supabase
      .from("support_updates")
      .select("*")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(50),
    c.supabase
      .from("shelter_memberships")
      .select("role")
      .eq("canil_id", p.canil_id)
      .eq("profile_id", c.user.id)
      .maybeSingle(),
  ]);
  if ([pledges, receipts, updates, membership].some((r) => r.error))
    throw new Error("Unable to load support details");
  const edit =
      shelter.owner_profile_id === c.user.id ||
      membership.data?.role === "editor",
    search = await searchParams;
  const fields = (
      <>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="projectId" value={p.id} />
      </>
    ),
    box = "support-panel support-form",
    input = "field";
  return (
    <main id="main-content" className="space-y-6">
      <Link className="underline" href={`/${locale}/canil/apoios`}>
        ← {pt ? "Apoios" : "Support"}
      </Link>
      <h1 className="page-title">{p.title}</h1>
      <p className="text-lg font-bold">
        {supportAmount(p.received, p.kind, p.unit, locale)}{" "}
        {pt ? "confirmados pelo canil" : "confirmed by the shelter"}
      </p>
      <p>
        {pt
          ? "Promessas não entram no total. Regista apenas valores ou bens já recebidos. Este registo não é um comprovativo fiscal."
          : "Promises do not count towards the total. Record only money or goods already received. This record is not a tax receipt."}
      </p>
      <Link className="underline" href={`/${locale}/apoios/${p.id}`}>
        {pt ? "Abrir página pública" : "Open public page"}
      </Link>
      {search.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Confirma os dados e se o registo já foi tratado."
            : "Could not save. Check the data and whether the record was already handled."}
        </p>
      )}
      {edit && (
        <>
          <SupportProjectForm locale={locale} project={p} />
          <form action={recordSupport} className={box}>
            {fields}
            <input type="hidden" name="receiptId" value={randomUUID()} />
            <h2 className="text-xl font-bold">
              {pt ? "Registar apoio recebido" : "Record received support"}
            </h2>
            <label>
              {p.kind === "money"
                ? pt
                  ? "Valor recebido em euros"
                  : "Amount received in euros"
                : `${pt ? "Quantidade recebida" : "Quantity received"} (${p.unit})`}
              <input
                name="quantity"
                inputMode={p.kind === "money" ? "decimal" : "numeric"}
                required
                className={input}
              />
            </label>
            <label className="block">
              {pt ? "Nota privada / referência" : "Private note / reference"}
              <textarea name="note" maxLength={1000} className={input} />
            </label>
            <SubmitButton className="button-primary">
              {pt ? "Confirmar receção" : "Confirm receipt"}
            </SubmitButton>
          </form>
        </>
      )}
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Promessas por confirmar" : "Promises awaiting confirmation"}
        </h2>
        <p className="text-sm">
          {pt
            ? "Primeiras 100, por ordem de chegada. Combina a entrega pelo contacto indicado. A confirmação regista a quantidade total prometida; para entregas parciais, regista-as manualmente e pede ao apoiante que cancele a promessa original."
            : "First 100, oldest first. Arrange delivery using the supplied contact. Confirmation records the full promised quantity; for partial deliveries, record each receipt manually and ask the supporter to cancel the original promise."}
        </p>
        {!pledges.data?.length && (
          <p>{pt ? "Sem promessas pendentes." : "No pending promises."}</p>
        )}
        {pledges.data?.map((r) => (
          <div key={r.id} className="border-t pt-3">
            <p className="font-semibold">
              {r.contact_name} ·{" "}
              {supportAmount(r.quantity, p.kind, p.unit, locale)}
            </p>
            <p className="break-all">{r.contact_email}</p>
            <p className="whitespace-pre-wrap">{r.message}</p>
            {edit && (
              <form action={recordSupport} className="mt-3">
                {fields}
                <input type="hidden" name="receiptId" value={randomUUID()} />
                <input type="hidden" name="pledgeId" value={r.id} />
                <input type="hidden" name="quantity" value={r.quantity} />
                <input
                  type="hidden"
                  name="note"
                  value="Receção de promessa / Pledge receipt"
                />
                <SubmitButton className="button-secondary">
                  {pt ? "Confirmar entrega completa" : "Confirm full delivery"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Histórico de receções" : "Receipt history"}
        </h2>
        <p className="text-sm">
          {pt
            ? "100 registos mais recentes. Anular um registo corrige o total; não movimenta dinheiro."
            : "100 most recent records. Voiding a record corrects the total; it does not move money."}
        </p>
        {receipts.data?.map((r) => (
          <div key={r.id} className="space-y-2 border-t pt-3">
            <p>
              {supportAmount(r.quantity, p.kind, p.unit, locale)} ·{" "}
              {new Date(r.created_at).toLocaleString(locale)}{" "}
              {r.voided_at ? (pt ? "· Anulado" : "· Voided") : ""}
            </p>
            <p className="whitespace-pre-wrap">{r.note}</p>
            {r.void_reason && <p>{r.void_reason}</p>}
            {edit && !r.voided_at && (
              <form action={voidSupport}>
                {fields}
                <input type="hidden" name="receiptId" value={r.id} />
                <label>
                  {pt ? "Motivo da correção" : "Correction reason"}
                  <input
                    name="reason"
                    required
                    minLength={3}
                    maxLength={1000}
                    className={input}
                  />
                </label>
                <SubmitButton className="button-secondary mt-2">
                  {pt ? "Anular registo" : "Void record"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Atualizações públicas" : "Public updates"}
        </h2>
        <p className="text-sm">
          {pt
            ? "Explica o progresso e como o apoio foi utilizado. Não incluas dados pessoais. Últimas 50 atualizações."
            : "Explain progress and how support was used. Do not include personal data. Latest 50 updates."}
        </p>
        {edit && (
          <form action={publishSupportUpdate}>
            {fields}
            <label>
              {pt ? "Texto da atualização" : "Update text"}
              <textarea
                name="body"
                required
                minLength={3}
                maxLength={2000}
                className={input}
              />
            </label>
            <SubmitButton className="mt-3 button-secondary">
              {pt ? "Guardar atualização pública" : "Save public update"}
            </SubmitButton>
          </form>
        )}
        {updates.data?.map((u) => (
          <p key={u.id} className="whitespace-pre-wrap border-t pt-3">
            {new Date(u.created_at).toLocaleDateString(locale)} · {u.body}
          </p>
        ))}
      </section>
    </main>
  );
}
