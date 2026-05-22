import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getAdoptionRequestsForCanil, getRowAnimal, localizeRequestStatus, mapRequestApplicantName } from "@/lib/adoption/db";
import { updateRequestStatus } from "@/app/adoption/actions";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { AdoptionAnswers } from "@/components/adoption-answers";
import { ToastFeedback } from "@/components/toast-feedback";
import { VisitPanel } from "@/components/visit-panel";
import { PageHeader } from "@/components/page-header";

type CanilRequestsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CanilRequestsPage({ params, searchParams }: CanilRequestsPageProps) {
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
    redirect(`/${locale}/auth/login?next=/canil/pedidos`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil?error=no_shelter`);
  }

  const requests = await getAdoptionRequestsForCanil(supabase, shelter.id);
  const visitsByPedido = await getVisitsByPedido(
    supabase,
    requests.map((request) => request.id),
  );
  const copy = getDictionary(locale).canilRequestsPage;
  const feedback =
    (success && copy.successMessages[success]) ||
    (error && copy.errorMessages[error]) ||
    null;

  return (
    <main className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.columnApplicant}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnDate}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnStatus}</th>
                  <th className="px-6 py-4 font-bold">{copy.columnActions}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-border/15 align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{mapRequestApplicantName(request, locale)}</p>
                      <p className="text-xs text-muted-foreground">{getRowAnimal(request)?.nome ?? "-"}</p>
                      <details className="mt-3 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-semibold text-primary">
                          {copy.questionnaireVisits}
                        </summary>
                        <div className="mt-2 space-y-2">
                          {request.mensagem_inicial && (
                            <p className="rounded-xl bg-muted px-3 py-2 italic">{request.mensagem_inicial}</p>
                          )}
                          <AdoptionAnswers answers={request.respostas} locale={locale} />
                          <VisitPanel
                            locale={locale}
                            pedidoId={request.id}
                            visits={visitsByPedido.get(request.id) ?? []}
                            audience="canil"
                          />
                        </div>
                      </details>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
                        new Date(request.created_at),
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                        {localizeRequestStatus(request.status, locale)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <form action={updateRequestStatus} className="space-y-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="requestId" value={request.id} />
                        <select
                          name="status"
                          defaultValue={request.status}
                          className="h-9 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="pendente">{copy.statuses.pendente}</option>
                          <option value="entrevista">{copy.statuses.entrevista}</option>
                          <option value="aprovado">{copy.statuses.aprovado}</option>
                          <option value="concluido">{copy.statuses.concluido}</option>
                          <option value="rejeitado">{copy.statuses.rejeitado}</option>
                        </select>
                        <input
                          name="notes"
                          defaultValue={request.observacoes_canil ?? ""}
                          placeholder={copy.notePlaceholder}
                          className="h-9 w-full rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                          {copy.save}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">{copy.hint}</p>
    </main>
  );
}
