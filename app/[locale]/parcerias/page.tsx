import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "@/lib/records/validation";
import { PartnershipForm } from "@/components/partnership-form";
export const metadata = {
  title: "Parcerias com a FYA",
  description:
    "Marcas e organizações que querem ajudar animais e canis. Propõe uma parceria com a FYA.",
};
export default async function Partnerships({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ received?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt",
    { received } = await searchParams;
  return (
    <main id="main-content" className="page-shell space-y-10 py-10">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow">
          {pt ? "Marcas que fazem a diferença" : "Brands making a difference"}
        </p>
        <h1 className="page-title">
          {pt
            ? "Vamos ajudar mais animais, juntos."
            : "Let’s help more animals, together."}
        </h1>
        <p className="text-lg text-muted-foreground">
          {pt
            ? "Liga a tua marca à missão da FYA. Procuramos parcerias úteis para os canis, os animais e as famílias que os acolhem."
            : "Connect your brand with FYA’s mission through partnerships that help shelters, animals and adopting families."}
        </p>
        <Link
          href="#proposta"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 py-3 text-primary-foreground"
        >
          {pt ? "Propor uma parceria" : "Propose a partnership"}
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {(pt
          ? [
              [
                "Patrocínios",
                "Apoia iniciativas e projetos ligados ao bem-estar animal.",
              ],
              [
                "Produtos e serviços",
                "Disponibiliza alimentação, cuidados, transporte ou conhecimento.",
              ],
              [
                "Publicidade responsável",
                "Propõe uma presença de marca relevante, sempre identificada como patrocinada.",
              ],
            ]
          : [
              [
                "Sponsorships",
                "Support initiatives and projects for animal welfare.",
              ],
              [
                "Products and services",
                "Offer food, care, transport or expertise.",
              ],
              [
                "Responsible advertising",
                "Propose a relevant brand presence, clearly labelled as sponsored.",
              ],
            ]
        ).map(([title, body]) => (
          <section key={title} className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
      <section
        id="proposta"
        className="max-w-3xl scroll-mt-24 rounded-2xl border bg-card p-5 sm:p-8"
      >
        <h2 className="mb-3 text-2xl font-semibold">
          {pt ? "A tua proposta começa aqui" : "Your proposal starts here"}
        </h2>
        <p className="mb-6 text-muted-foreground">
          {pt
            ? "A equipa analisa cada proposta e poderá contactar-te por email. O envio não garante uma parceria nem publica publicidade automaticamente."
            : "Our team reviews each proposal and may contact you by email. Submission does not guarantee a partnership or automatically publish advertising."}
        </p>
        {received && validId(received) ? (
          <div role="status" className="space-y-3 rounded-xl bg-muted p-5">
            <p className="font-semibold">
              {pt
                ? "Proposta registada. Obrigado!"
                : "Proposal received. Thank you!"}
            </p>
            <p className="break-all text-sm">
              {pt ? "Guarda a referência:" : "Keep this reference:"} {received}
            </p>
            <Link className="underline" href={`/${locale}/parcerias`}>
              {pt ? "Enviar outra proposta" : "Submit another proposal"}
            </Link>
          </div>
        ) : (
          <PartnershipForm locale={locale} />
        )}
      </section>
    </main>
  );
}
