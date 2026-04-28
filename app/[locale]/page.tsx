import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

type LocalizedHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedHomePage({ params }: LocalizedHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const featureItems = [
    {
      title: dictionary.home.features.adopterTitle,
      description: dictionary.home.features.adopterDescription,
    },
    {
      title: dictionary.home.features.shelterTitle,
      description: dictionary.home.features.shelterDescription,
    },
    {
      title: dictionary.home.features.secureTitle,
      description: dictionary.home.features.secureDescription,
    },
  ];

  const steps = [
    {
      title: dictionary.home.steps.searchTitle,
      description: dictionary.home.steps.searchDescription,
    },
    {
      title: dictionary.home.steps.connectTitle,
      description: dictionary.home.steps.connectDescription,
    },
    {
      title: dictionary.home.steps.adoptTitle,
      description: dictionary.home.steps.adoptDescription,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 md:gap-16 md:py-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-muted/70 via-background to-muted/30 p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-secondary/20 blur-2xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
          {dictionary.home.eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          {dictionary.home.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{dictionary.home.subtitle}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href={`/${locale}/auth/shelter-registration`}>{dictionary.home.primaryCta}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-border/70 bg-background/80 px-7">
            <Link href={`/${locale}/user`}>{dictionary.home.secondaryCta}</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-5 md:space-y-7">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{dictionary.home.featureTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featureItems.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/40 transition-colors hover:bg-card/90"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5 md:space-y-7">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{dictionary.home.howItWorksTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className={`rounded-[1.75rem] p-6 ${index === 1 ? "bg-muted/80 md:-translate-y-2" : "bg-muted/55"}`}
            >
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground md:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-foreground/10 blur-xl" />
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">{dictionary.home.finalCtaTitle}</h2>
        <p className="mt-3 max-w-2xl text-primary-foreground/90">{dictionary.home.finalCtaDescription}</p>
        <Button
          asChild
          className="mt-6 rounded-full bg-background px-7 text-foreground shadow-sm hover:bg-background/90"
        >
          <Link href={`/${locale}/auth/register`}>{dictionary.home.finalCtaButton}</Link>
        </Button>
      </section>
    </main>
  );
}
