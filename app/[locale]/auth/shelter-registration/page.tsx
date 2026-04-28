import Link from "next/link";
import { notFound } from "next/navigation";
import { register } from "@/app/auth/register/actions";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{dictionary.auth.shelterRegistrationTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{dictionary.auth.shelterRegistrationSubtitle}</p>

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

      <form action={register} className="mt-8 space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="role" value="canil" />
        <input type="hidden" name="source" value="shelter_registration" />

        <section className="space-y-4 rounded-xl bg-muted/40 p-5">
          <h2 className="text-lg font-semibold">{dictionary.auth.shelterIdentitySection}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="shelter_name" className="text-sm font-medium">
                {dictionary.auth.shelterName}
              </label>
              <input
                id="shelter_name"
                name="shelter_name"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="shelter_location" className="text-sm font-medium">
                {dictionary.auth.shelterLocation}
              </label>
              <input
                id="shelter_location"
                name="shelter_location"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="shelter_mission" className="text-sm font-medium">
                {dictionary.auth.shelterMission}
              </label>
              <textarea
                id="shelter_mission"
                name="shelter_mission"
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl bg-muted/40 p-5">
          <h2 className="text-lg font-semibold">{dictionary.auth.contactPersonSection}</h2>
          <div className="grid gap-4 md:grid-cols-2">
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
              <label htmlFor="contact_role" className="text-sm font-medium">
                {dictionary.auth.contactRole}
              </label>
              <input
                id="contact_role"
                name="contact_role"
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
              <label htmlFor="contact_phone" className="text-sm font-medium">
                {dictionary.auth.contactPhone}
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
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
          </div>
        </section>

        <section className="space-y-4 rounded-xl bg-muted/40 p-5">
          <h2 className="text-lg font-semibold">{dictionary.auth.verificationSection}</h2>
          <div className="space-y-2">
            <label htmlFor="registration_certificate" className="text-sm font-medium">
              {dictionary.auth.registrationCertificateLabel}
            </label>
            <input
              id="registration_certificate"
              name="registration_certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">{dictionary.auth.registrationCertificateHint}</p>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-input/70 bg-background p-3 text-sm">
            <input type="checkbox" name="declaration" required className="mt-1 h-4 w-4" />
            <span>{dictionary.auth.shelterDeclaration}</span>
          </label>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" className="sm:w-auto">
            {dictionary.auth.saveDraft}
          </Button>
          <Button type="submit" className="sm:w-auto">
            {dictionary.auth.finalizeRegistration}
          </Button>
        </div>
      </form>

      <p className="mt-5 text-sm text-muted-foreground">
        {dictionary.auth.hasAccount}{" "}
        <Link href={`/${locale}/auth/login`} className="font-medium text-foreground hover:underline">
          {dictionary.auth.goToLogin}
        </Link>
      </p>
    </main>
  );
}
