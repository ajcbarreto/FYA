import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForOwner } from "@/lib/adoption/db";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { RequestCard } from "@/components/request-card";

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

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-border/25 bg-card px-6 py-8 text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              visits={visitsByPedido.get(request.id) ?? []}
              locale={locale}
              audience="owner"
              copy={{
                questionnaireVisits: sharedCopy.questionnaireVisits,
                notePlaceholder: sharedCopy.notePlaceholder,
                save: sharedCopy.save,
                statuses: sharedCopy.statuses,
              }}
            />
          ))}
        </div>
      )}

      <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">{sharedCopy.hint}</p>
    </main>
  );
}
