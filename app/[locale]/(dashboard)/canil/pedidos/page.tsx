import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";

type CanilRequestsPageProps = {
  params: Promise<{ locale: string }>;
};

type MockRequestStatus = "pending" | "interview" | "approved";

const requestNames = ["Sarah Mitchell", "James Wilson", "Emily Chen", "Michael Scott", "Ana Souza", "Ricardo Silva"];

export default async function CanilRequestsPage({ params }: CanilRequestsPageProps) {
  const { locale } = await params;

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

  const { animals } = await getShelterForUser(supabase, user.id);
  const copy =
    locale === "pt"
      ? {
          title: "Pedidos de Adocao",
          subtitle: "Fila de candidaturas recebidas para os teus animais.",
          columns: {
            applicant: "Candidato e Pet",
            date: "Submissao",
            status: "Estado",
            actions: "Acoes",
          },
          empty: "Sem pedidos no momento. Quando chegares novos pedidos, eles vao aparecer aqui.",
          action: "Rever candidatura",
          statuses: {
            pending: "Pendente",
            interview: "Entrevista agendada",
            approved: "Aprovado",
          },
          hint: "Nota: enquanto o modulo completo de candidaturas nao e ligado ao backend, esta lista e gerada automaticamente a partir dos animais do canil.",
        }
      : {
          title: "Adoption Requests",
          subtitle: "Queue of applications received for your pets.",
          columns: {
            applicant: "Applicant & Pet",
            date: "Submission",
            status: "Status",
            actions: "Actions",
          },
          empty: "No requests right now. New requests will show up here.",
          action: "Review application",
          statuses: {
            pending: "Pending",
            interview: "Interview scheduled",
            approved: "Approved",
          },
          hint: "Note: until the full applications module is connected to backend data, this list is generated from shelter pets.",
        };

  const requests = animals.slice(0, 6).map((animal, index) => {
    const statusCycle: MockRequestStatus[] = ["pending", "interview", "approved"];
    const status = statusCycle[index % statusCycle.length];

    return {
      id: `${animal.id}-${index}`,
      applicant: requestNames[index % requestNames.length],
      petName: animal.nome,
      submittedAt: new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
        new Date(animal.created_at),
      ),
      status,
    };
  });

  const statusClass: Record<MockRequestStatus, string> = {
    pending: "bg-muted text-muted-foreground",
    interview: "bg-accent/30 text-accent-foreground",
    approved: "bg-secondary/20 text-secondary",
  };

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.columns.applicant}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.date}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.status}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-border/15">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{request.applicant}</p>
                      <p className="text-xs text-muted-foreground">
                        {locale === "pt" ? "Interesse em" : "Interested in"} {request.petName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">{request.submittedAt}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[request.status]}`}>
                        {copy.statuses[request.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                        {copy.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">{copy.hint}</p>
    </main>
  );
}
