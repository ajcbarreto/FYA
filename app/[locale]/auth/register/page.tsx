import Link from "next/link";
import { notFound } from "next/navigation";
import { register } from "@/app/auth/register/actions";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { locale } = await params;
  const { error, success } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold">{dictionary.auth.registerTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{dictionary.auth.registerSubtitle}</p>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-md border border-green-600/40 bg-green-100 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <form action={register} className="mt-6 space-y-4 rounded-xl border p-5 shadow-sm">
        <input type="hidden" name="locale" value={locale} />
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            {dictionary.auth.fullName}
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

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
            minLength={6}
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            {dictionary.auth.accountType}
          </label>
          <select
            id="role"
            name="role"
            defaultValue="user"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="user">{dictionary.auth.adopter}</option>
            <option value="canil">{dictionary.auth.canil}</option>
          </select>
          <p className="text-xs text-muted-foreground">
            <Link href={`/${locale}/auth/shelter-registration`} className="hover:underline">
              {dictionary.auth.shelterRegistrationLink}
            </Link>
          </p>
        </div>

        <Button type="submit" className="w-full">
          {dictionary.auth.submit}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {dictionary.auth.hasAccount}{" "}
        <Link href={`/${locale}/auth/login`} className="font-medium text-foreground hover:underline">
          {dictionary.auth.goToLogin}
        </Link>
      </p>
    </main>
  );
}
