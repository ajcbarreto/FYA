import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { updateShelterSettings } from "@/app/[locale]/(dashboard)/canil/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

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

          <fieldset className="space-y-4 rounded-2xl border border-border/30 p-5">
            <legend className="px-1 text-sm font-bold">{copy.donationsTitle}</legend>
            <p className="text-xs text-muted-foreground">{copy.donationsHint}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="iban" className="text-sm font-semibold">
                  {copy.labelIban}
                </label>
                <input
                  id="iban"
                  name="iban"
                  defaultValue={shelter?.iban ?? ""}
                  placeholder={copy.placeholderIban}
                  className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="mbway" className="text-sm font-semibold">
                  {copy.labelMbway}
                </label>
                <input
                  id="mbway"
                  name="mbway"
                  defaultValue={shelter?.mbway ?? ""}
                  placeholder={copy.placeholderMbway}
                  className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="donation_link" className="text-sm font-semibold">
                {copy.labelDonationLink}
              </label>
              <input
                id="donation_link"
                name="donation_link"
                type="url"
                defaultValue={shelter?.donation_link ?? ""}
                placeholder={copy.placeholderDonationLink}
                className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="donation_message" className="text-sm font-semibold">
                {copy.labelDonationMessage}
              </label>
              <textarea
                id="donation_message"
                name="donation_message"
                defaultValue={shelter?.donation_message ?? ""}
                placeholder={copy.placeholderDonationMessage}
                rows={3}
                className="w-full rounded-xl border border-border/25 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </fieldset>

          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            {copy.save}
          </button>
        </form>
      </section>
    </main>
  );
}
