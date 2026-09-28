import Link from "next/link";
import { notFound } from "next/navigation";
import { helpGuides } from "@/lib/help/guides";
import { isLocale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { describe } from "@/lib/seo/site";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const guide = helpGuides(locale).find((g) => g.slug === slug);
  if (!guide) return {};
  return pageMetadata({
    locale,
    path: `/ajuda/${guide.slug}`,
    title:
      locale === "pt"
        ? `${guide.title}: guia para canis`
        : `${guide.title}: guide for shelters`,
    description: describe(
      guide.summary,
      locale === "pt"
        ? "Passos detalhados e perguntas frequentes no centro de ajuda da FYA para canis e associações."
        : "Detailed steps and frequently asked questions in the FYA help centre for shelters and rescue groups.",
    ),
    type: "article",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt",
    g = helpGuides(locale).find((g) => g.slug === slug);
  if (!g) notFound();
  return (
    <main id="main-content" className="page-shell max-w-4xl space-y-7">
      <Link href={`/${locale}/ajuda`} className="underline">
        ← {pt ? "Centro de ajuda" : "Help centre"}
      </Link>
      <header>
        <p className="text-sm text-muted-foreground">{g.minutes} min</p>
        <h1 className="display-title mt-2 text-4xl">{g.title}</h1>
        <p className="mt-4 text-lg">{g.summary}</p>
      </header>
      {g.video ? (
        <video controls preload="metadata" className="w-full rounded-2xl">
          <source src={g.video.src} />
          <track
            kind="captions"
            src={g.video.captions}
            srcLang={locale}
            label={pt ? "Português" : "English"}
            default
          />
        </video>
      ) : (
        <p className="rounded-xl bg-muted p-4 text-sm">
          {pt
            ? "O vídeo ainda está a ser preparado. Os passos estão descritos abaixo."
            : "The video is still being prepared. The steps are described below."}
        </p>
      )}
      <ol className="list-decimal space-y-5 pl-6">
        {g.steps.map((step) => (
          <li key={step} className="pl-2 leading-7">
            {step}
          </li>
        ))}
      </ol>
      <Link
        className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
        href={`/${locale}/${g.destination}`}
      >
        {pt ? "Abrir na FYA" : "Open in FYA"}
      </Link>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">
          {pt ? "Perguntas frequentes" : "Frequently asked questions"}
        </h2>
        {g.faq.map(([q, a]) => (
          <details key={q} className="rounded-xl border p-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-3 leading-7">{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
