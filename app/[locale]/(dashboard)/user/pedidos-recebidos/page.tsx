import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import {
  getAdoptionRequestsForOwner,
  getRowAnimal,
  localizeRequestStatus,
  mapRequestApplicantName,
} from "@/lib/adoption/db";
import { updateRequestStatus } from "@/app/adoption/actions";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { AdoptionAnswers } from "@/components/adoption-answers";
import { ToastFeedback } from "@/components/toast-feedback";
import { VisitPanel } from "@/components/visit-panel";
import { PageHeader } from "@/components/page-header";

type UserReceivedRequestsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function UserReceivedRequestsPage({
  params,
  searchParams,
}: UserReceivedRequestsPageProps) {
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
    redirect(`/${locale}/auth/login?next=/user/pedidos-recebidos`);
  }

  const requests = await getAdoptionRequestsForOwner(supabase, user.id);
  const visitsByPedido = await getVisitsByPedido(
    supabase,
    requests.map((request) => request.id),
  );

  const dict = getDictionary(locale);
  const t = dict.userReceivedRequests;
  const sharedCopy = dict.canilRequestsPage;
  const feedback =
    (success && sharedCopy.successMessages[success]) ||
    (error && sharedCopy.errorMessages[error]) ||
    null;

  return (
    <main className="space-y-6">
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{sharedCopy.columnApplicant}</th>
                  <th className="px-6 py-4 font-bold">{sharedCopy.columnDate}</th>
                  <th className="px-6 py-4 font-bold">{sharedCopy.columnStatus}</th>
                  <th className="px-6 py-4 font-bold">{sharedCopy.columnActions}</th>
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
                          {sharedCopy.questionnaireVisits}
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
                        <input type="hidden" name="audience" value="owner" />
                        <select
                          name="status"
                          defaultValue={request.status}
                          className="h-9 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="pendente">{sharedCopy.statuses.pendente}</option>
                          <option value="entrevista">{sharedCopy.statuses.entrevista}</option>
                          <option value="aprovado">{sharedCopy.statuses.aprovado}</option>
                          <option value="concluido">{sharedCopy.statuses.concluido}</option>
                          <option value="rejeitado">{sharedCopy.statuses.rejeitado}</option>
                        </select>
                        <input
                          name="notes"
                          defaultValue={request.observacoes_canil ?? ""}
                          placeholder={sharedCopy.notePlaceholder}
                          className="h-9 w-full rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                          {sharedCopy.save}
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

      <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">{sharedCopy.hint}</p>
    </main>
  );
}
