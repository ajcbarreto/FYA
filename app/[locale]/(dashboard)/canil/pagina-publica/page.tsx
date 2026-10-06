import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
import { hasShelterExperience } from "@/lib/canil/public-experience";
import {
  savePublicDetails,
  publishShelterNews,
  changeNewsVisibility,
} from "@/app/canil/public-page-actions";
import { SubmitButton } from "@/components/submit-button";
export default async function PublicPageSettings({
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
  const id = c.shelter.id,
    enabled = await hasShelterExperience(c.supabase);
  if (!enabled)
    return (
      <main id="main-content">
        <h1 className="page-title">
          {pt ? "Informação pública" : "Public information"}
        </h1>
        <p className="mt-4">
          {pt
            ? "Esta área aguarda a atualização da base de dados. A página pública continua disponível."
            : "This area is awaiting the database update. The public page remains available."}
        </p>
      </main>
    );
  const [details, news, membership] = await Promise.all([
    c.supabase
      .from("shelter_public_details")
      .select("*")
      .eq("canil_id", id)
      .maybeSingle(),
    c.supabase
      .from("shelter_news")
      .select("*")
      .eq("canil_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    c.supabase
      .from("shelter_memberships")
      .select("role")
      .eq("canil_id", id)
      .eq("profile_id", c.user.id)
      .maybeSingle(),
  ]);
  if (details.error || news.error || membership.error)
    throw new Error("Unable to load public page settings");
  const edit =
    c.shelter.owner_profile_id === c.user.id ||
    membership.data?.role === "editor";
  const fields = (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="shelterId" value={id} />
    </>
  );
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Informação pública e novidades" : "Public information and news"}
      </h1>
      <p>
        {pt
          ? "Publica informação útil para quem quer adotar, visitar ou ajudar. Não incluas dados pessoais de adotantes."
          : "Publish useful information for visitors and supporters. Do not include adopters’ personal details."}
      </p>
      <Link className="button-secondary" href={`/${locale}/canis/${id}`}>
        {pt ? "Ver página pública" : "View public page"}
      </Link>
      {search.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Confirma os dados, a verificação do canil e as permissões."
            : "Could not save. Check the data, shelter verification and permissions."}
        </p>
      )}
      <form action={savePublicDetails} className="support-panel support-form">
        {fields}
        <h2 className="text-xl font-bold">
          {pt ? "Contactos e visitas" : "Contact and visits"}
        </h2>
        <fieldset disabled={!edit} className="space-y-4">
          <label>
            {pt
              ? "Horário de atendimento (opcional)"
              : "Contact hours (optional)"}
            <textarea
              name="visit_hours"
              maxLength={500}
              defaultValue={details.data?.visit_hours ?? ""}
              className="field"
              placeholder={
                pt
                  ? "Ex.: Segunda a sexta, 10h–17h"
                  : "E.g. Monday to Friday, 10am–5pm"
              }
            />
          </label>
          <label>
            {pt
              ? "Como combinar uma visita (opcional)"
              : "How to arrange a visit (optional)"}
            <textarea
              name="visit_instructions"
              maxLength={2000}
              defaultValue={details.data?.visit_instructions ?? ""}
              className="field"
            />
          </label>
          {edit && (
            <SubmitButton className="button-primary">
              {pt ? "Guardar informações" : "Save information"}
            </SubmitButton>
          )}
        </fieldset>
        <Link
          className="inline-flex min-h-11 items-center text-sm underline"
          href={`/${locale}/canil/configuracoes`}
        >
          {pt
            ? "Editar nome, apresentação e contactos"
            : "Edit name, introduction and contacts"}
        </Link>
      </form>
      {edit && (
        <form
          action={publishShelterNews}
          className="support-panel support-form"
        >
          {fields}
          <h2 className="text-xl font-bold">
            {pt ? "Nova atualização" : "New update"}
          </h2>
          <label>
            {pt ? "Título" : "Title"}
            <input
              name="title"
              required
              minLength={3}
              maxLength={160}
              className="field"
            />
          </label>
          <label>
            {pt ? "Novidade ou resultado do apoio" : "News or support outcome"}
            <textarea
              name="body"
              required
              minLength={10}
              maxLength={3000}
              className="field"
            />
          </label>
          <label>
            <input name="published" type="checkbox" />
            {pt
              ? "Publicar na página (requer canil verificado)"
              : "Publish on the page (verified shelters only)"}
          </label>
          <SubmitButton className="button-primary">
            {pt ? "Guardar novidade" : "Save update"}
          </SubmitButton>
        </form>
      )}
      <section className="support-panel">
        <h2 className="text-xl font-bold">
          {pt ? "Novidades recentes" : "Recent updates"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {pt
            ? "Até 50 registos recentes. As cinco novidades mais recentes aparecem na página pública."
            : "Up to 50 recent entries. The five latest updates appear on the public page."}
        </p>
        {!news.data?.length && (
          <p>{pt ? "Ainda não há novidades." : "No updates yet."}</p>
        )}
        {news.data?.map((n) => (
          <article key={n.id} className="space-y-2 border-t pt-4">
            <h3 className="font-bold">{n.title}</h3>
            <p className="whitespace-pre-line break-words text-sm">{n.body}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleDateString(locale)} ·{" "}
              {n.published
                ? pt
                  ? "Publicado"
                  : "Published"
                : pt
                  ? "Rascunho"
                  : "Draft"}
            </p>
            {edit && (
              <form action={changeNewsVisibility}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="newsId" value={n.id} />
                <input
                  type="hidden"
                  name="published"
                  value={String(!n.published)}
                />
                <SubmitButton className="button-secondary">
                  {n.published
                    ? pt
                      ? "Retirar da página"
                      : "Unpublish"
                    : pt
                      ? "Publicar"
                      : "Publish"}
                </SubmitButton>
              </form>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
