import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
export default async function GettingStarted({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt";
  if (!c.shelter)
    return (
      <main id="main-content">
        <h1>{pt ? "Primeiros passos" : "Getting started"}</h1>
        <Link href={`/${locale}/convites`}>
          {pt ? "Aceitar convite de equipa" : "Accept a team invitation"}
        </Link>
      </main>
    );
  const shelter = c.shelter;
  const results = await Promise.all([
    c.supabase
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("canil_id", shelter.id)
      .is("archived_at", null),
    c.supabase
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("canil_id", shelter.id)
      .eq("published", true)
      .is("archived_at", null),
    c.supabase
      .from("shelter_memberships")
      .select("profile_id", { count: "exact", head: true })
      .eq("canil_id", shelter.id),
    c.supabase
      .from("shelter_invitations")
      .select("id", { count: "exact", head: true })
      .gt("expires_at", new Date().toISOString())
      .eq("canil_id", shelter.id),
  ]);
  if (results.some((r) => r.error))
    throw new Error("Unable to load onboarding");
  const steps = [
    {
      done: Boolean(
        shelter.nome.trim() &&
        shelter.localizacao.trim() &&
        shelter.missao?.trim() &&
        shelter.email_contacto?.trim(),
      ),
      title: pt
        ? "Completar o perfil do canil"
        : "Complete your shelter profile",
      description: pt
        ? "Nome, localização, missão e email de contacto."
        : "Name, location, mission and contact email.",
      href: "canil/perfil",
    },
    {
      done: Boolean(shelter.verificado),
      title: pt ? "Verificação do canil" : "Shelter verification",
      description: pt
        ? "A administração verifica o canil antes de permitir a publicação. Podes preparar os registos entretanto."
        : "An administrator verifies the shelter before publication. You can prepare records while waiting.",
      href: "canil/perfil",
    },
    {
      done: (results[0].count ?? 0) > 0,
      title: pt ? "Registar o primeiro animal" : "Register your first animal",
      description: pt
        ? "Cria a ficha ou importa os dados por CSV."
        : "Create a profile or import your data with CSV.",
      href: "canil/animais",
    },
    {
      done: Boolean(shelter.verificado) && (results[1].count ?? 0) > 0,
      title: pt ? "Publicar o primeiro anúncio" : "Publish your first listing",
      description: pt
        ? "Revê os dados públicos, junta uma fotografia e publica nos Registos."
        : "Review public details, add a photo and publish in Records.",
      href: "canil/animais",
    },
    {
      done: (results[2].count ?? 0) + (results[3].count ?? 0) > 0,
      title: pt
        ? "Convidar a equipa (opcional)"
        : "Invite your team (optional)",
      description: pt
        ? "Envia um convite dentro da FYA ou adiciona membros com contas individuais."
        : "Create an in-app invitation for team members with individual accounts.",
      href: "canil/equipa",
    },
  ];
  const required = steps.slice(0, 4),
    done = required.filter((s) => s.done).length;
  return (
    <main id="main-content" className="space-y-6">
      <header className="rounded-3xl bg-primary p-7 text-primary-foreground">
        <p>{shelter.nome}</p>
        <h1 className="display-title my-3 text-4xl">
          {pt ? "Primeiros passos" : "Getting started"}
        </h1>
        <p>
          {pt
            ? "A tua base para trabalhar em equipa e dar a conhecer os animais."
            : "Your foundation for team work and introducing your animals."}
        </p>
        <label className="mt-5 block">
          {done} / 4{" "}
          {pt ? "passos essenciais concluídos" : "essential steps complete"}
          <progress
            aria-label={
              pt ? "Progresso dos primeiros passos" : "Getting started progress"
            }
            value={done}
            max={4}
            className="mt-2 block w-full"
          />
        </label>
      </header>
      <p className="text-sm text-muted-foreground">
        {pt
          ? "O progresso é calculado a partir dos dados reais do canil."
          : "Progress is calculated from your shelter’s actual data."}
      </p>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.href + i}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
          >
            <div>
              <p className="text-sm font-semibold text-primary">
                {s.done
                  ? pt
                    ? "Concluído"
                    : "Complete"
                  : pt
                    ? "Por fazer"
                    : "To do"}
              </p>
              <h2 className="text-xl font-bold">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm">{s.description}</p>
            </div>
            <Link
              href={`/${locale}/${s.href}`}
              className="rounded-full border px-4 py-2"
            >
              {s.done ? (pt ? "Rever" : "Review") : pt ? "Abrir" : "Open"}
            </Link>
          </li>
        ))}
      </ol>
      <Link className="inline-block underline" href={`/${locale}/ajuda`}>
        {pt ? "Consultar os guias de ajuda" : "Browse help guides"}
      </Link>
    </main>
  );
}
