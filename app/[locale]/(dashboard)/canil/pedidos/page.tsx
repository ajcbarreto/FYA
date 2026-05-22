import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getAdoptionRequestsForCanil } from "@/lib/adoption/db";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";
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
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          requests.length > 0 && (
            <Link
              href={`/${locale}/canil/pedidos/export`}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              {copy.exportCsv}
            </Link>
          )
        }
      />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      {requests.length === 0 ? (
        <PageEmpty title={copy.empty} icon={Inbox} />
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
