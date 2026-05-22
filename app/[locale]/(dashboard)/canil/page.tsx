import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, CheckCircle2, Circle, MessageCircle, Sparkles } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser, localizeAnimalStatus, localizeSpecies, type ShelterAnimalRecord } from "@/lib/canil/shelter-data";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

type CanilDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

type ActionItem = { id: string; label: string; href: string };

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
  const copy = getDictionary(locale).canilDashboard;

  const stats = {
    total: animals.length,
    available: animals.filter((animal) => animal.status.toLowerCase() === "disponivel").length,
    pending: animals.filter((animal) => ["reservado", "em_tratamento"].includes(animal.status.toLowerCase())).length,
    adopted: animals.filter((animal) => animal.status.toLowerCase() === "adotado").length,
  };

  const animalIds = animals.map((animal) => animal.id);
  const [pendingRequestsResult, pendingReviewsResult, primaryPhotoRows] = shelter
    ? await Promise.all([
        supabase
          .from("pedidos_adocao")
          .select("id", { count: "exact", head: true })
          .eq("canil_id", shelter.id)
          .in("status", ["pendente", "entrevista"]),
        supabase
          .from("avaliacoes_canil")
          .select("id", { count: "exact", head: true })
          .eq("canil_id", shelter.id)
          .eq("estado", "pendente"),
        animalIds.length > 0
          ? supabase
              .from("animal_fotos")
              .select("animal_id")
              .in("animal_id", animalIds)
              .eq("is_primary", true)
          : Promise.resolve({ data: [] as { animal_id: string }[] }),
      ])
    : [{ count: 0 }, { count: 0 }, { data: [] as { animal_id: string }[] }];

  const pendingRequestsCount = pendingRequestsResult.count ?? 0;
  const reviewsToModerate = pendingReviewsResult.count ?? 0;
  const animalsWithPrimaryPhoto = new Set(
    (primaryPhotoRows.data ?? []).map((row) => row.animal_id),
  );
  const missingPhotosCount = animals.filter(
    (animal) => animal.status.toLowerCase() !== "adotado" && !animalsWithPrimaryPhoto.has(animal.id),
  ).length;
  const profileIncomplete = Boolean(
    shelter && (!shelter.telefone || !shelter.missao || !shelter.email_contacto),
  );
  const hasVisitHours = Boolean(shelter?.horario_visitas);
  const hasDonationInfo = Boolean(shelter?.iban || shelter?.mbway || shelter?.donation_link);

  const onboardingSteps = shelter
    ? [
        {
          id: "profile",
          label: copy.onboarding.steps.profile,
          done: !profileIncomplete && hasVisitHours,
          href: `/${locale}/canil/configuracoes`,
        },
        {
          id: "firstPet",
          label: copy.onboarding.steps.firstPet,
          done: animals.length > 0,
          href: `/${locale}/canil/animais/novo`,
        },
        {
          id: "firstPhoto",
          label: copy.onboarding.steps.firstPhoto,
          done: animals.length > 0 && animalsWithPrimaryPhoto.size > 0,
          href: `/${locale}/canil/animais`,
        },
        {
          id: "donations",
          label: copy.onboarding.steps.donations,
          done: hasDonationInfo,
          href: `/${locale}/canil/configuracoes`,
        },
        {
          id: "verification",
          label: copy.onboarding.steps.verification,
          done: Boolean(shelter.verificado),
          href: null as string | null,
        },
      ]
    : [];
  const onboardingDone = onboardingSteps.filter((step) => step.done).length;
  const showOnboarding = onboardingSteps.length > 0 && onboardingDone < onboardingSteps.length;

  const actionItems: ActionItem[] = [];
  if (pendingRequestsCount > 0) {
    actionItems.push({
      id: "pending-requests",
      label: copy.actionPendingRequests(pendingRequestsCount),
      href: `/${locale}/canil/pedidos`,
    });
  }
  if (reviewsToModerate > 0) {
    actionItems.push({
      id: "reviews-pending",
      label: copy.actionReviewsToModerate(reviewsToModerate),
      href: `/${locale}/canil/avaliacoes`,
    });
  }
  if (missingPhotosCount > 0) {
    actionItems.push({
      id: "missing-photos",
      label: copy.actionMissingPhotos(missingPhotosCount),
      href: `/${locale}/canil/animais`,
    });
  }
  if (profileIncomplete) {
    actionItems.push({
      id: "profile-incomplete",
      label: copy.actionProfileIncomplete,
      href: `/${locale}/canil/configuracoes`,
    });
  }

  const recentActivity = animals.slice(0, 4).map((animal) => ({
    ...animal,
    statusLabel: localizeAnimalStatus(animal.status, locale),
  }));

  const statusPillClass = (animal: ShelterAnimalRecord) => {
    const normalized = animal.status.toLowerCase();
    if (normalized === "disponivel") return "bg-secondary/15 text-secondary";
    if (normalized === "adotado") return "bg-primary/15 text-primary";
    if (normalized === "reservado") return "bg-muted text-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow={copy.title}
        title={`${copy.welcomePrefix} ${shelter?.nome ?? "FYA"}`}
        subtitle={copy.subtitle}
      />

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={copy.cardTotalPets} value={stats.total} />
        <StatCard label={copy.cardAvailable} value={stats.available} tone="secondary" />
        <StatCard label={copy.cardPending} value={stats.pending} />
        <StatCard label={copy.cardAdopted} value={stats.adopted} tone="primary" />
      </section>

      {showOnboarding && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold">{copy.onboarding.title}</h2>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              {copy.onboarding.progress(onboardingDone, onboardingSteps.length)}
            </span>
          </header>
          <p className="mt-2 text-sm text-muted-foreground">{copy.onboarding.subtitle}</p>
          <ul className="mt-4 space-y-2">
            {onboardingSteps.map((step) => {
              const baseClass =
                "flex items-center justify-between rounded-xl border border-border/25 bg-card px-3 py-2.5 text-sm transition-colors";
              const inner = (
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                      step.done ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.done ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                  </span>
                  <span className={step.done ? "line-through opacity-70" : ""}>{step.label}</span>
                </span>
              );
              if (step.done || !step.href) {
                return (
                  <li key={step.id} className={baseClass}>
                    {inner}
                  </li>
                );
              }
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={`${baseClass} hover:border-primary/40 hover:bg-muted/60`}
                  >
                    {inner}
                    <span aria-hidden className="text-muted-foreground">
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border/25 bg-card p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">{copy.sectionActivity}</h2>
            <Link href={`/${locale}/canil/animais`} className="text-sm font-semibold text-primary hover:underline">
              {copy.viewAllPets}
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="rounded-xl bg-muted/60 px-4 py-5 text-sm text-muted-foreground">{copy.emptyActivity}</p>
          ) : (
            <ul className="divide-y divide-border/20">
              {recentActivity.map((animal) => (
                <li key={animal.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{animal.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(animal.raca ?? localizeSpecies(animal.especie, locale)).replaceAll("_", " ")}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(animal)}`}>
                    {animal.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-border/25 bg-card p-6">
          <h2 className="text-lg font-bold">{copy.sectionTasks}</h2>
          {actionItems.length === 0 ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary">
              <CheckCircle2 className="h-4 w-4" />
              {copy.actionAllClear}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {actionItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border border-border/25 px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-muted/60"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span aria-hidden className="text-muted-foreground">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 space-y-2">
            <Link
              href={`/${locale}/canil/pedidos`}
              className="block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {copy.openRequests}
            </Link>
            <Link
              href={`/${locale}/canil/mensagens`}
              className="flex items-center justify-center gap-2 rounded-full border border-border/40 px-5 py-3 text-sm font-semibold text-primary hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              {copy.messages}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
