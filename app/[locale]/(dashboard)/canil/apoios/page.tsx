import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
import { SupportProjectForm } from "@/components/support-project-form";
import { supportAmount } from "@/lib/support/format";
export default async function Support({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt";
  if (!c.shelter)
    return (
      <main id="main-content">
        {pt
          ? "Seleciona um canil em Equipa e canis."
          : "Select a shelter in Team and shelters."}
      </main>
    );
  const [projects, animals, membership] = await Promise.all([
    c.supabase
      .from("support_projects")
      .select("*")
      .eq("canil_id", c.shelter.id)
      .order("created_at", { ascending: false })
      .limit(100),
    c.supabase
      .from("animais")
      .select("id,nome")
      .eq("canil_id", c.shelter.id)
      .is("archived_at", null)
      .order("nome"),
    c.supabase
      .from("shelter_memberships")
      .select("role")
      .eq("canil_id", c.shelter.id)
      .eq("profile_id", c.user.id)
      .maybeSingle(),
  ]);
  if (projects.error || animals.error || membership.error)
    throw new Error("Unable to load support");
  const edit =
    c.shelter.owner_profile_id === c.user.id ||
    membership.data?.role === "editor";
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Apoios e donativos" : "Support and donations"}
      </h1>
      <p>
        {pt
          ? "Campanhas, necessidades e registos de receção. Os pagamentos são feitos fora da FYA."
          : "Campaigns, needs and receipt records. Payments take place outside FYA."}
      </p>
      <Link
        className="underline"
        href={`/${locale}/canis/${c.shelter.id}/apoiar`}
      >
        {pt ? "Ver página pública de apoio" : "View public support page"}
      </Link>
      {(await searchParams).error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Verifica os dados, a verificação do canil e as permissões."
            : "Could not save. Check fields, shelter verification and permissions."}
        </p>
      )}
      <p className="text-sm">
        {pt
          ? "Até 100 apoios mais recentes."
          : "Up to 100 most recent projects."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.data?.map((p) => (
          <Link
            className="support-panel"
            key={p.id}
            href={`/${locale}/canil/apoios/${p.id}`}
          >
            <h2 className="text-xl font-bold">{p.title}</h2>
            <p>
              {p.published
                ? pt
                  ? "Publicado"
                  : "Published"
                : pt
                  ? "Rascunho"
                  : "Draft"}{" "}
              ·{" "}
              {p.status === "active"
                ? pt
                  ? "Ativo"
                  : "Active"
                : pt
                  ? "Fechado"
                  : "Closed"}
            </p>
            <p>
              {supportAmount(p.received, p.kind, p.unit, locale)} /{" "}
              {supportAmount(p.goal, p.kind, p.unit, locale)}
            </p>
          </Link>
        ))}
      </div>
      {edit && (
        <SupportProjectForm locale={locale} animals={animals.data ?? []} />
      )}
    </main>
  );
}
