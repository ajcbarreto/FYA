import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, HeartHandshake, PawPrint, ClipboardList, ShieldAlert, UserPlus, Users, ArrowRight } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdminMetrics } from "@/lib/admin/metrics";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const metrics = await getAdminMetrics(supabase);

  const copy =
    locale === "pt"
      ? {
          title: "Visao geral da plataforma",
          subtitle: "Indicadores principais da FYA num so lugar.",
          cards: {
            adoptions: "Adocoes concluidas",
            pending: "Pedidos pendentes",
            requests: "Total de pedidos",
            sheltersPending: "Canis por verificar",
            shelters: "Canis registados",
            users: "Utilizadores",
            newUsers: "Novos esta semana",
            animals: "Animais na plataforma",
            available: "Animais disponiveis",
          },
          attentionTitle: "Precisa de atencao",
          attentionVerify: (count: number) =>
            count === 1 ? "1 canil aguarda verificacao." : `${count} canis aguardam verificacao.`,
          attentionRequests: (count: number) =>
            count === 1 ? "1 pedido de adocao pendente na plataforma." : `${count} pedidos de adocao pendentes na plataforma.`,
          allClear: "Tudo em dia. Sem itens pendentes.",
          quickTitle: "Acessos rapidos",
          quick: {
            shelters: "Gerir canis",
            users: "Ver utilizadores",
            settings: "Configuracoes da plataforma",
          },
        }
      : {
          title: "Platform overview",
          subtitle: "FYA's key indicators in one place.",
          cards: {
            adoptions: "Completed adoptions",
            pending: "Pending requests",
            requests: "Total requests",
            sheltersPending: "Shelters to verify",
            shelters: "Registered shelters",
            users: "Users",
            newUsers: "New this week",
            animals: "Animals on platform",
            available: "Available animals",
          },
          attentionTitle: "Needs attention",
          attentionVerify: (count: number) =>
            count === 1 ? "1 shelter is awaiting verification." : `${count} shelters are awaiting verification.`,
          attentionRequests: (count: number) =>
            count === 1 ? "1 adoption request pending platform-wide." : `${count} adoption requests pending platform-wide.`,
          allClear: "All caught up. No pending items.",
          quickTitle: "Quick links",
          quick: {
            shelters: "Manage shelters",
            users: "View users",
            settings: "Platform settings",
          },
        };

  const cards = [
    { label: copy.cards.adoptions, value: metrics.adoptionsCompleted, icon: HeartHandshake, accent: "text-secondary" },
    { label: copy.cards.pending, value: metrics.pendingRequests, icon: ClipboardList, accent: "text-primary" },
    { label: copy.cards.sheltersPending, value: metrics.sheltersPending, icon: ShieldAlert, accent: "text-destructive" },
    { label: copy.cards.newUsers, value: metrics.newUsersThisWeek, icon: UserPlus, accent: "text-primary" },
    { label: copy.cards.shelters, value: metrics.sheltersTotal, icon: Building2, accent: "text-foreground" },
    { label: copy.cards.users, value: metrics.usersTotal, icon: Users, accent: "text-foreground" },
    { label: copy.cards.animals, value: metrics.animalsTotal, icon: PawPrint, accent: "text-foreground" },
    { label: copy.cards.available, value: metrics.animalsAvailable, icon: PawPrint, accent: "text-secondary" },
  ];

  const attentionItems = [
    metrics.sheltersPending > 0
      ? { text: copy.attentionVerify(metrics.sheltersPending), href: `/${locale}/admin/canis` }
      : null,
    metrics.pendingRequests > 0
      ? { text: copy.attentionRequests(metrics.pendingRequests), href: null }
      : null,
  ].filter((value): value is { text: string; href: string | null } => value !== null);

  const quickLinks = [
    { href: `/${locale}/admin/canis`, label: copy.quick.shelters, icon: Building2 },
    { href: `/${locale}/admin/utilizadores`, label: copy.quick.users, icon: Users },
    { href: `/${locale}/admin/configuracoes`, label: copy.quick.settings, icon: ClipboardList },
  ];

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-border/20 bg-card p-5">
              <div className="mb-3 inline-flex rounded-full bg-muted p-2.5 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <h2 className="text-lg font-bold">{copy.attentionTitle}</h2>
          {attentionItems.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">{copy.allClear}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {attentionItems.map((item) => (
                <li key={item.text} className="rounded-2xl border border-border/20 px-4 py-3 text-sm">
                  {item.href ? (
                    <Link href={item.href} className="flex items-center justify-between gap-3 font-medium hover:text-primary">
                      {item.text}
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  ) : (
                    <span className="font-medium">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-3xl border border-border/20 bg-card p-6">
          <h2 className="text-lg font-bold">{copy.quickTitle}</h2>
          <div className="mt-3 space-y-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-2xl border border-border/20 px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
