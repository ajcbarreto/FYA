import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Eye, FileUp, HeartHandshake, LayoutDashboard } from "lucide-react";
import { register } from "@/app/auth/register/actions";
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
  const content =
    locale === "pt"
      ? {
          eyebrow: "Junte-se a nossa missao",
          title: "Registo de Canis",
          subtitlePrefix: "Torne o seu abrigo parte da rede",
          subtitleSuffix: "Juntos, criamos ligacoes duradouras entre animais e familias amorosas.",
          benefitsTitle: "Porque a FYA?",
          benefit1Title: "Visibilidade total",
          benefit1Text: "Alcance milhares de potenciais adotantes todos os dias.",
          benefit2Title: "Gestao facilitada",
          benefit2Text: "Ferramentas intuitivas para gerir perfis de animais e candidaturas.",
          benefit3Title: "Rede de apoio",
          benefit3Text: "Acesso a recursos exclusivos e parcerias com veterinarios.",
          imageQuote: '"Mudar vidas, um patudo de cada vez."',
          hasAccount: "Ja tens conta?",
          browseFile: "Procurar ficheiro",
        }
      : {
          eyebrow: "Join our mission",
          title: "Shelter Registration",
          subtitlePrefix: "Bring your shelter into the",
          subtitleSuffix: "network and create lasting matches between pets and loving families.",
          benefitsTitle: "Why FYA?",
          benefit1Title: "Total visibility",
          benefit1Text: "Reach thousands of potential adopters every day.",
          benefit2Title: "Easy management",
          benefit2Text: "Intuitive tools to manage pets and adoption requests.",
          benefit3Title: "Support network",
          benefit3Text: "Access exclusive resources and partner vet initiatives.",
          imageQuote: '"Changing lives, one paw at a time."',
          hasAccount: "Already have an account?",
          browseFile: "Browse file",
        };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-12 lg:px-8">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <span className="mb-4 block text-xs font-bold uppercase tracking-[0.18em] text-secondary">{content.eyebrow}</span>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{content.title}</h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
          {content.subtitlePrefix} <span className="font-bold text-primary">FYA</span>. {content.subtitleSuffix}
        </p>
      </header>

      {error && (
        <p className="mx-auto mb-4 max-w-3xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="mx-auto mb-4 max-w-3xl rounded-xl border border-secondary/35 bg-secondary/15 px-4 py-3 text-sm text-secondary">
          {success}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <aside className="space-y-8 lg:col-span-4">
          <div className="rounded-3xl bg-secondary/10 p-8">
            <h3 className="mb-6 text-xl font-bold text-secondary">{content.benefitsTitle}</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold">{content.benefit1Title}</h4>
                  <p className="text-sm text-muted-foreground">{content.benefit1Text}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold">{content.benefit2Title}</h4>
                  <p className="text-sm text-muted-foreground">{content.benefit2Text}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold">{content.benefit3Title}</h4>
                  <p className="text-sm text-muted-foreground">{content.benefit3Text}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-64 overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuoGWPNxgccv2PjP-EljrPZXeo21I3n6e1XE9YzPCzxMv50Zyf-2ceJmBnCbeumIC62eCf6b-57Jj_Spc6469NsNooVsVaJTuA0KJvhU3QvTq-ZgrRFVNQ2rCYucMZdjjXdt5TQTB4WPeWFpY7cMwfBO6hX84Ycx3qGsl1GiQEvZUGeEsCyX4YR-eRHXQ263xrXVvNV1qVa-QA-Y_Iqxx6kcBRsf8fCtCytfTwTCC2CRPD-WYXRXZyv_SsU5czIcNJFIUpY3hVSWU"
              alt={locale === "pt" ? "Caes felizes num abrigo" : "Happy shelter dogs"}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/60 to-transparent p-6">
              <p className="font-medium italic text-white">{content.imageQuote}</p>
            </div>
          </div>
        </aside>

        <form action={register} className="space-y-10 lg:col-span-8">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="role" value="canil" />
          <input type="hidden" name="source" value="shelter_registration" />

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
                1
              </span>
              <h2 className="text-2xl font-bold">{dictionary.auth.shelterIdentitySection}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="shelter_name" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.shelterName}
                </label>
                <input
                  id="shelter_name"
                  name="shelter_name"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shelter_location" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.shelterLocation}
                </label>
                <input
                  id="shelter_location"
                  name="shelter_location"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="shelter_mission" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.shelterMission}
                </label>
                <textarea
                  id="shelter_mission"
                  name="shelter_mission"
                  required
                  rows={4}
                  className="w-full rounded-3xl bg-muted px-6 py-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/35"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-xl font-bold text-secondary">
                2
              </span>
              <h2 className="text-2xl font-bold">{dictionary.auth.contactPersonSection}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.fullName}
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_role" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.contactRole}
                </label>
                <input
                  id="contact_role"
                  name="contact_role"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_phone" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.contactPhone}
                </label>
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="password" className="text-sm font-bold text-muted-foreground">
                  {dictionary.auth.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="h-13 w-full rounded-full bg-muted px-6 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-secondary/35"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-muted/35 p-8 md:p-12">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/25 text-xl font-bold text-accent-foreground">
                3
              </span>
              <h2 className="text-2xl font-bold">{dictionary.auth.verificationSection}</h2>
            </div>
            <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-base text-muted-foreground">{dictionary.auth.registrationCertificateLabel}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{dictionary.auth.registrationCertificateHint}</p>
              <input
                id="registration_certificate"
                name="registration_certificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="registration_certificate"
                className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <CheckCircle2 className="h-4 w-4" />
                {content.browseFile}
              </label>
            </div>

            <label className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" name="declaration" required className="mt-1 h-4 w-4 rounded border-border text-secondary focus:ring-secondary" />
              <span>{dictionary.auth.shelterDeclaration}</span>
            </label>
          </section>

          <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
            <button
              type="button"
              className="w-full rounded-full px-8 py-4 font-bold text-muted-foreground transition-colors hover:bg-muted md:w-auto"
            >
              {dictionary.auth.saveDraft}
            </button>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-br from-primary to-accent px-12 py-4 font-bold text-primary-foreground shadow-xl transition-all hover:scale-[1.02] md:w-auto"
            >
              {dictionary.auth.finalizeRegistration}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {content.hasAccount}{" "}
        <Link href={`/${locale}/auth/login`} className="font-bold text-primary hover:underline">
          {dictionary.auth.goToLogin}
        </Link>
      </p>
    </main>
  );
}
