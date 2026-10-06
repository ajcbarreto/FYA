import Link from "next/link";
import { supportAmount } from "@/lib/support/format";
import type { getPublicShelterExperience } from "@/lib/canil/public-experience";
type Experience = Awaited<ReturnType<typeof getPublicShelterExperience>>;
export function ShelterSupportOverview({
  data,
  locale,
  shelterId,
  donationUrl,
  donationMessage,
}: {
  data: Experience;
  locale: string;
  shelterId: string;
  donationUrl: string | null;
  donationMessage: string | null;
}) {
  const pt = locale === "pt";
  return (
    <section
      id="apoiar"
      aria-labelledby="shelter-support-title"
      className="scroll-mt-24 space-y-4 rounded-3xl border bg-card p-4 sm:p-6"
    >
      <p className="eyebrow">{pt ? "Como ajudar" : "How to help"}</p>
      <h2 id="shelter-support-title" className="text-2xl font-bold">
        {pt
          ? "Cada ajuda tem um destino."
          : "Every contribution has a purpose."}
      </h2>
      <p className="whitespace-pre-line break-words leading-relaxed text-muted-foreground">
        {donationMessage ||
          (pt
            ? "Conhece as necessidades do canil e escolhe como participar. Combina a entrega de bens ou serviços com a equipa."
            : "Explore the shelter’s needs and choose how to help. Arrange delivery of goods or services with the team.")}
      </p>
      {data.projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.projects.map((p) => {
            const open =
              p.status === "active" &&
              (!p.deadline ||
                p.deadline >= new Date().toISOString().slice(0, 10));
            const remaining = Math.max(0, p.goal - p.received);
            return (
              <article
                key={p.id}
                className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-background p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {p.kind === "money"
                    ? pt
                      ? "Donativo"
                      : "Donation"
                    : pt
                      ? "Bens ou serviços"
                      : "Goods or services"}{" "}
                  ·{" "}
                  {open
                    ? pt
                      ? "Ativa"
                      : "Active"
                    : pt
                      ? "Encerrada"
                      : "Closed"}
                </p>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <p className="font-semibold">
                  {supportAmount(p.received, p.kind, p.unit, locale)} /{" "}
                  {supportAmount(p.goal, p.kind, p.unit, locale)}
                </p>
                <progress
                  aria-label={`${pt ? "Progresso" : "Progress"}: ${p.title}`}
                  value={Math.min(p.received, p.goal)}
                  max={p.goal}
                  className="h-2 w-full accent-primary"
                />
                <p className="text-sm">
                  {remaining > 0
                    ? `${pt ? "Faltam" : "Remaining"} ${supportAmount(remaining, p.kind, p.unit, locale)}`
                    : pt
                      ? "Objetivo atingido"
                      : "Goal reached"}
                </p>
                {p.deadline && (
                  <p className="text-xs text-muted-foreground">
                    {pt ? "Até" : "Until"}{" "}
                    {new Date(p.deadline + "T12:00:00Z").toLocaleDateString(
                      locale,
                      { timeZone: "UTC" },
                    )}
                  </p>
                )}
                <Link
                  href={`/${locale}/apoios/${p.id}`}
                  className="button-secondary mt-auto"
                >
                  {open
                    ? p.kind === "money"
                      ? pt
                        ? "Ver como contribuir"
                        : "See how to contribute"
                      : pt
                        ? "Oferecer ajuda"
                        : "Offer help"
                    : pt
                      ? "Ver resultados"
                      : "View results"}
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-muted p-4">
          <p>
            {pt
              ? "Fala com a equipa para saber quais são as necessidades atuais."
              : "Ask the team about their current needs."}
          </p>
          <a
            href="#contactos"
            className="mt-3 inline-flex min-h-11 items-center font-semibold underline"
          >
            {pt ? "Contactar o canil" : "Contact the shelter"}
          </a>
        </div>
      )}
      {data.projects.length > 0 && (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {pt
              ? "Totais recebidos e confirmados manualmente pelo canil. Promessas não contam como entregas; a FYA não verifica pagamentos automaticamente."
              : "Totals are manually confirmed by the shelter. Promises are not deliveries; FYA does not automatically verify payments."}
          </p>
          <Link
            href={`/${locale}/canis/${shelterId}/apoiar`}
            className="inline-flex min-h-11 items-center font-semibold underline"
          >
            {pt
              ? "Ver todas as campanhas e necessidades"
              : "View all campaigns and needs"}
          </Link>
        </>
      )}
      {donationUrl?.startsWith("https://") && (
        <div className="border-t pt-4">
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary"
          >
            {pt
              ? "Apoiar o canil na página de donativos ↗"
              : "Support the shelter on its donation page ↗"}
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            {pt
              ? "Abre um site externo. O pagamento e o comprovativo são tratados com o canil."
              : "Opens an external site. Arrange payment and receipts with the shelter."}
          </p>
        </div>
      )}
    </section>
  );
}
export function ShelterNews({
  data,
  locale,
}: {
  data: Experience;
  locale: string;
}) {
  const pt = locale === "pt";
  const items = [
    ...data.news.map((n) => ({ ...n, href: null as string | null })),
    ...data.updates.map((u) => ({
      ...u,
      title:
        data.projects.find((p) => p.id === u.project_id)?.title ??
        (pt ? "Atualização de apoio" : "Support update"),
      href: `/${locale}/apoios/${u.project_id}`,
    })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);
  if (!items.length) return null;
  return (
    <section
      id="novidades"
      className="scroll-mt-24 space-y-4 rounded-3xl border bg-card p-4 sm:p-6"
    >
      <h2 className="text-xl font-bold">
        {pt ? "Novidades e impacto" : "News and impact"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {pt
          ? "As cinco atualizações mais recentes do canil e das campanhas em destaque."
          : "The five latest updates from the shelter and featured campaigns."}
      </p>
      {items.map((n) => (
        <article key={n.id} className="rounded-2xl bg-muted/60 p-4">
          <time
            dateTime={n.created_at}
            className="text-xs text-muted-foreground"
          >
            {new Date(n.created_at).toLocaleDateString(locale)}
          </time>
          <h3 className="mt-2 font-bold">{n.title}</h3>
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
            {n.body}
          </p>
          {n.href && (
            <Link
              href={n.href}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline"
            >
              {pt ? "Ver campanha" : "View campaign"}
            </Link>
          )}
        </article>
      ))}
    </section>
  );
}
