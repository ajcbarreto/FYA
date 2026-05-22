import { Flag } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { submitFlag } from "@/app/flags/actions";

type ReportFlagProps = {
  locale: Locale;
  targetType: "animal" | "mensagem" | "conversa" | "canil" | "profile";
  targetId: string;
  redirectTo: string;
  authenticated: boolean;
};

// Pequeno colapsavel que abre um formulario para denunciar conteudo. Quando
// nao ha utilizador autenticado, mostra so um link para login.
export function ReportFlag({ locale, targetType, targetId, redirectTo, authenticated }: ReportFlagProps) {
  const t = getDictionary(locale).shelterPublic;
  const reasons = Object.entries(t.reportReasons) as Array<[keyof typeof t.reportReasons, string]>;

  if (!authenticated) {
    return (
      <a
        href={`/${locale}/auth/login?next=${encodeURIComponent(redirectTo)}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
      >
        <Flag className="h-3 w-3" />
        {t.reportTitle}
      </a>
    );
  }

  return (
    <details className="group/report inline-block text-xs">
      <summary className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-destructive">
        <Flag className="h-3 w-3" />
        {t.reportTitle}
      </summary>
      <form
        action={submitFlag}
        className="mt-3 w-72 space-y-3 rounded-xl border border-border/40 bg-card p-4 shadow-sm"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />
        <p className="text-xs text-muted-foreground">{t.reportSubtitle}</p>
        <label className="block space-y-1 text-xs font-semibold">
          {t.reportReason}
          <select
            name="motivo"
            required
            defaultValue=""
            className="mt-1 h-9 w-full rounded-lg border border-border/30 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>
              —
            </option>
            {reasons.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-xs font-semibold">
          {t.reportDescription}
          <textarea
            name="descricao"
            rows={3}
            placeholder={t.reportDescriptionPlaceholder}
            className="mt-1 w-full rounded-lg border border-border/30 bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-destructive px-3 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          {t.reportSubmit}
        </button>
      </form>
    </details>
  );
}
