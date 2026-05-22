import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { AnimalForm } from "@/components/animal-form";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { createUserAnimal } from "@/app/[locale]/(dashboard)/user/animais/actions";

type NewUserAnimalPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewUserAnimalPage({ params, searchParams }: NewUserAnimalPageProps) {
  const { locale } = await params;
  const { error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/animais/novo`);
  }

  const dict = getDictionary(locale);
  const t = dict.userNewAnimal;
  const canilNew = dict.canilNewAnimal;
  const feedback =
    error && canilNew.errorMessages[error as keyof typeof canilNew.errorMessages]
      ? canilNew.errorMessages[error as keyof typeof canilNew.errorMessages]
      : null;

  return (
    <main className="space-y-6">
      <Link
        href={`/${locale}/user/animais`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {canilNew.back}
      </Link>

      <PageHeader title={t.title} subtitle={t.subtitle} />

      <ToastFeedback message={feedback} variant="error" />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <AnimalForm locale={locale} action={createUserAnimal} submitLabel={canilNew.submit} />
      </section>
    </main>
  );
}
