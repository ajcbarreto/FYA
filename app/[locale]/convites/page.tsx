import { recordsContext } from "@/lib/records/context";
import { acceptInvitation } from "@/app/records/operations-actions";
import { SubmitButton } from "@/components/submit-button";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "invitations", "/convites");
}
export default async function Invitations({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt";
  const { data, error } = await c.supabase
    .from("shelter_invitations")
    .select("id,role,expires_at,canis(nome)")
    .eq("email", c.user.email!.toLowerCase())
    .gt("expires_at", new Date().toISOString());
  if (error) throw new Error("Unable to load invitations");
  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl space-y-6 p-8">
      <h1 className="page-title">
        {pt ? "Os teus convites" : "Your invitations"}
      </h1>
      {!data?.length && (
        <p>{pt ? "Não tens convites pendentes." : "No pending invitations."}</p>
      )}
      {data?.map((i) => (
        <form
          key={i.id}
          action={acceptInvitation}
          className="rounded-2xl border border-border p-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="invitationId" value={i.id} />
          <p>
            {i.canis?.nome} · {i.role}
          </p>
          <SubmitButton className="rounded-full bg-primary px-5 py-2 text-primary-foreground">
            {pt ? "Aceitar convite" : "Accept invitation"}
          </SubmitButton>
        </form>
      ))}
    </main>
  );
}
