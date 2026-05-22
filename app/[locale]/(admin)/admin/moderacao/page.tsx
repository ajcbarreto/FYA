import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, EyeOff, Flag, PawPrint, X } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import {
  moderateAnimalListing,
  resolveDenuncia,
} from "@/app/[locale]/(admin)/admin/actions";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";
import { ToastFeedback } from "@/components/toast-feedback";

type AdminModeracaoPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

type PendingAnimalRow = {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  descricao: string | null;
  created_at: string;
  owner_profile: { full_name: string | null; email: string | null } | null;
};

type DenunciaRow = {
  id: string;
  target_type: string;
  target_id: string;
  motivo: string;
  descricao: string | null;
  created_at: string;
  reporter_profile: { full_name: string | null; email: string | null } | null;
};

export default async function AdminModeracaoPage({ params, searchParams }: AdminModeracaoPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  const [{ data: pendingAnimals }, { data: denuncias }] = await Promise.all([
    supabase
      .from("animais")
      .select(
        "id,nome,especie,raca,descricao,created_at,owner_profile:profiles!owner_profile_id(full_name,email)",
      )
      .eq("estado_moderacao", "pendente")
      .order("created_at", { ascending: true }),
    supabase
      .from("denuncias")
      .select(
        "id,target_type,target_id,motivo,descricao,created_at,reporter_profile:profiles!reporter_profile_id(full_name,email)",
      )
      .eq("estado", "aberta")
      .order("created_at", { ascending: false }),
  ]);

  const dict = getDictionary(locale);
  const t = dict.adminModeracao;
  const reportReasons = dict.shelterPublic.reportReasons;
  const feedback = (success && t.messages[success]) || (error && t.messages[error]) || null;

  const animals = (pendingAnimals as PendingAnimalRow[] | null) ?? [];
  const reports = (denuncias as DenunciaRow[] | null) ?? [];

  return (
    <main className="space-y-6">
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <PawPrint className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.pendingAnimalsTitle}
          </h2>
          {animals.length > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {animals.length}
            </span>
          )}
        </div>
        {animals.length === 0 ? (
          <PageEmpty title={t.emptyAnimals} icon={PawPrint} />
        ) : (
          <ul className="space-y-3">
            {animals.map((animal) => {
              const ownerName =
                animal.owner_profile?.full_name?.trim() ||
                animal.owner_profile?.email?.split("@")[0] ||
                "—";
              const formattedDate = new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(animal.created_at));
              return (
                <li key={animal.id} className="rounded-2xl border border-border/25 bg-card p-5">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{animal.nome}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {animal.raca ?? animal.especie} • {ownerName} • {formattedDate}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/pets/${animal.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t.openTarget}
                    </Link>
                  </header>
                  {animal.descricao && (
                    <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground">
                      {animal.descricao}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border/15 pt-4">
                    <form action={moderateAnimalListing}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="animalId" value={animal.id} />
                      <input type="hidden" name="decision" value="aprovado" />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t.approve}
                      </button>
                    </form>
                    <form action={moderateAnimalListing}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="animalId" value={animal.id} />
                      <input type="hidden" name="decision" value="rejeitado" />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t.reject}
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t.denunciasTitle}</h2>
          {reports.length > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
              {reports.length}
            </span>
          )}
        </div>
        {reports.length === 0 ? (
          <PageEmpty title={t.emptyDenuncias} icon={Flag} />
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => {
              const reasonLabel =
                reportReasons[report.motivo as keyof typeof reportReasons] ?? report.motivo;
              const reporter =
                report.reporter_profile?.full_name?.trim() ||
                report.reporter_profile?.email ||
                "—";
              const formattedDate = new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(report.created_at));
              return (
                <li key={report.id} className="rounded-2xl border border-border/25 bg-card p-5">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{reasonLabel}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {t.reporter}: {reporter} • {formattedDate} • {report.target_type}
                      </p>
                    </div>
                    {report.target_type === "animal" && (
                      <Link
                        href={`/${locale}/pets/${report.target_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {t.openTarget}
                      </Link>
                    )}
                  </header>
                  {report.descricao && (
                    <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground">
                      {report.descricao}
                    </p>
                  )}
                  <form
                    action={resolveDenuncia}
                    className="mt-4 space-y-2 border-t border-border/15 pt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:space-y-0"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="denunciaId" value={report.id} />
                    <input
                      name="resolution_note"
                      placeholder={t.resolveNotePlaceholder}
                      className="h-9 flex-1 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[240px]"
                    />
                    {report.target_type === "animal" && (
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          name="hide_target"
                          value="true"
                          className="h-3.5 w-3.5 rounded border-border"
                        />
                        <EyeOff className="h-3 w-3" />
                        {t.hideTarget}
                      </label>
                    )}
                    <span className="flex shrink-0 gap-2">
                      <button
                        type="submit"
                        name="decision"
                        value="resolvida"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t.markResolved}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="ignorada"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t.markIgnored}
                      </button>
                    </span>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
