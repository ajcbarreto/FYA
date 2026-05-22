import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getAdoptionRequestsForCanil } from "@/lib/adoption/db";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { RequestCard } from "@/components/request-card";

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

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-border/25 bg-card px-6 py-8 text-sm text-muted-foreground">
          {copy.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              visits={visitsByPedido.get(request.id) ?? []}
              locale={locale}
              audience="canil"
              copy={{
                questionnaireVisits: copy.questionnaireVisits,
                notePlaceholder: copy.notePlaceholder,
                save: copy.save,
                statuses: copy.statuses,
              }}
            />
          ))}
        </div>
      )}

      <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">{copy.hint}</p>
    </main>
  );
}
