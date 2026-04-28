import Link from "next/link";
import { notFound } from "next/navigation";
import { login } from "@/app/auth/login/actions";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { error, next } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold">{dictionary.auth.loginTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{dictionary.auth.loginSubtitle}</p>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form action={login} className="mt-6 space-y-4 rounded-xl border p-5 shadow-sm">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next ?? ""} />

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {dictionary.auth.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {dictionary.auth.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" className="w-full">
          {dictionary.auth.loginSubmit}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {dictionary.auth.noAccount}{" "}
        <Link href={`/${locale}/auth/register`} className="font-medium text-foreground hover:underline">
          {dictionary.auth.goToRegister}
        </Link>
      </p>
    </main>
  );
}
