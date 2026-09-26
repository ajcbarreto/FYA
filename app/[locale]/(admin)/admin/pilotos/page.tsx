import { notFound, redirect } from "next/navigation";
import { recordsContext } from "@/lib/records/context";
import { updatePilot } from "@/app/records/pilot-actions";
import { SubmitButton } from "@/components/submit-button";
import { ListPagination } from "@/components/list-pagination";
import { loadPaginatedData } from "@/lib/pagination";
export default async function Pilots({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; success?: string; error?: string }>;
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
  const result = await loadPaginatedData({
    requestedPage: search.page,
    pageSize: 25,
    count: async () => {
      const { error, count } = await c.supabase
        .from("pilot_requests")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    load: async (page) => {
      const { error, data } = await c.supabase
        .from("pilot_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id")
        .range((page - 1) * 25, page * 25 - 1);
      if (error) throw error;
      return data ?? [];
    },
  });
  if (result.redirectPage !== null)
    redirect(`/${locale}/admin/pilotos?page=${result.redirectPage}`);
  return (
    <main id="main-content" className="space-y-5">
      <h1 className="page-title">
        {pt ? "Pedidos de piloto" : "Pilot requests"}
      </h1>
      <p>
        {pt
          ? "Regista o acompanhamento do contacto. Alterar o estado não envia emails."
          : "Record contact follow-up. Changing status does not send emails."}
      </p>
      {search.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {search.error && (
        <p role="alert">
          {pt ? "Não foi possível guardar." : "Could not save."}
        </p>
      )}
      {!result.items.length && (
        <p>{pt ? "Ainda não há pedidos." : "No requests yet."}</p>
      )}
      {result.items.map((r) => (
        <form
          key={r.id}
          action={updatePilot}
          className="space-y-3 rounded-2xl border bg-card p-5"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="requestId" value={r.id} />
          <h2 className="text-xl font-bold">{r.organization}</h2>
          <p>
            {r.contact_name} · {r.location}
          </p>
          <p className="break-all">{r.email}</p>
          <p className="text-sm">
            {new Date(r.created_at).toLocaleString(locale)}
          </p>
          <p className="whitespace-pre-wrap">{r.message}</p>
          <label className="block">
            {pt ? "Estado" : "Status"}
            <select
              name="status"
              defaultValue={r.status}
              className="block w-full rounded-lg border bg-background p-2"
            >
              {[
                ["new", pt ? "Novo" : "New"],
                ["contacted", pt ? "Contactado" : "Contacted"],
                ["accepted", pt ? "Aceite" : "Accepted"],
                ["closed", pt ? "Fechado" : "Closed"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            {pt ? "Notas internas" : "Internal notes"}
            <textarea
              name="notes"
              maxLength={4000}
              defaultValue={r.internal_notes}
              className="block w-full rounded-lg border bg-background p-2"
            />
          </label>
          <SubmitButton className="rounded-full bg-primary px-4 py-2 text-primary-foreground">
            {pt ? "Guardar acompanhamento" : "Save follow-up"}
          </SubmitButton>
        </form>
      ))}
      <ListPagination
        page={result.page}
        total={result.total}
        base={`/${locale}/admin/pilotos`}
        locale={locale}
      />
    </main>
  );
}
