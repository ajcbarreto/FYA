import { Captcha } from "@/components/captcha";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lock, Mail, PawPrint } from "lucide-react";
import { login } from "@/app/auth/login/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { ToastFeedback } from "@/components/toast-feedback";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "login", "/auth/login");
}

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    next?: string;
    success?: string;
  }>;
};

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { error, next, success } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy =
    locale === "pt"
      ? {
          sideTitle: "Com a tua conta podes",
          sideItems: [
            "acompanhar o estado das candidaturas que enviaste;",
            "trocar mensagens com os canis e combinar visitas;",
            "voltar aos animais que guardaste nos favoritos.",
          ],
          shelterNote:
            "Trabalhas num canil? Entras aqui com a mesma conta da equipa.",
          forgotPassword: "Esqueceste a password?",
          rememberDevice: "Lembrar este dispositivo",
          orContinue: "Ou continuar com",
          registerPrompt: "Ainda não tens conta?",
          passwordUpdated:
            "Password atualizada. Inicia sessão com a nova password.",
          socialIntro: "Ou entra com",
        }
      : {
          sideTitle: "With your account you can",
          sideItems: [
            "check the status of the applications you sent;",
            "message shelters and arrange visits;",
            "come back to the animals you saved as favourites.",
          ],
          shelterNote:
            "Work at a shelter? Sign in here with your team account.",
          forgotPassword: "Forgot password?",
          rememberDevice: "Remember this device",
          orContinue: "Or continue with",
          registerPrompt: "Don't have an account?",
          passwordUpdated: "Password updated. Sign in with your new password.",
          socialIntro: "Or continue with",
        };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 md:px-8 md:py-12"
    >
      <section className="flex min-h-[700px] w-full flex-col overflow-hidden rounded-2xl bg-muted/35 shadow-[0_20px_40px_rgba(56,56,51,0.06)] md:flex-row">
        <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
          <div className="inline-flex w-fit items-center gap-2">
            <PawPrint aria-hidden="true" className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              FYA
            </span>
          </div>
          <div className="max-w-sm">
            <p className="display-title text-3xl leading-tight">
              {copy.sideTitle}
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/85">
              {copy.sideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/20 pt-5 text-sm text-white/70">
              {copy.shelterNote}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-card p-8 md:w-1/2 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h1 className="display-title text-4xl sm:text-5xl">
                {dictionary.auth.loginTitle}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {dictionary.auth.loginSubtitle}
              </p>
            </div>

            {error && (
              <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <ToastFeedback
              message={
                success === "password_updated" ? copy.passwordUpdated : null
              }
              variant="success"
            />

            <form action={login} className="space-y-6">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={next ?? ""} />

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="ml-3 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {dictionary.auth.email}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={
                      locale === "pt" ? "tu@email.com" : "hello@example.com"
                    }
                    className="h-13 w-full rounded-xl bg-muted px-14 pr-5 text-sm outline-none ring-0 transition-colors focus:bg-background focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="mx-3 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {dictionary.auth.password}
                  </label>
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-13 w-full rounded-xl bg-muted px-14 pr-5 text-sm outline-none ring-0 transition-colors focus:bg-background focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <label className="ml-3 flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                {copy.rememberDevice}
              </label>

              <Captcha locale={locale} />
              <SubmitButton
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {dictionary.auth.loginSubmit}
                <ArrowRight className="h-4 w-4" />
              </SubmitButton>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>{copy.socialIntro}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <SocialLoginButtons locale={locale} next={next} />

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {copy.registerPrompt}{" "}
              <Link
                href={`/${locale}/auth/register`}
                className="font-bold text-primary hover:underline"
              >
                {dictionary.auth.goToRegister}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
