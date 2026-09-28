import { Captcha } from "@/components/captcha";
import { RegistrationPassword } from "@/components/registration-password";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileUp } from "lucide-react";
import { register } from "@/app/auth/register/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "shelterRegistration");
}

type ShelterRegistrationPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ShelterRegistrationPage({
  params,
  searchParams,
}: ShelterRegistrationPageProps) {
  const { locale } = await params;
  const { error, success } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const content =
    locale === "pt"
      ? {
          eyebrow: "Para canis e associações",
          title: "Registo de canis e associações",
          subtitle:
            "Cria a conta da tua organização para publicar animais, receber candidaturas e organizar o trabalho da equipa na FYA.",
          benefitsTitle: "O que a conta inclui",
          benefits: [
            "Ficha pública de cada animal, com registo privado, documentos e histórico.",
            "Candidaturas, mensagens e visitas num só sítio, com respostas modelo.",
            "Contas individuais para a equipa, tarefas com prazo e acompanhamento depois da adoção.",
          ],
          pilotPrompt: "Ainda estás a avaliar?",
          pilotLink: "Conhece o piloto para canis",
          hasAccount: "Já tens conta?",
          browseFile: "Procurar ficheiro",
        }
      : {
          eyebrow: "For shelters and rescue groups",
          title: "Shelter and rescue group registration",
          subtitle:
            "Create your organisation's account to publish animals, receive applications and organise your team's work on FYA.",
          benefitsTitle: "What the account includes",
          benefits: [
            "A public profile for each animal, with private records, documents and history.",
            "Applications, messages and visits in one place, with reply templates.",
            "Individual team accounts, tasks with deadlines and follow-up after adoption.",
          ],
          pilotPrompt: "Still deciding?",
          pilotLink: "Learn about the shelter pilot",
          hasAccount: "Already have an account?",
          browseFile: "Browse file",
        };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-12 lg:px-8"
    >
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          {content.eyebrow}
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
          {content.subtitle}
        </p>
      </header>

      {error && (
        <p className="mx-auto mb-4 max-w-3xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="mx-auto mb-4 max-w-3xl rounded-xl border border-secondary/35 bg-secondary/15 px-4 py-3 text-sm text-secondary">
          {success}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <aside className="border-l-4 border-secondary pl-6 lg:col-span-4">
          <h2 className="text-xl font-bold text-secondary">
            {content.benefitsTitle}
          </h2>
          <ul className="mt-5 space-y-4">
            {content.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                />
                {benefit}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            {content.pilotPrompt}{" "}
            <Link
              href={`/${locale}/para-canis`}
              className="font-semibold text-primary underline"
            >
              {content.pilotLink}
            </Link>
          </p>
        </aside>

        <form action={register} className="space-y-10 lg:col-span-8">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="role" value="canil" />
          <input type="hidden" name="source" value="shelter_registration" />

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
                1
              </span>
              <h2 className="text-2xl font-bold">
                {dictionary.auth.shelterIdentitySection}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="shelter_name"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.shelterName}
                </label>
                <input
                  id="shelter_name"
                  name="shelter_name"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="shelter_location"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.shelterLocation}
                </label>
                <input
                  id="shelter_location"
                  name="shelter_location"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="shelter_mission"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.shelterMission}
                </label>
                <textarea
                  id="shelter_mission"
                  name="shelter_mission"
                  required
                  rows={4}
                  className="w-full rounded-3xl bg-muted px-6 py-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-xl font-bold text-secondary">
                2
              </span>
              <h2 className="text-2xl font-bold">
                {dictionary.auth.contactPersonSection}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="full_name"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.fullName}
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="contact_role"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.contactRole}
                </label>
                <input
                  id="contact_role"
                  name="contact_role"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="contact_phone"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.contactPhone}
                </label>
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  required
                  className="h-13 w-full rounded-xl bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-muted-foreground"
                >
                  {dictionary.auth.password}
                </label>
                <RegistrationPassword
                  locale={locale}
                  className="h-13 w-full rounded-xl bg-muted pl-6 pr-12 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/25 text-xl font-bold text-accent-foreground">
                3
              </span>
              <h2 className="text-2xl font-bold">
                {dictionary.auth.verificationSection}
              </h2>
            </div>
            <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-base text-muted-foreground">
                {dictionary.auth.registrationCertificateLabel}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {dictionary.auth.registrationCertificateHint}
              </p>
              <input
                id="registration_certificate"
                name="registration_certificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="registration_certificate"
                className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <CheckCircle2 className="h-4 w-4" />
                {content.browseFile}
              </label>
            </div>

            <label className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="declaration"
                required
                className="mt-1 h-4 w-4 rounded border-border text-secondary focus:ring-secondary"
              />
              <span>{dictionary.auth.shelterDeclaration}</span>
            </label>
          </section>

          <label className="flex items-start gap-3">
            <input type="checkbox" name="terms" required />
            <span>
              {locale === "pt"
                ? "Li e aceito as condições do piloto."
                : "I have read and accept the pilot terms."}{" "}
              <Link className="underline" href={`/${locale}/termos`}>
                {locale === "pt" ? "Condições" : "Terms"}
              </Link>{" "}
              ·{" "}
              <Link className="underline" href={`/${locale}/privacidade`}>
                {locale === "pt" ? "Privacidade" : "Privacy"}
              </Link>
            </span>
          </label>
          <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
            <button
              type="button"
              className="w-full rounded-xl px-8 py-4 font-bold text-muted-foreground transition-colors hover:bg-muted md:w-auto"
            >
              {dictionary.auth.saveDraft}
            </button>
            <Captcha locale={locale} />
            <SubmitButton
              type="submit"
              className="w-full rounded-xl bg-primary px-12 py-4 font-bold text-primary-foreground shadow-xl transition-all hover:scale-[1.02] md:w-auto"
            >
              {dictionary.auth.finalizeRegistration}
            </SubmitButton>
          </div>
        </form>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {content.hasAccount}{" "}
        <Link
          href={`/${locale}/auth/login`}
          className="font-bold text-primary hover:underline"
        >
          {dictionary.auth.goToLogin}
        </Link>
      </p>
    </main>
  );
}
