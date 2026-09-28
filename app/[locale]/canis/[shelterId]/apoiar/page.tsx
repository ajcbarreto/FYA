import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "@/lib/records/validation";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { supportAmount } from "@/lib/support/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; shelterId: string }>;
}) {
  const { locale, shelterId } = await params;
  if (!isLocale(locale) || !validId(shelterId)) return {};
  const { data: shelter } = await createPublicSupabaseClient(
    supabaseUrl,
    supabasePublishableKey,
  )
    .from("canis")
    .select("id,nome,localizacao")
    .eq("id", shelterId)
    .maybeSingle();
  if (!shelter) return {};
  const pt = locale === "pt";
  return pageMetadata({
    locale,
    path: `/canis/${shelter.id}/apoiar`,
    title: pt ? `Apoiar ${shelter.nome}` : `Support ${shelter.nome}`,
    description: pt
      ? `Campanhas e necessidades de ${shelter.nome} (${shelter.localizacao}): alimentação, cuidados veterinários e outros apoios que podes dar a este canil.`
      : `Campaigns and needs of ${shelter.nome} (${shelter.localizacao}): food, veterinary care and other support you can give this shelter.`,
  });
}
export default async function ShelterSupport({
  params,
}: {
  params: Promise<{ locale: string; shelterId: string }>;
}) {
  const { locale, shelterId } = await params;
  if (!isLocale(locale) || !validId(shelterId)) notFound();
  const pt = locale === "pt",
    db = createPublicSupabaseClient(supabaseUrl, supabasePublishableKey);
  const { data: s } = await db
    .from("canis")
    .select("nome,verificado")
    .eq("id", shelterId)
    .single();
  if (!s?.verificado) notFound();
  const { data, error } = await db
    .from("support_projects")
    .select("*")
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load support");
  return (
    <main id="main-content" className="page-shell space-y-6">
      <Breadcrumbs
        locale={locale}
        items={[
          sectionCrumb(locale, "shelters"),
          { label: s.nome, path: `/canis/${shelterId}` },
          { label: pt ? "Apoiar" : "Support" },
        ]}
        currentPath={`/canis/${shelterId}/apoiar`}
      />
      <header className="rounded-3xl bg-primary p-8 text-primary-foreground">
        <h1 className="page-title">
          {pt ? "Apoiar este canil" : "Support this shelter"}
        </h1>
        <p className="mt-3">{s.nome}</p>
      </header>
      <p>
        {pt
          ? "Conhece as campanhas e necessidades. Os totais são confirmados manualmente pelo canil; os pagamentos acontecem fora da FYA."
          : "Explore campaigns and needs. Totals are manually confirmed by the shelter; payments take place outside FYA."}
      </p>
      {!data?.length && (
        <p>
          {pt
            ? "Não há campanhas ou necessidades publicadas. Contacta o canil para saber como ajudar."
            : "There are no published campaigns or needs. Contact the shelter to learn how to help."}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {data?.map((p) => (
          <Link
            key={p.id}
            className="space-y-3 rounded-2xl border bg-card p-6"
            href={`/${locale}/apoios/${p.id}`}
          >
            <p className="text-sm">
              {p.kind === "money"
                ? pt
                  ? "Donativos"
                  : "Donations"
                : pt
                  ? "Bens ou serviços"
                  : "Goods or services"}{" "}
              ·{" "}
              {p.status === "closed"
                ? pt
                  ? "Fechado"
                  : "Closed"
                : p.deadline &&
                    p.deadline < new Date().toISOString().slice(0, 10)
                  ? pt
                    ? "Prazo terminado"
                    : "Deadline passed"
                  : pt
                    ? "Em curso"
                    : "Open"}
            </p>
            <h2 className="text-2xl font-bold">{p.title}</h2>
            <p>{p.description.slice(0, 180)}</p>
            <p className="font-semibold">
              {supportAmount(p.received, p.kind, p.unit, locale)} /{" "}
              {supportAmount(p.goal, p.kind, p.unit, locale)}
            </p>
            <progress
              className="w-full"
              aria-label={
                pt
                  ? "Progresso confirmado pelo canil"
                  : "Progress confirmed by shelter"
              }
              value={Math.min(p.received, p.goal)}
              max={p.goal}
            />
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {pt
          ? "Até 100 campanhas e necessidades mais recentes."
          : "Up to 100 most recent campaigns and needs."}
      </p>
    </main>
  );
}
