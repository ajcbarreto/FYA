import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "@/lib/records/validation";
export const metadata = { robots: { index: false, follow: false } };
export default async function DossierPage({
  params,
}: {
  params: Promise<{ locale: string; shareId: string }>;
}) {
  const { locale, shareId } = await params;
  if (!isLocale(locale) || !validId(shareId)) notFound();
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user)
    redirect(
      `/${locale}/auth/login?next=${encodeURIComponent(`/dossier/${shareId}`)}`,
    );
  const { data: share, error } = await supabase
    .from("document_shares")
    .select("*")
    .eq("id", shareId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("Unable to load dossier");
  const pt = locale === "pt";
  if (!share)
    return (
      <main id="main-content" className="mx-auto max-w-2xl p-8">
        <h1 className="text-3xl font-bold">
          {pt ? "Dossier indisponível" : "Dossier unavailable"}
        </h1>
        <p>
          {pt
            ? "Confirma que entraste com o email que recebeu a partilha. O acesso pode ter expirado ou sido revogado; contacta o canil."
            : "Sign in with the email that received the share. Access may have expired or been revoked; contact the shelter."}
        </p>
      </main>
    );
  const { data: docs, error: docsError } = await supabase
    .from("animal_documents")
    .select("id,title,category,size_bytes")
    .in("id", share.document_ids)
    .eq("shareable", true);
  if (docsError) throw new Error("Unable to load documents");
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl space-y-6 p-8">
      <header>
        <p>
          {pt ? "FYA · Documentação de adoção" : "FYA · Adoption documents"}
        </p>
        <h1 className="page-title">
          {pt ? "O dossier do teu animal" : "Your animal’s dossier"}
        </h1>
        <p>
          {pt ? "Disponível até" : "Available until"}{" "}
          {new Date(share.expires_at).toLocaleDateString(locale)}
        </p>
      </header>
      {share.handover_notes && (
        <section className="rounded-2xl bg-card p-6">
          <h2 className="font-bold">
            {pt ? "Informação para a família" : "Information for the family"}
          </h2>
          <p className="whitespace-pre-wrap">{share.handover_notes}</p>
        </section>
      )}
      <section className="space-y-3">
        {docs?.map((d) => (
          <a
            className="block rounded-2xl border border-border p-5 hover:bg-muted"
            key={d.id}
            href={`/api/documents/${d.id}`}
          >
            <strong>{d.title}</strong>
            <p>
              {Math.ceil(d.size_bytes / 1024)} KB ·{" "}
              {pt ? "Descarregar" : "Download"}
            </p>
          </a>
        ))}
      </section>
    </main>
  );
}
