import { signInWithProvider } from "@/app/auth/login/actions";
import { SubmitButton } from "@/components/submit-button";

export function SocialLoginButtons({ locale, next = "" }: { locale: string; next?: string }) {
  const providers = [
    ["google", "Google"],
    ["facebook", "Facebook"],
    ["apple", "Apple"],
  ] as const;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {providers.map(([provider, label]) => (
        <form key={provider} action={signInWithProvider}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="next" value={next} />
          <SubmitButton
            type="submit"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            {label}
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}
