import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { PageHeader } from "@/components/page-header";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale).legal;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <PageHeader eyebrow={t.termsLastUpdated} title={t.termsTitle} subtitle={t.termsSubtitle} />

      <section className="mt-8 space-y-8">
        {t.termsSections.map((entry) => (
          <article key={entry.heading} className="space-y-2">
            <h2 className="text-lg font-bold">{entry.heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
