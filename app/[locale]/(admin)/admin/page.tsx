import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ClipboardList, Users, ArrowRight } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

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

  const copy = getDictionary(locale).adminDashboard;

  const cards: Array<{ label: string; value: number; tone?: "default" | "primary" | "secondary" | "destructive" }> = [
    { label: copy.cardAdoptions, value: metrics.adoptionsCompleted, tone: "secondary" },
    { label: copy.cardPending, value: metrics.pendingRequests, tone: "primary" },
    { label: copy.cardSheltersPending, value: metrics.sheltersPending, tone: "destructive" },
    { label: copy.cardNewUsers, value: metrics.newUsersThisWeek, tone: "primary" },
    { label: copy.cardShelters, value: metrics.sheltersTotal },
    { label: copy.cardUsers, value: metrics.usersTotal },
    { label: copy.cardAnimals, value: metrics.animalsTotal },
    { label: copy.cardAvailable, value: metrics.animalsAvailable, tone: "secondary" },
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
    { href: `/${locale}/admin/canis`, label: copy.quickShelters, icon: Building2 },
    { href: `/${locale}/admin/utilizadores`, label: copy.quickUsers, icon: Users },
    { href: `/${locale}/admin/configuracoes`, label: copy.quickSettings, icon: ClipboardList },
  ];

  return (
    <main className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/25 bg-card p-6">
          <h2 className="text-lg font-bold">{copy.attentionTitle}</h2>
          {attentionItems.length === 0 ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">
              {copy.allClear}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {attentionItems.map((item) => (
                <li key={item.text}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/25 px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/60"
                    >
                      {item.text}
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ) : (
                    <span className="block rounded-xl border border-border/25 px-3 py-2.5 text-sm font-medium">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-border/25 bg-card p-6">
          <h2 className="text-lg font-bold">{copy.quickTitle}</h2>
          <div className="mt-4 space-y-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-border/25 px-3 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-muted/60"
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
