import { HelpLink } from "@/components/help-link";
import { HandoverChecklist } from "@/components/handover-checklist";
import Link from "next/link";
import { recordsContext } from "@/lib/records/context";
import {
  selectShelter,
  inviteMember,
  removeMember,
  cancelInvitation,
} from "@/app/records/operations-actions";
import { SubmitButton } from "@/components/submit-button";
export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    feedback = await searchParams;
  if (!c.shelter)
    return (
      <main id="main-content">
        <Link href={`/${locale}/convites`}>
          {pt ? "Ver convites" : "View invitations"}
        </Link>
      </main>
    );
  const [{ data: members, error }, { data: invites, error: ie }] =
    await Promise.all([
      c.supabase
        .from("shelter_memberships")
        .select("profile_id,role,profiles(full_name,email)")
        .eq("canil_id", c.shelter.id),
      c.supabase
        .from("shelter_invitations")
        .select("*")
        .eq("canil_id", c.shelter.id),
    ]);
  if (error || ie) throw new Error("Unable to load team");
  const owner = c.shelter.owner_profile_id === c.user.id,
    hidden = <input type="hidden" name="locale" value={locale} />,
    box = "rounded-2xl border border-border p-6 space-y-4",
    button =
      "rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground",
    input = "field";
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Equipa e canis" : "Team and shelters"}
      </h1>
      <HelpLink locale={locale} guide="equipa-tarefas-visitas" />
      {feedback.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {feedback.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Verifica as permissões e se já existe um convite para este email."
            : "Could not save. Check permissions and existing invitations."}
        </p>
      )}
      <form action={selectShelter} className={box}>
        {hidden}
        <label>
          {pt ? "Canil ativo" : "Active shelter"}
          <select
            name="shelterId"
            defaultValue={c.shelter.id}
            className={input}
          >
            {c.shelters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton className={button}>
          {pt ? "Mudar canil" : "Switch shelter"}
        </SubmitButton>
      </form>
      <section className={box}>
        <h2 className="font-bold">{c.shelter.nome}</h2>
        <p>
          {pt
            ? "O responsável mantém a gestão dos acessos e configurações. Colaboradores podem editar; leitores apenas consultar."
            : "The owner manages access and settings. Editors can make changes; readers can only view."}
        </p>
        {members?.map((m) => (
          <div
            key={m.profile_id}
            className="flex flex-wrap justify-between gap-3"
          >
            <p>
              {m.profiles?.full_name} · {m.profiles?.email} · {m.role}
            </p>
            {owner && (
              <form action={removeMember}>
                {hidden}
                <input type="hidden" name="profileId" value={m.profile_id} />
                <SubmitButton className="text-destructive">
                  {pt ? "Remover acesso" : "Remove access"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
      {owner && (
        <form action={inviteMember} className={box}>
          {hidden}
          <h2 className="font-bold">
            {pt ? "Convidar pessoa" : "Invite a person"}
          </h2>
          <p>
            {pt
              ? "O convite fica disponível na conta correspondente ao email. Partilha com a pessoa o endereço da página de convites."
              : "The invitation is available in the account matching this email. Share the invitations page address with the person."}
          </p>
          <label>
            Email
            <input className={input} name="email" type="email" required />
          </label>
          <label>
            {pt ? "Permissão" : "Permission"}
            <select className={input} name="role">
              <option value="editor">{pt ? "Colaborador" : "Editor"}</option>
              <option value="reader">{pt ? "Leitura" : "Reader"}</option>
            </select>
          </label>
          <SubmitButton className={button}>
            {pt ? "Criar convite" : "Create invitation"}
          </SubmitButton>
        </form>
      )}
      {owner && (
        <HandoverChecklist
          supabase={c.supabase}
          shelterId={c.shelter.id}
          locale={locale}
          settingsOnly
        />
      )}
      <section className={box}>
        <Link className="underline" href={`/${locale}/convites`}>
          {pt ? "Página de convites" : "Invitations page"}
        </Link>
        {invites?.map((i) => (
          <div key={i.id} className="flex flex-wrap justify-between gap-3">
            <p>
              {i.email} · {new Date(i.expires_at).toLocaleDateString(locale)}
            </p>
            {owner && (
              <form action={cancelInvitation}>
                {hidden}
                <input type="hidden" name="invitationId" value={i.id} />
                <SubmitButton className="text-destructive">
                  {pt ? "Cancelar convite" : "Cancel invitation"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
