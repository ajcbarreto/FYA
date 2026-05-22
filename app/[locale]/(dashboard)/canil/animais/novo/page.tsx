import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { AnimalForm } from "@/components/animal-form";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { createAnimal } from "@/app/[locale]/(dashboard)/canil/animais/actions";

type NewAnimalPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewAnimalPage({ params, searchParams }: NewAnimalPageProps) {
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
    redirect(`/${locale}/auth/login?next=/canil/animais/novo`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil/animais?error=no_shelter`);
  }

  const copy = getDictionary(locale).canilNewAnimal;
  const feedback = error && copy.errorMessages[error] ? copy.errorMessages[error] : null;

  return (
    <main className="space-y-6">
      <Link
        href={`/${locale}/canil/animais`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <ToastFeedback message={feedback} variant="error" />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <AnimalForm locale={locale} action={createAnimal} submitLabel={copy.submit} />
      </section>
    </main>
  );
}
