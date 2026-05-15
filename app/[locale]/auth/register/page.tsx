import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Lock, Mail, PawPrint, User } from "lucide-react";
import { register } from "@/app/auth/register/actions";
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
  const copy =
    locale === "pt"
      ? {
          pageTitle: "Cada pata merece um lar feliz.",
          pageDescription:
            "Junta-te a uma comunidade de adotantes e canis. O teu registo e o primeiro passo para criar novas historias.",
          joined: "Mais de 12.000 membros",
          joinedSubtitle: "Ativos em dezenas de canis parceiros",
          alreadyHave: "Ja tens conta?",
          createAccount: "Criar conta",
          continueWith: "OU CONTINUAR COM",
          terms:
            "Concordo com os Termos de Servico e Politica de Privacidade e autorizo o tratamento dos meus dados para criacao de conta.",
        }
      : {
          pageTitle: "Every paw deserves a joyful home.",
          pageDescription:
            "Join our community of adopters and shelters. Registration is your first step toward more success stories.",
          joined: "Joined by 12,000+ members",
          joinedSubtitle: "Active across partner shelters",
          alreadyHave: "Already have an account?",
          createAccount: "Create account",
          continueWith: "OR CONTINUE WITH",
          terms:
            "I agree to the Terms of Service and Privacy Policy and authorize data processing for account creation.",
        };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <section className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="hidden lg:flex lg:flex-col lg:gap-10">
          <div className="relative w-fit">
            <div className="h-72 w-72 overflow-hidden rounded-full bg-secondary/20">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWCZKJyZVDZ0dI5a0Biove2dBDNpabZ4NSMqwafAfeCf9CcyQ6ZxDzP6gJI7byxRwbFc67KU_Tts1FECIP4wPVI5tO0Dic1t1FiWeW60JafvL0nQJbENUVvPDgrWO4R034SZTDAFZ4naVmmdkHzHExw-HjvsUOP4FVyz52Ehzjb6289EJrWGhxXHLSHbCQ4_c_aiklLZrnAFSZOtWOrkSlzDvKMCceiMq9JouGzka6aERf8bHeGTBqVNYnqew7CTcARGYnTJchl7Y"
                alt={locale === "pt" ? "Cao sorridente" : "Smiling dog"}
                fill
                sizes="288px"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-8 h-48 w-48 overflow-hidden rounded-full border-8 border-background bg-accent/20">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFutvC_LkhP2mmaQjWonEh_ong68fgPK1qYZHCdhxexb3hi7Ymm6BFV-354zz-BHNPO6omH0gEY9HCPlFducmGdQDSjaC7AaaVV2Io2Gq5e_BTz393TiLXwYzhw2W57Sj_bIbTjHkOTcARH9SEppiFgFyak9TEiv5p6wymyrszd0dQryHvfl2Fvq44uIl35uYEReZRjN9xdGvjB4LESi0GbGx5fJGkAALGaldpttCHCcMAycy9rr8drj1SHv6LtoOTvo7W_7Pus4M"
                alt={locale === "pt" ? "Gatinho" : "Kitten"}
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              {copy.pageTitle.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-secondary">{copy.pageTitle.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{copy.pageDescription}</p>
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-muted/55 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <PawPrint className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{copy.joined}</p>
                <p className="text-sm text-muted-foreground">{copy.joinedSubtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/30 bg-muted/35 p-8 shadow-[0_20px_40px_rgba(56,56,51,0.06)] md:p-12">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-primary">{copy.createAccount}</h2>
            <p className="mt-2 text-muted-foreground">{dictionary.auth.registerSubtitle}</p>
          </div>

          {error && (
            <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-6 rounded-xl border border-secondary/35 bg-secondary/15 px-4 py-3 text-sm text-secondary">
              {success}
            </p>
          )}

          <form action={register} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <label htmlFor="full_name" className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {dictionary.auth.fullName}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {dictionary.auth.email}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {dictionary.auth.password}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="h-13 w-full rounded-xl bg-background px-12 pr-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="ml-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {dictionary.auth.accountType}
              </label>
              <select
                id="role"
                name="role"
                defaultValue="user"
                className="h-13 w-full rounded-xl bg-background px-4 text-sm outline-none ring-0 transition-colors focus:ring-2 focus:ring-primary/30"
              >
                <option value="user">{dictionary.auth.adopter}</option>
                <option value="canil">{dictionary.auth.canil}</option>
              </select>
              <p className="text-xs text-muted-foreground">
                <Link href={`/${locale}/auth/shelter-registration`} className="font-medium text-secondary hover:underline">
                  {dictionary.auth.shelterRegistrationLink}
                </Link>
              </p>
            </div>

            <label className="flex items-start gap-3 px-1 text-sm text-muted-foreground">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border text-secondary focus:ring-secondary" />
              <span>{copy.terms}</span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:opacity-95 hover:shadow-xl"
            >
              {dictionary.auth.submit}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-border/50" />
              <span className="mx-4 text-xs font-medium text-muted-foreground">{copy.continueWith}</span>
              <div className="flex-grow border-t border-border/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-muted">
                Google
              </button>
              <button type="button" className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-muted">
                Facebook
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="mt-8 bg-muted/45 px-6 py-10 text-center text-xs text-muted-foreground lg:px-8">
        © 2026 FYA (Found Your Animal). {locale === "pt" ? "Construido com carinho para cada pata." : "Built with care for every paw."}
      </footer>
    </main>
  );
}
