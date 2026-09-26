import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
import { cancelPledge } from "@/app/support/actions";
import { SubmitButton } from "@/components/submit-button";
export default async function MySupport({
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
  const { data, error } = await c.supabase
    .from("support_pledges")
    .select("*,support_projects(title,unit)")
    .eq("profile_id", c.user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load promises");
  return (
    <main id="main-content" className="page-shell max-w-3xl space-y-5">
      <h1 className="page-title">
        {pt ? "As minhas promessas de ajuda" : "My support promises"}
      </h1>
      <p>
        {pt
          ? "Últimas 100 promessas. Só o canil pode confirmar a receção."
          : "Latest 100 promises. Only the shelter can confirm receipt."}
      </p>
      {search.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {search.error && (
        <p role="alert">
          {pt ? "Não foi possível guardar." : "Could not save."}
        </p>
      )}
      {!data?.length && (
        <p>
          {pt
            ? "Ainda não tens promessas registadas."
            : "No recorded promises yet."}
        </p>
      )}
      {data?.map((r) => (
        <article key={r.id} className="space-y-3 rounded-2xl border p-5">
          <h2 className="font-bold">
            {r.support_projects?.title ??
              (pt ? "Apoio já não publicado" : "Support no longer published")}
          </h2>
          <p>
            {r.quantity} {r.support_projects?.unit ?? ""} ·{" "}
            {r.status === "pending"
              ? pt
                ? "Por entregar"
                : "Awaiting delivery"
              : r.status === "received"
                ? pt
                  ? "Receção confirmada"
                  : "Receipt confirmed"
                : pt
                  ? "Cancelada"
                  : "Cancelled"}
          </p>
          <p className="whitespace-pre-wrap">{r.message}</p>
          {r.support_projects && (
            <Link
              className="inline-block underline"
              href={`/${locale}/apoios/${r.project_id}`}
            >
              {pt ? "Ver apoio e contactos" : "View support and contacts"}
            </Link>
          )}
          {r.status === "pending" && (
            <form action={cancelPledge}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="pledgeId" value={r.id} />
              <SubmitButton className="underline">
                {pt ? "Cancelar promessa" : "Cancel promise"}
              </SubmitButton>
            </form>
          )}
        </article>
      ))}
    </main>
  );
}
