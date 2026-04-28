import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Bell, CalendarClock, ClipboardList, HeartHandshake, MessageCircle, PawPrint } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser, localizeAnimalStatus, localizeSpecies, type ShelterAnimalRecord } from "@/lib/canil/shelter-data";

type CanilDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CanilDashboardPage({ params }: CanilDashboardPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil`);
  }

  const { shelter, animals } = await getShelterForUser(supabase, user.id);
  const copy =
    locale === "pt"
      ? {
          title: "Dashboard do Canil",
          subtitle: "Visao geral operacional do teu canil na FYA (Found Your Animal).",
          welcomePrefix: "Bem-vindo de volta,",
          cards: {
            totalPets: "Total de pets",
            available: "Disponiveis",
            pending: "Pendentes",
            adopted: "Adotados",
          },
          sections: {
            activity: "Atividade Recente",
            tasks: "Tarefas Prioritarias",
          },
          actions: {
            viewAllPets: "Ver todos os pets",
            openRequests: "Abrir pedidos de adocao",
            messages: "Ir para mensagens",
          },
          emptyActivity: "Ainda nao ha atividade registada para este canil.",
          tasks: [
            "Responder aos novos pedidos pendentes",
            "Atualizar fotos dos animais com mais visualizacoes",
            "Validar disponibilidade para visitas desta semana",
          ],
        }
      : {
          title: "Shelter Dashboard",
          subtitle: "Operational overview of your shelter inside FYA (Found Your Animal).",
          welcomePrefix: "Welcome back,",
          cards: {
            totalPets: "Total pets",
            available: "Available",
            pending: "Pending",
            adopted: "Adopted",
          },
          sections: {
            activity: "Recent Activity",
            tasks: "Priority Tasks",
          },
          actions: {
            viewAllPets: "View all pets",
            openRequests: "Open adoption requests",
            messages: "Go to messages",
          },
          emptyActivity: "There is no recorded activity for this shelter yet.",
          tasks: [
            "Reply to new pending requests",
            "Refresh photos for the most viewed pets",
            "Confirm this week's in-person visit availability",
          ],
        };

  const stats = {
    total: animals.length,
    available: animals.filter((animal) => animal.status.toLowerCase() === "disponivel").length,
    pending: animals.filter((animal) => ["reservado", "em_tratamento"].includes(animal.status.toLowerCase())).length,
    adopted: animals.filter((animal) => animal.status.toLowerCase() === "adotado").length,
  };

  const recentActivity = animals.slice(0, 4).map((animal) => ({
    ...animal,
    statusLabel: localizeAnimalStatus(animal.status, locale),
  }));

  const statusPillClass = (animal: ShelterAnimalRecord) => {
    const normalized = animal.status.toLowerCase();
    if (normalized === "disponivel") return "bg-secondary/20 text-secondary";
    if (normalized === "adotado") return "bg-primary/15 text-primary";
    if (normalized === "reservado") return "bg-accent/20 text-accent-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <main className="space-y-8">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{copy.title}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
          {copy.welcomePrefix} {shelter?.nome ?? "FYA Shelter"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <div className="mb-4 inline-flex rounded-full bg-primary/15 p-3 text-primary">
            <PawPrint className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{copy.cards.totalPets}</p>
          <p className="mt-1 text-3xl font-black">{stats.total}</p>
        </article>
        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <div className="mb-4 inline-flex rounded-full bg-secondary/15 p-3 text-secondary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{copy.cards.available}</p>
          <p className="mt-1 text-3xl font-black">{stats.available}</p>
        </article>
        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <div className="mb-4 inline-flex rounded-full bg-accent/25 p-3 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{copy.cards.pending}</p>
          <p className="mt-1 text-3xl font-black">{stats.pending}</p>
        </article>
        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <div className="mb-4 inline-flex rounded-full bg-primary/15 p-3 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{copy.cards.adopted}</p>
          <p className="mt-1 text-3xl font-black">{stats.adopted}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-border/20 bg-card p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">{copy.sections.activity}</h2>
            <Link href={`/${locale}/canil/animais`} className="text-sm font-bold text-primary hover:underline">
              {copy.actions.viewAllPets}
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="rounded-2xl bg-muted px-4 py-5 text-sm text-muted-foreground">{copy.emptyActivity}</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((animal) => (
                <div key={animal.id} className="flex items-center justify-between rounded-2xl border border-border/20 px-4 py-3">
                  <div>
                    <p className="font-semibold">{animal.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {(animal.raca ?? localizeSpecies(animal.especie, locale)).replaceAll("_", " ")}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPillClass(animal)}`}>{animal.statusLabel}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <h2 className="text-xl font-bold">{copy.sections.tasks}</h2>
          <ul className="mt-5 space-y-3">
            {copy.tasks.map((task) => (
              <li key={task} className="flex items-start gap-3 text-sm">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            <Link
              href={`/${locale}/canil/pedidos`}
              className="block rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
            >
              {copy.actions.openRequests}
            </Link>
            <Link
              href={`/${locale}/canil/mensagens`}
              className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-primary hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              {copy.actions.messages}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
