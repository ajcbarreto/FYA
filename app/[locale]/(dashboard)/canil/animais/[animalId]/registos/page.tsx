import { HelpLink } from "@/components/help-link";
import { HandoverChecklist } from "@/components/handover-checklist";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { recordsContext } from "@/lib/records/context";
import {
  saveRecord,
  uploadDocument,
  removeDocument,
  shareDocuments,
  revokeShare,
  manageAnimal,
} from "@/app/records/actions";
import { SubmitButton } from "@/components/submit-button";
export default async function RecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; animalId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale, animalId } = await params;
  const c = await recordsContext(locale, animalId);
  const animal = c.animal!;
  const pt = locale === "pt";
  const results = await Promise.all([
    c.supabase
      .from("animal_records")
      .select("*")
      .eq("animal_id", animalId)
      .maybeSingle(),
    c.supabase
      .from("animal_documents")
      .select("*")
      .eq("animal_id", animalId)
      .order("created_at", { ascending: false }),
    c.supabase
      .from("document_shares")
      .select("*")
      .eq("animal_id", animalId)
      .order("created_at", { ascending: false })
      .limit(50),
    c.supabase
      .from("pedidos_adocao")
      .select(
        "id,status,profiles!pedidos_adocao_applicant_profile_id_fkey(full_name,email)",
      )
      .eq("animal_id", animalId)
      .in("status", ["entrevista", "aprovado", "concluido"]),
  ]);
  if (results.some((r) => r.error))
    throw new Error("Unable to load animal records");
  const [record, documents, shares, requests] = results;
  const feedback = await searchParams;
  const fields = [
    ["internal_ref", "Referência interna", "Internal reference", "text"],
    ["microchip", "Microchip", "Microchip", "text"],
    ["intake_date", "Data de entrada", "Intake date", "date"],
    ["birth_date", "Nascimento estimado", "Estimated birth date", "date"],
    ["origin", "Origem", "Origin", "text"],
    ["location", "Localização / box", "Location / kennel", "text"],
  ] as const;
  const notes = [
    ["health_notes", "Saúde e cuidados", "Health and care"],
    ["behaviour_notes", "Comportamento observado", "Observed behaviour"],
    [
      "internal_notes",
      "Notas internas — nunca partilhadas",
      "Internal notes — never shared",
    ],
    [
      "handover_notes",
      "Informação de entrega — incluída nas partilhas",
      "Handover information — included in shares",
    ],
  ] as const;
  const hidden = (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="animalId" value={animalId} />
    </>
  );
  const box = "rounded-2xl border border-border bg-card p-6 space-y-4";
  const button =
    "rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground";
  const input =
    "field";
  return (
    <main id="main-content" className="space-y-6">
      <Link href={`/${locale}/canil/animais/${animalId}`}>
        ← {pt ? "Dados públicos e fotografias" : "Public details and photos"}
      </Link>
      <header>
        <p className="text-sm text-muted-foreground">
          {pt ? "Centro de registos" : "Records centre"}
        </p>
        <h1 className="page-title">{animal.nome}</h1>
        <p>
          {pt
            ? "Ficha interna, documentos e dossier de adoção."
            : "Internal record, documents and adoption dossier."}
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <HelpLink locale={locale} guide="documentos-dossier" />
        <Link
          className="rounded-full border px-4 py-2 text-sm font-semibold"
          href={`/${locale}/canil/animais/${animalId}/historico`}
        >
          {pt ? "Ver cronologia" : "View timeline"}
        </Link>
        {animal.published && !animal.archived_at && c.shelter?.verificado && (
          <Link
            className="rounded-full border px-4 py-2 text-sm font-semibold"
            href={`/${locale}/pets/${animalId}/imprimir`}
          >
            {pt ? "Ficha imprimível e QR" : "Printable profile and QR"}
          </Link>
        )}
      </div>
      {feedback.success && (
        <p role="status" className={box}>
          {pt
            ? "Operação guardada. Os emails ficam na fila de entrega; consulta o estado abaixo."
            : "Saved. Emails enter the delivery queue; check the status below."}
        </p>
      )}
      {feedback.error && (
        <p role="alert" className={box}>
          {pt
            ? "Não foi possível concluir. Verifica os dados, as permissões e a configuração de email."
            : "Could not complete. Check data, permissions and email configuration."}
        </p>
      )}
      <form action={saveRecord} className={box}>
        {hidden}
        <h2 className="text-xl font-bold">
          {pt ? "Ficha privada do animal" : "Private animal record"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, p, e, type]) => (
            <label key={key}>
              {pt ? p : e}
              <input
                className={input}
                name={key}
                type={type}
                defaultValue={record.data?.[key] ?? ""}
              />
            </label>
          ))}
        </div>
        {notes.map(([key, p, e]) => (
          <label className="block" key={key}>
            {pt ? p : e}
            <textarea
              className={input}
              name={key}
              rows={3}
              maxLength={6000}
              defaultValue={record.data?.[key] ?? ""}
            />
          </label>
        ))}
        <SubmitButton className={button}>
          {pt ? "Guardar ficha" : "Save record"}
        </SubmitButton>
      </form>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Documentos privados" : "Private documents"}
        </h2>
        <p className="text-sm">
          {pt
            ? "PDF, JPG ou PNG até 10 MB. Só os documentos marcados para partilha podem integrar o dossier."
            : "PDF, JPG or PNG up to 10 MB. Only documents marked for sharing can be included in a dossier."}
        </p>
        <form action={uploadDocument} className="space-y-3">
          {hidden}
          <label className="block">
            {pt ? "Título" : "Title"}
            <input className={input} name="title" required maxLength={160} />
          </label>
          <label className="block">
            {pt ? "Categoria" : "Category"}
            <select className={input} name="category">
              <option value="health">{pt ? "Saúde" : "Health"}</option>
              <option value="identification">
                {pt ? "Identificação" : "Identification"}
              </option>
              <option value="adoption">{pt ? "Adoção" : "Adoption"}</option>
              <option value="other">{pt ? "Outro" : "Other"}</option>
            </select>
          </label>
          <label className="block">
            {pt ? "Ficheiro" : "File"}
            <input
              className={input}
              type="file"
              name="document"
              accept="application/pdf,image/jpeg,image/png"
              required
            />
          </label>
          <label className="flex gap-2">
            <input type="checkbox" name="shareable" />
            {pt
              ? "Pode ser partilhado com o adotante"
              : "May be shared with the adopter"}
          </label>
          <SubmitButton className={button}>
            {pt ? "Adicionar documento" : "Add document"}
          </SubmitButton>
        </form>
        {documents.data?.length === 0 && (
          <p>{pt ? "Ainda não existem documentos." : "No documents yet."}</p>
        )}
        {documents.data?.map((d) => (
          <article
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"
          >
            <div>
              <a
                className="font-semibold underline"
                href={`/api/documents/${d.id}`}
              >
                {d.title}
              </a>
              <p className="text-sm text-muted-foreground">
                {d.category} · {Math.ceil(d.size_bytes / 1024)} KB ·{" "}
                {d.shareable
                  ? pt
                    ? "Partilhável"
                    : "Shareable"
                  : pt
                    ? "Apenas equipa"
                    : "Team only"}
              </p>
            </div>
            <form action={removeDocument}>
              {hidden}
              <input type="hidden" name="documentId" value={d.id} />
              <SubmitButton className="text-sm text-destructive">
                {pt ? "Remover documento" : "Remove document"}
              </SubmitButton>
            </form>
          </article>
        ))}
      </section>
      <HandoverChecklist
        supabase={c.supabase}
        shelterId={animal.canil_id}
        animalId={animalId}
        locale={locale}
      />
      <form action={shareDocuments} className={box}>
        {hidden}
        <input type="hidden" name="shareId" value={randomUUID()} />
        <h2 className="text-xl font-bold">
          {pt ? "Enviar dossier por email" : "Email adoption dossier"}
        </h2>
        <p>
          {pt
            ? "O destinatário recebe um link reservado à sua conta. Escolhe os documentos; as notas internas nunca são incluídas. O acesso pode ser revogado, mas ficheiros já descarregados não podem ser retirados."
            : "The recipient receives a link restricted to their account. Choose documents; internal notes are never included. Access can be revoked, but downloaded files cannot be recalled."}
        </p>
        <label className="block">
          {pt ? "Adotante da candidatura" : "Applicant"}
          <select name="requestId" className={input} required>
            <option value="">
              {pt ? "Selecionar candidatura" : "Choose application"}
            </option>
            {requests.data?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.profiles?.full_name} · {r.profiles?.email} · {r.status}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="space-y-2">
          <legend>{pt ? "Documentos a enviar" : "Documents to share"}</legend>
          {documents.data
            ?.filter((d) => d.shareable)
            .map((d) => (
              <label className="flex gap-2" key={d.id}>
                <input
                  type="checkbox"
                  name="documents"
                  value={d.id}
                  defaultChecked
                />
                {d.title}
              </label>
            ))}
        </fieldset>
        <label className="block">
          {pt ? "Validade do acesso" : "Access duration"}
          <select className={input} name="days" defaultValue="7">
            <option value="7">7 {pt ? "dias" : "days"}</option>
            <option value="14">14 {pt ? "dias" : "days"}</option>
            <option value="30">30 {pt ? "dias" : "days"}</option>
          </select>
        </label>
        <SubmitButton
          className={button}
          disabled={
            !documents.data?.some((d) => d.shareable) || !requests.data?.length
          }
        >
          {pt ? "Enviar dossier" : "Send dossier"}
        </SubmitButton>
      </form>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Histórico de partilhas" : "Sharing history"}
        </h2>
        {shares.data?.length === 0 && (
          <p>{pt ? "Sem partilhas." : "No shares."}</p>
        )}
        {shares.data?.map((s) => (
          <div className="border-t border-border pt-3" key={s.id}>
            <p>
              {s.document_ids.length}{" "}
              {pt ? "documentos · válido até" : "documents · valid until"}{" "}
              {new Date(s.expires_at).toLocaleDateString(locale)} ·{" "}
              {s.revoked_at
                ? pt
                  ? "Revogado"
                  : "Revoked"
                : pt
                  ? "Consultar entrega em Operação"
                  : "Check delivery in Operations"}
            </p>
            {!s.revoked_at && (
              <form action={revokeShare}>
                {hidden}
                <input type="hidden" name="shareId" value={s.id} />
                <SubmitButton className="text-destructive text-sm">
                  {pt ? "Revogar acesso" : "Revoke access"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Ciclo e publicação" : "Lifecycle and publication"}
        </h2>
        <p>
          {animal.archived_at
            ? pt
              ? "Arquivado"
              : "Archived"
            : animal.published
              ? pt
                ? "Publicado"
                : "Published"
              : pt
                ? "Interno"
                : "Internal"}{" "}
          · {animal.status}
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            [
              animal.archived_at ? "restore" : "archive",
              animal.archived_at
                ? pt
                  ? "Restaurar"
                  : "Restore"
                : pt
                  ? "Arquivar"
                  : "Archive",
            ],
            [
              animal.published ? "unpublish" : "publish",
              animal.published
                ? pt
                  ? "Retirar do catálogo"
                  : "Unpublish"
                : pt
                  ? "Publicar"
                  : "Publish",
            ],
            ...(animal.status === "adotado"
              ? []
              : [
                  [
                    "adotado",
                    pt ? "Registar adoção externa" : "Record external adoption",
                  ],
                ]),
          ].map(([op, label]) => (
            <form key={op} action={manageAnimal}>
              {hidden}
              <input type="hidden" name="operation" value={op} />
              <SubmitButton className={button}>{label}</SubmitButton>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
