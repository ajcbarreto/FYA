import { SubmitButton } from "@/components/submit-button";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { updateShelterSettings } from "@/app/[locale]/(dashboard)/canil/actions";
import { ToastFeedback } from "@/components/toast-feedback";

type CanilSettingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CanilSettingsPage({
  params,
  searchParams,
}: CanilSettingsPageProps) {
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
  const copy =
    locale === "pt"
      ? {
          title: "Configuracoes do Canil",
          subtitle: "Atualiza os dados publicos usados na pagina do canil.",
          labels: {
            nome: "Nome do canil",
            localizacao: "Localizacao",
            telefone: "Telefone",
            email: "Email de contacto",
            missao: "Missao",
          },
          placeholders: {
            nome: "Canil Esperanca",
            localizacao: "Lisboa",
            telefone: "+351 900 000 000",
            email: "contato@canil.pt",
            missao: "Descreve brevemente a missao do canil.",
          },
          save: "Guardar configuracoes",
          success: "Configuracoes guardadas com sucesso.",
          errors: {
            invalid_data: "Preenche pelo menos nome e localizacao.",
            save_failed: "Nao foi possivel guardar. Tenta novamente.",
            no_shelter: "Nao foi encontrado um canil associado a esta conta.",
          },
        }
      : {
          title: "Shelter Settings",
          subtitle: "Update public information used on your shelter page.",
          labels: {
            nome: "Shelter name",
            localizacao: "Location",
            telefone: "Phone",
            email: "Contact email",
            missao: "Mission",
          },
          placeholders: {
            nome: "Joyful Sanctuary",
            localizacao: "Lisbon",
            telefone: "+351 900 000 000",
            email: "contact@shelter.org",
            missao: "Describe your shelter mission and adoption process.",
          },
          save: "Save settings",
          success: "Settings saved successfully.",
          errors: {
            invalid_data: "Please provide at least name and location.",
            save_failed: "Could not save changes. Try again.",
            no_shelter: "No shelter is linked to this account.",
          },
        };

  const feedback =
    success === "saved"
      ? copy.success
      : error && copy.errors[error as keyof typeof copy.errors]
        ? copy.errors[error as keyof typeof copy.errors]
        : null;

  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
        <h1 className="display-title text-4xl sm:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback
        message={feedback}
        variant={success ? "success" : "error"}
      />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <form action={updateShelterSettings} className="space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-semibold">
              {copy.labels.nome}
            </label>
            <input
              id="nome"
              name="nome"
              defaultValue={shelter?.nome ?? ""}
              placeholder={copy.placeholders.nome}
              className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="localizacao" className="text-sm font-semibold">
                {copy.labels.localizacao}
              </label>
              <input
                id="localizacao"
                name="localizacao"
                defaultValue={shelter?.localizacao ?? ""}
                placeholder={copy.placeholders.localizacao}
                className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-sm font-semibold">
                {copy.labels.telefone}
              </label>
              <input
                id="telefone"
                name="telefone"
                defaultValue={shelter?.telefone ?? ""}
                placeholder={copy.placeholders.telefone}
                className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email_contacto" className="text-sm font-semibold">
              {copy.labels.email}
            </label>
            <input
              id="email_contacto"
              name="email_contacto"
              defaultValue={shelter?.email_contacto ?? ""}
              placeholder={copy.placeholders.email}
              className="h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="missao" className="text-sm font-semibold">
              {copy.labels.missao}
            </label>
            <textarea
              id="missao"
              name="missao"
              defaultValue={shelter?.missao ?? ""}
              placeholder={copy.placeholders.missao}
              rows={5}
              className="w-full rounded-xl border border-border/25 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <fieldset className="space-y-4 rounded-2xl bg-muted/50 p-5">
            <label className="block text-sm">
              {locale === "pt" ? "Imagem do canil (URL https://)" : "Shelter image (https:// URL)"}
              <input name="image_url" type="url" maxLength={2000} defaultValue={shelter?.image_url ?? ""} className="mt-2 h-11 w-full rounded-xl border bg-background px-3" placeholder="https://..." />
            </label>
            <legend className="font-bold">{locale === "pt" ? "Donativos" : "Donations"}</legend>
            <label className="block text-sm">
              {locale === "pt" ? "Link seguro para donativos (https://)" : "Secure donation link (https://)"}
              <input name="donation_url" type="url" maxLength={2000} defaultValue={shelter?.donation_url ?? ""} className="mt-2 h-11 w-full rounded-xl border bg-background px-3" />
            </label>
            <label className="block text-sm">
              {locale === "pt" ? "Como será utilizado o apoio?" : "How will donations help?"}
              <textarea name="donation_message" maxLength={1000} rows={3} defaultValue={shelter?.donation_message ?? ""} className="mt-2 w-full rounded-xl border bg-background p-3" />
            </label>
          </fieldset>
          <SubmitButton
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {copy.save}
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
