import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "@/lib/records/validation";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getPetById } from "@/lib/pet-catalog/db-pets";
import { supportAmount } from "@/lib/support/format";
import { pledgeSupport } from "@/app/support/actions";
import { SubmitButton } from "@/components/submit-button";
import { pageMetadata } from "@/lib/seo/metadata";
import { describe } from "@/lib/seo/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  if (!isLocale(locale) || !validId(projectId)) return {};
  const { data: project } = await createPublicSupabaseClient(
    supabaseUrl,
    supabasePublishableKey,
  )
    .from("support_projects")
    .select("id,title,description,canis(nome)")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return {};
  const shelter = Array.isArray(project.canis)
    ? project.canis[0]?.nome
    : project.canis?.nome;
  const pt = locale === "pt";
  return pageMetadata({
    locale,
    path: `/apoios/${project.id}`,
    title: shelter ? `${project.title}, ${shelter}` : project.title,
    description: describe(
      project.description,
      pt
        ? "Campanha de apoio de um canil na FYA: objetivo, valor já recebido e como ajudar."
        : "Support campaign from a shelter on FYA: the goal, what has been received and how to help.",
    ),
    type: "article",
  });
}
export default async function PublicSupport({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale, projectId } = await params;
  if (!isLocale(locale) || !validId(projectId)) notFound();
  const pt = locale === "pt",
    db = createPublicSupabaseClient(supabaseUrl, supabasePublishableKey);
  const { data: p, error } = await db
    .from("support_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new Error("Unable to load campaign");
  if (!p) notFound();
  const [{ data: s, error: se }, { data: updates, error: ue }, { user }, pet] =
    await Promise.all([
      db
        .from("canis")
        .select("nome,donation_url,image_url")
        .eq("id", p.canil_id)
        .single(),
      db
        .from("support_updates")
        .select("*")
        .eq("project_id", p.id)
        .order("created_at", { ascending: false })
        .limit(50),
      getAuthUser(),
      p.animal_id ? getPetById(db, p.animal_id, locale) : Promise.resolve(null),
    ]);
  if (se || ue || !s) throw new Error("Unable to load campaign details");
  const search = await searchParams,
    open =
      p.status === "active" &&
      (!p.deadline || p.deadline >= new Date().toISOString().slice(0, 10)),
    url = p.donation_url || s.donation_url,
    photo = pet?.imageUrl || s.image_url;
  return (
    <main id="main-content" className="page-shell max-w-4xl space-y-6">
      <Link
        className="underline"
        href={`/${locale}/canis/${p.canil_id}/apoiar`}
      >
        ← {s.nome}
      </Link>
      <h1 className="page-title">{p.title}</h1>
      {photo && (
        <div className="relative h-72 overflow-hidden rounded-3xl">
          <Image
            src={photo}
            alt={pet?.name ?? s.nome}
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      )}
      {pet && (
        <Link
          className="inline-block underline"
          href={`/${locale}/pets/${pet.id}`}
        >
          {pt ? "Conhecer" : "Meet"} {pet.name}
        </Link>
      )}
      <p className="whitespace-pre-wrap leading-7">{p.description}</p>
      <section className="space-y-3 rounded-2xl bg-muted p-6">
        <p className="text-2xl font-bold">
          {supportAmount(p.received, p.kind, p.unit, locale)} /{" "}
          {supportAmount(p.goal, p.kind, p.unit, locale)}
        </p>
        <progress
          aria-label={
            pt
              ? "Progresso confirmado pelo canil"
              : "Progress confirmed by shelter"
          }
          className="w-full"
          value={Math.min(p.received, p.goal)}
          max={p.goal}
        />
        <p className="font-semibold">
          {pt
            ? "Recebido e confirmado pelo canil"
            : "Received and confirmed by the shelter"}
        </p>
        <p className="text-sm">
          {pt
            ? "Este total é registado pela equipa. A FYA não confirma pagamentos automaticamente nem emite comprovativos fiscais."
            : "This total is recorded by the team. FYA does not automatically verify payments or issue tax receipts."}
        </p>
        {p.deadline && (
          <p>
            {pt ? "Até" : "Until"} {p.deadline}
          </p>
        )}
        {!open && (
          <p className="font-bold">
            {pt
              ? "Apoio fechado ou prazo terminado."
              : "Support closed or deadline passed."}
          </p>
        )}
      </section>
      {search.success && (
        <p role="status">
          {pt
            ? "Promessa registada. Combina a entrega com o canil; o total só muda após confirmação."
            : "Promise recorded. Arrange delivery with the shelter; the total changes only after confirmation."}
        </p>
      )}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível registar a promessa. Verifica os dados ou tenta mais tarde."
            : "Could not record the promise. Check details or try later."}
        </p>
      )}
      {open &&
        p.kind === "money" &&
        (url ? (
          <div>
            <a
              className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {pt ? "Doar na página do canil" : "Donate on the shelter page"} ↗
            </a>
            <p className="mt-3 text-sm">
              {pt
                ? "O pagamento acontece fora da FYA. Contacta o canil sobre identificação da campanha e comprovativos. Clicar nesta ligação não altera o total."
                : "Payment happens outside FYA. Contact the shelter about campaign identification and receipts. Clicking this link does not change the total."}
            </p>
          </div>
        ) : (
          <p>
            {pt
              ? "Contacta o canil para combinar o apoio. Ainda não foi indicada uma ligação de pagamento."
              : "Contact the shelter to arrange support. No payment link is configured yet."}
          </p>
        ))}
      {open &&
        p.kind === "goods" &&
        (user ? (
          <form action={pledgeSupport} className="support-panel support-form">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="projectId" value={p.id} />
            <input type="hidden" name="pledgeId" value={randomUUID()} />
            <h2 className="text-xl font-bold">
              {pt ? "Quero ajudar" : "I want to help"}
            </h2>
            <label className="block">
              {pt ? "Quantidade" : "Quantity"} ({p.unit})
              <input
                type="number"
                name="quantity"
                min={1}
                max={1000000}
                required
                className="field"
              />
            </label>
            <label className="block">
              {pt
                ? "Mensagem privada ao canil (opcional)"
                : "Private message to the shelter (optional)"}
              <textarea name="message" maxLength={1000} className="field" />
            </label>
            <label className="flex gap-3">
              <input type="checkbox" name="contact_consent" required />
              <span>
                {pt
                  ? "Partilhar o nome e email da minha conta com este canil para combinar a entrega."
                  : "Share my account name and email with this shelter to arrange delivery."}
              </span>
            </label>
            <p className="text-sm">
              {pt
                ? "Uma promessa não reserva a necessidade nem conta como entrega. Confirma os detalhes com o canil antes de te deslocares."
                : "A promise does not reserve the need or count as delivery. Confirm details with the shelter before travelling."}
            </p>
            <SubmitButton className="button-primary">
              {pt ? "Registar promessa de ajuda" : "Record support promise"}
            </SubmitButton>
          </form>
        ) : (
          <Link
            className="inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground"
            href={`/${locale}/auth/login?next=${encodeURIComponent(`/apoios/${p.id}`)}`}
          >
            {pt ? "Entrar para oferecer ajuda" : "Sign in to offer help"}
          </Link>
        ))}
      <Link
        href={`/${locale}/canis/${p.canil_id}`}
        className="inline-block underline"
      >
        {pt ? "Contactos do canil" : "Shelter contacts"}
      </Link>
      {user && (
        <Link
          className="ml-5 inline-block underline"
          href={`/${locale}/conta/apoios`}
        >
          {pt ? "As minhas promessas de ajuda" : "My support promises"}
        </Link>
      )}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">
          {pt ? "Atualizações do canil" : "Shelter updates"}
        </h2>
        {!updates?.length && (
          <p>{pt ? "Ainda não há atualizações." : "No updates yet."}</p>
        )}
        {updates?.map((u) => (
          <article key={u.id} className="support-panel">
            <time className="text-sm">
              {new Date(u.created_at).toLocaleDateString(locale)}
            </time>
            <p className="mt-3 whitespace-pre-wrap">{u.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
