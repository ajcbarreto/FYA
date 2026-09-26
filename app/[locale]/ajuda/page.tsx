import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { searchGuides } from "@/lib/help/guides";
export const metadata = {
  title: "Ajuda · Help | FYA",
  description:
    "Guias para registos, documentos, candidaturas e trabalho em equipa na FYA.",
};
export default async function Help({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt",
    q = (await searchParams).q?.slice(0, 160) ?? "",
    guides = searchGuides(locale, q);
  return (
    <main id="main-content" className="page-shell space-y-8">
      <header className="rounded-3xl bg-primary p-8 text-primary-foreground">
        <p className="text-sm font-semibold">
          FYA · {pt ? "Aprender fazendo" : "Learn by doing"}
        </p>
        <h1 className="display-title my-3 text-4xl">
          {pt ? "Como podemos ajudar?" : "How can we help?"}
        </h1>
        <p>
          {pt
            ? "Guias curtos para cuidar dos registos e simplificar o trabalho da equipa."
            : "Short guides to keep records organised and simplify team work."}
        </p>
      </header>
      <form className="flex flex-wrap gap-3" method="get">
        <label className="grow">
          {pt ? "Pesquisar ajuda" : "Search help"}
          <input
            name="q"
            type="search"
            maxLength={160}
            defaultValue={q}
            className="mt-1 block w-full rounded-xl border bg-background p-3"
            placeholder={
              pt
                ? "Ex.: documentos, microchip, visitas"
                : "E.g. documents, microchip, visits"
            }
          />
        </label>
        <button className="self-end rounded-full bg-primary px-6 py-3 text-primary-foreground">
          {pt ? "Pesquisar" : "Search"}
        </button>
      </form>
      <p role="status">
        {guides.length} {pt ? "guias encontrados" : "guides found"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/${locale}/ajuda/${g.slug}`}
            className="rounded-2xl border bg-card p-6 hover:border-primary"
          >
            <p className="text-sm text-muted-foreground">
              {g.minutes} min ·{" "}
              {pt ? "Guia passo a passo" : "Step-by-step guide"}
            </p>
            <h2 className="my-2 text-xl font-bold">{g.title}</h2>
            <p>{g.summary}</p>
          </Link>
        ))}
      </div>
      {!guides.length && (
        <p>
          {pt
            ? "Experimenta outra palavra, como animal, equipa ou adoção."
            : "Try another word, such as animal, team or adoption."}
        </p>
      )}
      <aside className="rounded-2xl bg-muted p-6">
        <h2 className="font-bold">
          {pt ? "A começar com o teu canil?" : "Getting your shelter started?"}
        </h2>
        <Link
          className="mt-2 inline-block underline"
          href={`/${locale}/canil/primeiros-passos`}
        >
          {pt ? "Abrir primeiros passos" : "Open getting started"}
        </Link>
        <p className="mt-3 text-sm">
          {pt
            ? "Os vídeos estão em preparação. Todos os passos já estão disponíveis por escrito."
            : "Videos are in preparation. All steps are already available in writing."}
        </p>
      </aside>
    </main>
  );
}
