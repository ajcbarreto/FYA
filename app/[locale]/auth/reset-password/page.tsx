import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { updatePassword } from "@/app/auth/password/actions";
import { ToastFeedback } from "@/components/toast-feedback";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale } = await params;
  const { error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy =
    locale === "pt"
      ? {
          title: "Definir nova password",
          subtitle: "Escolhe uma nova password para a tua conta.",
          passwordLabel: "Nova password",
          confirmLabel: "Confirmar password",
          submit: "Guardar password",
          errors: {
            weak_password: "A password tem de ter pelo menos 6 caracteres.",
            mismatch: "As passwords nao coincidem.",
            expired: "O link expirou. Pede um novo link de recuperacao.",
            update_failed: "Nao foi possivel atualizar a password.",
          },
        }
      : {
          title: "Set new password",
          subtitle: "Choose a new password for your account.",
          passwordLabel: "New password",
          confirmLabel: "Confirm password",
          submit: "Save password",
          errors: {
            weak_password: "Password must be at least 6 characters.",
            mismatch: "Passwords do not match.",
            expired: "The link expired. Request a new recovery link.",
            update_failed: "Could not update the password.",
          },
        };

  const feedback = error && copy.errors[error as keyof typeof copy.errors] ? copy.errors[error as keyof typeof copy.errors] : null;
  const inputClass =
    "h-12 w-full rounded-xl bg-muted px-11 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <ToastFeedback message={feedback} variant="error" />
      <div className="rounded-3xl border border-border/30 bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>

        <form action={updatePassword} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {copy.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input id="password" name="password" type="password" minLength={6} required className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {copy.confirmLabel}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                minLength={6}
                required
                className={inputClass}
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
      </div>
    </main>
  );
}
