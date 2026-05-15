import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { requestPasswordReset } from "@/app/auth/password/actions";
import { ToastFeedback } from "@/components/toast-feedback";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ForgotPasswordPage({ params, searchParams }: ForgotPasswordPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy =
    locale === "pt"
      ? {
          title: "Recuperar password",
          subtitle: "Indica o teu email e enviamos um link para definires uma nova password.",
          emailLabel: "Email",
          emailPlaceholder: "tu@email.com",
          submit: "Enviar link de recuperacao",
          backToLogin: "Voltar ao login",
          sent: "Se existir uma conta com esse email, enviamos um link de recuperacao.",
          invalid_email: "Indica um email valido.",
        }
      : {
          title: "Reset password",
          subtitle: "Enter your email and we will send a link to set a new password.",
          emailLabel: "Email",
          emailPlaceholder: "you@email.com",
          submit: "Send recovery link",
          backToLogin: "Back to login",
          sent: "If an account exists for that email, we sent a recovery link.",
          invalid_email: "Enter a valid email.",
        };

  const feedback =
    success === "sent" ? copy.sent : error === "invalid_email" ? copy.invalid_email : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />
      <div className="rounded-3xl border border-border/30 bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>

        {success === "sent" && (
          <p className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            {copy.sent}
          </p>
        )}

        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {copy.emailLabel}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={copy.emailPlaceholder}
                className="h-12 w-full rounded-xl bg-muted px-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {copy.submit}
          </button>
        </form>

        <Link
          href={`/${locale}/auth/login`}
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backToLogin}
        </Link>
      </div>
    </main>
  );
}
