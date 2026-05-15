import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
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
  const copy =
    locale === "pt"
      ? {
          title: "Meus Pedidos de Adocao",
          subtitle: "Acompanha o estado das tuas candidaturas.",
          columns: {
            pet: "Pet e Canil",
            status: "Estado",
            date: "Data",
            notes: "Notas do Canil",
          },
          empty: "Ainda nao tens pedidos. Visita o catalogo e candidata-te a um pet.",
          visitsLabel: "Visitas",
          success: {
            request_created: "Candidatura enviada com sucesso.",
            visit_proposed: "Visita proposta. Aguarda confirmacao do canil.",
            visit_updated: "Visita atualizada.",
          } as Record<string, string>,
          errors: {
            request_failed: "Nao foi possivel submeter candidatura.",
            invalid_visit: "Dados de visita invalidos.",
            visit_in_past: "Escolhe uma data no futuro.",
            visit_not_allowed: "Nao e possivel agendar visita para este pedido.",
            visit_failed: "Nao foi possivel agendar a visita.",
          } as Record<string, string>,
        }
      : {
          title: "My Adoption Requests",
          subtitle: "Track the status of your submitted applications.",
          columns: {
            pet: "Pet and Shelter",
            status: "Status",
            date: "Date",
            notes: "Shelter notes",
          },
          empty: "You have not submitted requests yet. Visit the pet catalog to apply.",
          visitsLabel: "Visits",
          success: {
            request_created: "Application submitted successfully.",
            visit_proposed: "Visit proposed. Waiting for the shelter to confirm.",
            visit_updated: "Visit updated.",
          } as Record<string, string>,
          errors: {
            request_failed: "Could not submit request.",
            invalid_visit: "Invalid visit data.",
            visit_in_past: "Pick a date in the future.",
            visit_not_allowed: "You cannot schedule a visit for this request.",
            visit_failed: "Could not schedule the visit.",
          } as Record<string, string>,
        };

  const feedback =
    (success && copy.success[success]) || (error && copy.errors[error]) || null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.columns.pet}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.status}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.date}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.notes}</th>
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
                        {request.observacoes_canil ?? (locale === "pt" ? "Sem notas do canil." : "No notes from shelter.")}
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
