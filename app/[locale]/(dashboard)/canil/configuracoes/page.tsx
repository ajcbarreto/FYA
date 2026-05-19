import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { updateShelterSettings } from "@/app/[locale]/(dashboard)/canil/actions";
import { ToastFeedback } from "@/components/toast-feedback";

type CanilSettingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CanilSettingsPage({ params, searchParams }: CanilSettingsPageProps) {
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
    redirect(`/${locale}/auth/login?next=/canil/configuracoes`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  const copy = getDictionary(locale).canilSettingsPage;
  const feedback =
    success === "saved"
      ? copy.success
      : error && copy.errorMessages[error]
        ? copy.errorMessages[error]
        : null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <form action={updateShelterSettings} className="space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-semibold">
              {copy.labelNome}
            </label>
            <input
              id="nome"
              name="nome"
              defaultValue={shelter?.nome ?? ""}
              placeholder={copy.placeholderNome}
              className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="localizacao" className="text-sm font-semibold">
                {copy.labelLocalizacao}
              </label>
              <input
                id="localizacao"
                name="localizacao"
                defaultValue={shelter?.localizacao ?? ""}
                placeholder={copy.placeholderLocalizacao}
                className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-sm font-semibold">
                {copy.labelTelefone}
              </label>
              <input
                id="telefone"
                name="telefone"
                defaultValue={shelter?.telefone ?? ""}
                placeholder={copy.placeholderTelefone}
                className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email_contacto" className="text-sm font-semibold">
              {copy.labelEmail}
            </label>
            <input
              id="email_contacto"
              name="email_contacto"
              defaultValue={shelter?.email_contacto ?? ""}
              placeholder={copy.placeholderEmail}
              className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="missao" className="text-sm font-semibold">
              {copy.labelMissao}
            </label>
            <textarea
              id="missao"
              name="missao"
              defaultValue={shelter?.missao ?? ""}
              placeholder={copy.placeholderMissao}
              rows={5}
              className="w-full rounded-xl border border-border/25 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            {copy.save}
          </button>
        </form>
      </section>
    </main>
  );
}
