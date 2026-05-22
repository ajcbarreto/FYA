import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { Check, Send } from "lucide-react";
import { getAdoptionRequestsForUser, getRowAnimal, getRowCanil, localizeRequestStatus } from "@/lib/adoption/db";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { ToastFeedback } from "@/components/toast-feedback";
import { VisitPanel } from "@/components/visit-panel";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";

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
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      {requests.length === 0 ? (
        <PageEmpty title={copy.empty} icon={Send} />
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => {
            const canPropose = request.status !== "rejeitado" && request.status !== "concluido";
            const animal = getRowAnimal(request);
            const canil = getRowCanil(request);
            const formattedDate = new Intl.DateTimeFormat(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(request.created_at));
            const positiveStatuses = ["pendente", "entrevista", "aprovado", "concluido"] as const;
            const isRejected = request.status === "rejeitado";
            const currentIndex = positiveStatuses.indexOf(
              request.status as (typeof positiveStatuses)[number],
            );

            return (
              <li key={request.id} className="rounded-2xl border border-border/25 bg-card p-5">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{animal?.nome ?? "-"}</h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {canil?.nome ?? "-"} • {formattedDate}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      isRejected
                        ? "bg-destructive/10 text-destructive"
                        : request.status === "aprovado" || request.status === "concluido"
                          ? "bg-secondary/15 text-secondary"
                          : request.status === "entrevista"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {localizeRequestStatus(request.status, locale)}
                  </span>
                </header>

                {isRejected ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                    {copy.statusLabels.rejeitado}
                  </p>
                ) : (
                  <ol className="mt-3 flex items-stretch gap-1 text-[10px] font-semibold">
                    {positiveStatuses.map((step, index) => {
                      const done = index < currentIndex;
                      const current = index === currentIndex;
                      const isLast = index === positiveStatuses.length - 1;
                      return (
                        <li key={step} className="flex flex-1 flex-col">
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                                done
                                  ? "bg-secondary text-secondary-foreground"
                                  : current
                                    ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {done ? <Check className="h-2.5 w-2.5" /> : index + 1}
                            </span>
                            {!isLast && (
                              <span className={`h-px flex-1 ${done ? "bg-secondary" : "bg-border/40"}`} aria-hidden />
                            )}
                          </div>
                          <span
                            className={`mt-1 truncate ${
                              done ? "text-secondary" : current ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {copy.statusLabels[step]}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">{copy.columnNotes}: </span>
                  {request.observacoes_canil ?? copy.noShelterNotes}
                </p>

                <details className="mt-4 text-xs text-muted-foreground">
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
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
