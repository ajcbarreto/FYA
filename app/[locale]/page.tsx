import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, MapPin, PawPrint, Search, Users, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCatalogPets, getCatalogPetsCount } from "@/lib/pet-catalog/db-pets";

type LocalizedHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedHomePage({ params }: LocalizedHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [urgentPets, totalPets] = await Promise.all([
    getCatalogPets(supabase, locale, { limit: 4 }),
    getCatalogPetsCount(supabase),
  ]);
  const content =
    locale === "pt"
      ? {
          trusted: "Confiado por 5.000+ familias",
          urgentTitle: "Pets urgentes",
          urgentSubtitle: "Estes amigos estao ha mais tempo a espera de um lar.",
          seeAll: "Ver todos",
          todayFound: `${totalPets} pets encontrados`,
          nearYou: "Na tua area hoje",
          howSubtitle:
            "Tres passos simples para encontrares o teu novo membro da familia com seguranca e acompanhamento.",
          footerTagline: "Ajudamos cada pet a encontrar um lar para sempre com cuidado e comunidade.",
          company: "Empresa",
          support: "Suporte",
          about: "Sobre",
          stories: "Historias",
          careers: "Carreiras",
          helpCenter: "Centro de ajuda",
          contact: "Contacto",
          privacy: "Privacidade",
          madeWithLove: "Feito com carinho pela FYA.",
          browseCatalog: "Explorar catalogo",
          learnMore: "Saber mais",
          sheltersTitle: "Canis",
          sheltersDescription: "Explora os nossos canis e abrigos parceiros.",
          sheltersCta: "Ver canis",
        }
      : {
          trusted: "Trusted by 5,000+ families",
          urgentTitle: "Urgent pets",
          urgentSubtitle: "These friends have been waiting the longest for a home.",
          seeAll: "See all",
          todayFound: `${totalPets} pets found`,
          nearYou: "In your area today",
          howSubtitle:
            "Three simple steps to bring your new family member home with confidence and guidance.",
          footerTagline: "Helping every pet find their forever home through care and community.",
          company: "Company",
          support: "Support",
          about: "About",
          stories: "Stories",
          careers: "Careers",
          helpCenter: "Help center",
          contact: "Contact",
          privacy: "Privacy policy",
          madeWithLove: "Made with love by FYA.",
          browseCatalog: "Browse catalog",
          learnMore: "Learn more",
          sheltersTitle: "Shelters",
          sheltersDescription: "Browse our partner shelters and rescues.",
          sheltersCta: "View shelters",
        };

  const steps = [
    { icon: Search, title: dictionary.home.steps.searchTitle, description: dictionary.home.steps.searchDescription },
    { icon: Users, title: dictionary.home.steps.connectTitle, description: dictionary.home.steps.connectDescription },
    { icon: ShieldCheck, title: dictionary.home.steps.adoptTitle, description: dictionary.home.steps.adoptDescription },
  ];

  return (
    <main className="w-full flex-1 pt-8 md:pt-12">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent-foreground">
            <Heart className="h-4 w-4 fill-current" />
            {content.trusted}
          </div>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight lg:text-7xl">
            {dictionary.home.title}{" "}
            <span className="text-secondary">{locale === "pt" ? "para toda a familia" : "for every family"}</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{dictionary.home.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/pets`}
              className="rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content.browseCatalog}
            </Link>
            <Link
              href={`/${locale}/auth/shelter-registration`}
              className="rounded-xl border border-border/60 bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {dictionary.home.primaryCta}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rotate-12 rounded-[57%_43%_61%_39%/45%_41%_59%_55%] bg-primary/10" />
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIgI4hK1OJrZt7EYogXqM0gNrsB9cteCk_tD7p7wfZ-_nWeAzyA80QW_vA-zbLGagTGGsyz5jIz0fP7Kdd8bCMlVQU-UeSZQqSO7-MLh4xqDtGATWAyVAzgJyQLSO2NcFE4SKC7v1tb9A5NY95NCjTY0-QBBoXwXZmjgG3ijmqAVvxQjZa9m8_RYbDtkHa03tjMxLSiXk9GnlzF1l3AkDmWbWjgiSmcJRFs_EP7tID8f-uVlTbZJqMpDRkbJ6Lej6seyDKHiGFnw8"
              alt={locale === "pt" ? "Cao e gato juntos" : "Dog and cat together"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-xl bg-card p-5 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{content.todayFound}</p>
              <p className="text-xs text-muted-foreground">{content.nearYou}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/45 px-6 py-20 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">{content.urgentTitle}</h2>
              <p className="mt-2 text-muted-foreground">{content.urgentSubtitle}</p>
            </div>
            <Link href={`/${locale}/pets`} className="hidden items-center gap-1 text-sm font-bold text-primary md:inline-flex">
              {content.seeAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {urgentPets.map((pet) => (
              <article
                key={pet.id}
                className="group overflow-hidden rounded-xl bg-card transition-all hover:-translate-y-1.5 hover:shadow-lg"
              >
                <div className="relative h-64">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {dictionary.petCatalog.tags.urgent}
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <h3 className="text-xl font-bold">{pet.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {pet.location}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pet.traits.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/${locale}/pets/${pet.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    {locale === "pt" ? `Conhecer ${pet.name}` : `Meet ${pet.name}`}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-24 text-center lg:px-8">
        <h2 className="text-4xl font-bold">{dictionary.home.howItWorksTitle}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{content.howSubtitle}</p>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="flex flex-col items-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary transition-transform hover:scale-110">
                  <Icon className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-8">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center overflow-hidden rounded-3xl bg-secondary p-12 text-center md:p-20">
          <div className="absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/2 rounded-[57%_43%_61%_39%/45%_41%_59%_55%] bg-white/10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white md:text-5xl">{dictionary.home.finalCtaTitle}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{dictionary.home.finalCtaDescription}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/pets`}
                className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-secondary transition-colors hover:bg-white/90"
              >
                {content.browseCatalog}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-xl border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {content.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 w-full border-t border-border/40 bg-muted/45">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-12 text-sm leading-relaxed md:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <span className="text-xl font-bold text-primary">FYA</span>
            <p className="max-w-xs text-muted-foreground">{content.footerTagline}</p>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{content.company}</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>{content.about}</li>
              <li>{content.stories}</li>
              <li>{content.careers}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{content.support}</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>{content.helpCenter}</li>
              <li>{content.contact}</li>
              <li>{content.privacy}</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold">{content.sheltersTitle}</h4>
            <p className="mb-4 text-muted-foreground">{content.sheltersDescription}</p>
            <Link
              href={`/${locale}/canis`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content.sheltersCta}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/30 px-6 py-6 text-xs text-muted-foreground/80 md:flex-row lg:px-8">
          <p>© 2026 FYA (Found Your Animal). {content.madeWithLove}</p>
          <div className="flex gap-6">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>X</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
