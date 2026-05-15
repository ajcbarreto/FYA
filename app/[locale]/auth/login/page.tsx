import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Lock, Mail, PawPrint } from "lucide-react";
import { login } from "@/app/auth/login/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { ToastFeedback } from "@/components/toast-feedback";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    next?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { error, next, success } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy =
    locale === "pt"
      ? {
          sideTitle: "Bem-vindo de volta a matilha.",
          sideText: "Reconecta-te com canis e encontra o companheiro ideal para a tua familia.",
          forgotPassword: "Esqueceste a password?",
          rememberDevice: "Lembrar este dispositivo",
          orContinue: "Ou continuar com",
          registerPrompt: "Ainda nao tens conta?",
          passwordUpdated: "Password atualizada. Inicia sessao com a nova password.",
        }
      : {
          sideTitle: "Welcome back to the pack.",
          sideText: "Reconnect with local shelters and find the companion that completes your family.",
          forgotPassword: "Forgot password?",
          rememberDevice: "Remember this device",
          orContinue: "Or continue with",
          registerPrompt: "Don't have an account?",
          passwordUpdated: "Password updated. Sign in with your new password.",
        };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 md:px-8 md:py-12">
      <section className="flex min-h-[700px] w-full flex-col overflow-hidden rounded-2xl bg-muted/35 shadow-[0_20px_40px_rgba(56,56,51,0.06)] md:flex-row">
        <div className="relative hidden w-1/2 p-12 md:flex md:flex-col md:justify-between">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqoyq7uuDX8byZraMUtO0HvBbcv1cBciDJKIAGd_OJmJmh3oS-FWYWS-RoFfuXBQ7XfLtqOqqgcciPqEMzbp1-ygVwagCWtZYjJ1kn6UhP6ZwE4Zpst-gOQxVZAb8DGq2wZ8-Yekyn-l3Oi_TojuZYuX6JkthIO6bjOdbyCy-9Oyo8puEQ9AImEvZtgN4-xyWeVWHK1-sZ0edrBOSpaOkPG1QXpeTljsqV1-k2153B9MciUJH7VGl2I8SjE5ymIZUMA3E17dLbHWQ"
            alt={locale === "pt" ? "Cao feliz" : "Happy golden retriever"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/45 to-transparent" />
          <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-md">
            <PawPrint className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">FYA</span>
          </div>
          <div className="relative z-10 max-w-sm text-white">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">{copy.sideTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/90">{copy.sideText}</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-card p-8 md:w-1/2 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight">{dictionary.auth.loginTitle}</h1>
              <p className="mt-2 text-muted-foreground">{dictionary.auth.loginSubtitle}</p>
            </div>

            {error && (
              <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <ToastFeedback
              message={success === "password_updated" ? copy.passwordUpdated : null}
              variant="success"
            />

            <form action={login} className="space-y-6">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={next ?? ""} />

              <div className="space-y-2">
                <label htmlFor="email" className="ml-3 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {dictionary.auth.email}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={locale === "pt" ? "tu@email.com" : "hello@example.com"}
                    className="h-13 w-full rounded-full bg-muted px-14 pr-5 text-sm outline-none ring-0 transition-colors focus:bg-background focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="mx-3 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
                    className="h-13 w-full rounded-full bg-muted px-14 pr-5 text-sm outline-none ring-0 transition-colors focus:bg-background focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <label className="ml-3 flex items-center gap-3 text-sm text-muted-foreground">
                <input type="checkbox" name="remember" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                {copy.rememberDevice}
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-6 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_22px_rgba(157,79,0,0.24)] transition-all hover:scale-[1.01] hover:shadow-[0_16px_28px_rgba(157,79,0,0.3)]"
              >
                {dictionary.auth.loginSubmit}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs font-medium text-muted-foreground">{copy.orContinue}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="rounded-full bg-muted px-4 py-3 text-sm font-semibold hover:bg-muted/75">
                Google
              </button>
              <button type="button" className="rounded-full bg-muted px-4 py-3 text-sm font-semibold hover:bg-muted/75">
                Apple
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-muted-foreground">
              {copy.registerPrompt}{" "}
              <Link href={`/${locale}/auth/register`} className="font-bold text-primary hover:underline">
                {dictionary.auth.goToRegister}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
