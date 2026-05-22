import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { PageHeader } from "@/components/page-header";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale).legal;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <PageHeader eyebrow={t.privacyLastUpdated} title={t.privacyTitle} subtitle={t.privacySubtitle} />

      <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {t.privacyDisclaimer}
      </p>

      <section className="mt-8 space-y-8">
        {t.privacySections.map((entry) => (
          <article key={entry.heading} className="space-y-2">
            <h2 className="text-lg font-bold">{entry.heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
