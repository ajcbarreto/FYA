import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForUser, getRowAnimal, getRowCanil, localizeRequestStatus } from "@/lib/adoption/db";
import { ToastFeedback } from "@/components/toast-feedback";

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
          success: "Candidatura enviada com sucesso.",
          errors: {
            request_failed: "Nao foi possivel submeter candidatura.",
          },
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
          success: "Application submitted successfully.",
          errors: {
            request_failed: "Could not submit request.",
          },
        };

  const feedback =
    success === "request_created"
      ? copy.success
      : error && copy.errors[error as keyof typeof copy.errors]
        ? copy.errors[error as keyof typeof copy.errors]
        : null;

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
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-border/15">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{getRowAnimal(request)?.nome ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{getRowCanil(request)?.nome ?? "-"}</p>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
