import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForUser, getRowAnimal, getRowCanil, localizeRequestStatus } from "@/lib/adoption/db";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { ToastFeedback } from "@/components/toast-feedback";
import { VisitPanel } from "@/components/visit-panel";

type UserRequestsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function UserRequestsPage({ params, searchParams }: UserRequestsPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/pedidos`);
  }

  const requests = await getAdoptionRequestsForUser(supabase, user.id);
  const visitsByPedido = await getVisitsByPedido(
    supabase,
    requests.map((request) => request.id),
  );
  const copy = getDictionary(locale).userRequestsPage;
  const feedback =
    (success && copy.successMessages[success]) ||
    (error && copy.errorMessages[error]) ||
    null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.columnPet}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnStatus}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnDate}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnNotes}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const canPropose = request.status !== "rejeitado" && request.status !== "concluido";
                  return (
                    <tr key={request.id} className="border-t border-border/15 align-top">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{getRowAnimal(request)?.nome ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">{getRowCanil(request)?.nome ?? "-"}</p>
                        <details className="mt-3 text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-semibold text-primary">{copy.visitsLabel}</summary>
                          <div className="mt-2">
                            <VisitPanel
                              locale={locale}
                              pedidoId={request.id}
                              visits={visitsByPedido.get(request.id) ?? []}
                              audience="user"
                              canPropose={canPropose}
                            />
                          </div>
                        </details>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{localizeRequestStatus(request.status, locale)}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
                          new Date(request.created_at),
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {request.observacoes_canil ?? copy.noShelterNotes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
