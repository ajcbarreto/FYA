import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { AnimalForm } from "@/components/animal-form";
import { ToastFeedback } from "@/components/toast-feedback";
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

  const copy =
    locale === "pt"
      ? {
          back: "Voltar aos animais",
          title: "Novo animal",
          subtitle: "Adiciona um animal ao inventario do teu canil.",
          submit: "Criar animal",
          errors: {
            invalid_data: "Preenche pelo menos nome, especie e estado.",
            save_failed: "Nao foi possivel criar o animal.",
          },
        }
      : {
          back: "Back to pets",
          title: "New pet",
          subtitle: "Add a pet to your shelter inventory.",
          submit: "Create pet",
          errors: {
            invalid_data: "Provide at least name, species and status.",
            save_failed: "Could not create the pet.",
          },
        };

  const feedback = error && copy.errors[error as keyof typeof copy.errors] ? copy.errors[error as keyof typeof copy.errors] : null;

  return (
    <main className="space-y-6">
      <Link
        href={`/${locale}/canil/animais`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback message={feedback} variant="error" />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <AnimalForm locale={locale} action={createAnimal} submitLabel={copy.submit} />
      </section>
    </main>
  );
}
