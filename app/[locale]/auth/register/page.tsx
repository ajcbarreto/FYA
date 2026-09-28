import { Captcha } from "@/components/captcha";
import { RegistrationPassword } from "@/components/registration-password";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Phone } from "lucide-react";
import { register } from "@/app/auth/register/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "register");
}

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RegisterPage({
  params,
  searchParams,
}: RegisterPageProps) {
  const { locale } = await params;
  const { error, success } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy =
    locale === "pt"
      ? {
          sideTitle: "Para que serve a conta",
          sideItems: [
            "Enviar candidaturas de adoção e ver em que ponto estão.",
            "Falar com a equipa do canil e combinar visitas.",
            "Guardar os animais que te interessam para veres mais tarde.",
          ],
          shelterPrompt: "Representas um canil ou associação?",
          alreadyHave: "Já tens conta?",
          createAccount: "Criar conta",
          continueWith: "OU CONTINUAR COM",
          terms:
            "Concordo com os Termos de Serviço e Política de Privacidade e autorizo o tratamento dos meus dados para criação de conta.",
        }
      : {
          sideTitle: "What the account is for",
          sideItems: [
            "Send adoption applications and see where they stand.",
            "Talk to the shelter team and arrange visits.",
            "Save the animals you like so you can come back to them.",
          ],
          shelterPrompt: "Represent a shelter or rescue group?",
          alreadyHave: "Already have an account?",
          createAccount: "Create account",
          continueWith: "OR CONTINUE WITH",
          terms:
            "I agree to the Terms of Service and Privacy Policy and authorize data processing for account creation.",
        };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[calc(100vh-4rem)] flex-col bg-background"
    >
      <section className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="hidden lg:block">
          <p className="display-title text-4xl leading-tight">
            {copy.sideTitle}
          </p>
          <ol className="mt-8 space-y-5">
            {copy.sideItems.map((item, i) => (
              <li key={item} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary"
                >
                  {i + 1}
                </span>
                <p className="pt-1.5 leading-relaxed text-muted-foreground">
                  {item}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
            {copy.shelterPrompt}{" "}
            <Link
              href={`/${locale}/auth/shelter-registration`}
              className="font-semibold text-secondary hover:underline"
            >
              {dictionary.auth.shelterRegistrationLink}
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-border/30 bg-muted/35 p-8 shadow-[0_20px_40px_rgba(56,56,51,0.06)] md:p-12">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {copy.createAccount}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {dictionary.auth.registerSubtitle}
            </p>
          </div>

          {error && (
            <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-6 rounded-xl border border-secondary/35 bg-secondary/15 px-4 py-3 text-sm text-secondary">
              {success}
            </p>
          )}

          <div className="mb-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              {locale === "pt"
                ? "Cria a tua conta de adotante com:"
                : "Create your adopter account with:"}
            </p>
            <SocialLoginButtons locale={locale} />
            <p className="text-center text-xs text-muted-foreground">
              {locale === "pt"
                ? "ou regista-te com email"
                : "or register with email"}
            </p>
          </div>
          <form action={register} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {locale === "pt" ? "Telemóvel" : "Mobile phone"}
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+351 900 000 000"
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {dictionary.auth.fullName}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {dictionary.auth.email}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {dictionary.auth.password}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute z-10 left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <RegistrationPassword
                  locale={locale}
                  className="h-13 w-full rounded-xl bg-background pl-12 pr-12 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <input type="hidden" name="role" value="user" />
            <p className="text-sm text-muted-foreground lg:hidden">
              <Link
                href={`/${locale}/auth/shelter-registration`}
                className="font-medium text-secondary hover:underline"
              >
                {dictionary.auth.shelterRegistrationLink}
              </Link>
            </p>

            <label className="flex items-start gap-3 px-1 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-1 h-4 w-4 rounded border-border text-secondary focus:ring-secondary"
              />
              <span>
                {copy.terms}{" "}
                <Link className="underline" href={`/${locale}/termos`}>
                  {locale === "pt" ? "Condições do piloto" : "Pilot terms"}
                </Link>{" "}
                ·{" "}
                <Link className="underline" href={`/${locale}/privacidade`}>
                  {locale === "pt" ? "Privacidade" : "Privacy"}
                </Link>
              </span>
            </label>

            <Captcha locale={locale} />
            <SubmitButton
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {dictionary.auth.submit}
              <ArrowRight className="h-4 w-4" />
            </SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
