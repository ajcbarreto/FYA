import Link from "next/link";
import { notFound } from "next/navigation";
import { contactContext } from "@/lib/contact/context";
import { validId } from "@/lib/records/validation";
import { SubmitButton } from "@/components/submit-button";
import { submitHelp, updateContact } from "@/app/contact/actions";
import {
  statuses,
  categories,
  helpCategories,
  helpStatuses,
  partnershipStatuses,
  label,
  inputClass,
  buttonClass,
} from "@/lib/contact/config";
export type ContactSearch = {
  id?: string;
  kind?: string;
  status?: string;
  page?: string;
  success?: string;
  error?: string;
  history?: string;
};
export async function ContactInbox({
  locale,
  admin,
  search,
}: {
  locale: string;
  admin: boolean;
  search: ContactSearch;
}) {
  const c = await contactContext(locale, admin),
    pt = locale === "pt",
    path = `/${locale}/${admin ? "admin/contactos" : "canil/ajuda-fya"}`;
  if (!c.ready)
    return (
      <main id="main-content" className="space-y-4">
        <h1 className="page-title">
          {pt ? "Contactos com a FYA" : "Contact FYA"}
        </h1>
        <p>
          {pt
            ? "Esta área ainda não está disponível. Tenta novamente mais tarde."
            : "This area is not available yet. Please try again later."}
        </p>
      </main>
    );
  if (search.id) {
    if (!validId(search.id)) notFound();
    const { data: r, error } = await c.supabase
      .from("contact_requests")
      .select("*")
      .eq("id", search.id)
      .maybeSingle();
    if (error) throw error;
    if (!r) notFound();
    const historyPage = Math.min(
      10000,
      Math.max(1, Number.parseInt(search.history ?? "1", 10) || 1),
    );
    const {
      data: events,
      error: eventError,
      count,
    } = await c.supabase
      .from("contact_request_events")
      .select("*", { count: "exact" })
      .eq("request_id", r.id)
      .order("created_at", { ascending: false })
      .order("id")
      .range((historyPage - 1) * 25, historyPage * 25 - 1);
    if (eventError) throw eventError;
    let writable = admin;
    if (!admin && r.canil_id) {
      const { data: s } = await c.supabase
        .from("canis")
        .select("owner_profile_id")
        .eq("id", r.canil_id)
        .single();
      const { data: m } = await c.supabase
        .from("shelter_memberships")
        .select("role")
        .eq("canil_id", r.canil_id)
        .eq("profile_id", c.user.id)
        .maybeSingle();
      writable = s?.owner_profile_id === c.user.id || m?.role === "editor";
    }
    const open = !["resolved", "closed"].includes(r.status),
      options = r.kind === "partnership" ? partnershipStatuses : helpStatuses;
    return (
      <main id="main-content" className="space-y-6">
        <Link className="underline" href={path}>
          ← {pt ? "Todos os pedidos" : "All requests"}
        </Link>
        <header className="space-y-2">
          <p className="eyebrow">
            {r.kind === "partnership"
              ? pt
                ? "Parceria"
                : "Partnership"
              : pt
                ? "Apoio ao canil"
                : "Shelter support"}
          </p>
          <h1 className="page-title break-words">{r.subject}</h1>
          <p>
            {label(statuses, r.status, pt)} ·{" "}
            {r.priority === "high"
              ? pt
                ? "Prioridade alta"
                : "High priority"
              : pt
                ? "Prioridade normal"
                : "Normal priority"}
          </p>
          <p className="break-all text-sm text-muted-foreground">
            {pt ? "Referência:" : "Reference:"} {r.id}
          </p>
        </header>
        <Feedback search={search} pt={pt} />
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-semibold">{r.organization}</h2>
          <p>
            {label(categories, r.category, pt)} ·{" "}
            {new Date(r.created_at).toLocaleString(locale)}
          </p>
          {admin && (
            <>
              <p className="break-all">
                {r.contact_name} ·{" "}
                <a className="underline" href={`mailto:${r.email}`}>
                  {r.email}
                </a>
              </p>
              {r.website && <p className="break-all">{r.website}</p>}
            </>
          )}
          <p className="whitespace-pre-wrap break-words">{r.message}</p>
        </section>
        {writable && (admin || open) && (
          <form
            action={updateContact}
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <h2 className="text-xl font-semibold">
              {admin
                ? pt
                  ? "Acompanhar pedido"
                  : "Manage request"
                : pt
                  ? "Enviar mensagem à FYA"
                  : "Message FYA"}
            </h2>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="locale" value={locale} />
            <input
              type="hidden"
              name="audience"
              value={admin ? "admin" : "shelter"}
            />
            {admin ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  {pt ? "Estado" : "Status"}
                  <select
                    name="status"
                    defaultValue={r.status}
                    className={inputClass}
                  >
                    {options.map((k) => (
                      <option key={k} value={k}>
                        {label(statuses, k, pt)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {pt ? "Prioridade" : "Priority"}
                  <select
                    name="priority"
                    defaultValue={r.priority}
                    className={inputClass}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">{pt ? "Alta" : "High"}</option>
                  </select>
                </label>
              </div>
            ) : (
              <>
                <input type="hidden" name="status" value={r.status} />
                <input type="hidden" name="priority" value={r.priority} />
              </>
            )}
            <label className="block">
              {r.kind === "partnership"
                ? pt
                  ? "Nota interna"
                  : "Internal note"
                : pt
                  ? "Mensagem ou nota"
                  : "Message or note"}
              <textarea
                name="body"
                required
                minLength={1}
                maxLength={4000}
                rows={5}
                className={inputClass}
              />
            </label>
            {admin &&
              (r.kind === "partnership" ? (
                <>
                  <input type="hidden" name="internal" value="on" />
                  <p className="text-sm text-muted-foreground">
                    {pt
                      ? "Notas privadas da administração. Para contactar a marca, utiliza o email indicado; guardar não envia emails."
                      : "Private admin notes. Contact the brand using the email above; saving does not send email."}
                  </p>
                </>
              ) : (
                <label className="flex min-h-11 items-center gap-3">
                  <input type="checkbox" name="internal" className="size-5" />
                  {pt
                    ? "Nota interna — visível apenas à administração"
                    : "Internal note — visible only to administrators"}
                </label>
              ))}
            {r.kind === "help" && (
              <p className="text-sm text-muted-foreground">
                {pt
                  ? "As mensagens ficam disponíveis nesta página. Não são enviadas notificações por email."
                  : "Messages are available on this page. Email notifications are not sent."}
              </p>
            )}
            <SubmitButton className={buttonClass}>
              {pt ? "Guardar acompanhamento" : "Save update"}
            </SubmitButton>
          </form>
        )}
        {!admin && !open && (
          <p>
            {pt
              ? "Pedido concluído. Se precisares de mais ajuda, abre um novo pedido."
              : "Request completed. Open a new request if you need more help."}
          </p>
        )}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {pt
              ? "Histórico, do mais recente ao mais antigo"
              : "History, newest first"}
          </h2>
          {!events?.length && (
            <p>{pt ? "Ainda não há respostas." : "No replies yet."}</p>
          )}
          {events?.map((e) => (
            <article
              key={e.id}
              className="space-y-2 rounded-2xl border bg-card p-5"
            >
              <p className="text-sm font-semibold">
                {e.internal
                  ? pt
                    ? "Nota interna"
                    : "Internal note"
                  : pt
                    ? "Mensagem"
                    : "Message"}{" "}
                · {new Date(e.created_at).toLocaleString(locale)}
              </p>
              <p className="text-sm text-muted-foreground">
                {label(statuses, e.status ?? "", pt)} ·{" "}
                {e.actor_id === c.user.id
                  ? pt
                    ? "Tu"
                    : "You"
                  : pt
                    ? "Equipa"
                    : "Team"}
              </p>
              <p className="whitespace-pre-wrap break-words">{e.body}</p>
            </article>
          ))}
          <nav
            className="flex gap-4"
            aria-label={pt ? "Páginas do histórico" : "History pages"}
          >
            {historyPage > 1 && (
              <Link
                className="underline"
                href={`${path}?id=${r.id}&history=${historyPage - 1}`}
              >
                {pt ? "Anterior" : "Previous"}
              </Link>
            )}
            {historyPage * 25 < (count ?? 0) && (
              <Link
                className="underline"
                href={`${path}?id=${r.id}&history=${historyPage + 1}`}
              >
                {pt ? "Seguinte" : "Next"}
              </Link>
            )}
          </nav>
        </section>
      </main>
    );
  }
  const kind = admin && search.kind === "partnership" ? "partnership" : "help",
    page = Math.min(
      10000,
      Math.max(1, Number.parseInt(search.page ?? "1", 10) || 1),
    ),
    filterStatus =
      search.status && Object.hasOwn(statuses, search.status)
        ? search.status
        : "";
  let query = c.supabase
    .from("contact_requests")
    .select("*", { count: "exact" })
    .eq("kind", kind);
  if (filterStatus) query = query.eq("status", filterStatus);
  const {
    data: requests,
    error,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 25, page * 25 - 1);
  if (error) throw error;
  const { count: pending, error: countError } = await c.supabase
    .from("contact_requests")
    .select("id", { head: true, count: "exact" })
    .eq("kind", kind)
    .in("status", [
      "new",
      "reviewing",
      "negotiating",
      "in_progress",
      "waiting",
    ]);
  if (countError) throw countError;
  const { data: shelters, error: shelterError } = admin
    ? { data: [], error: null }
    : await c.supabase.rpc("my_shelters");
  if (shelterError) throw shelterError;
  const memberships = admin
    ? { data: [], error: null }
    : await c.supabase
        .from("shelter_memberships")
        .select("canil_id,role")
        .eq("profile_id", c.user.id);
  if (memberships.error) throw memberships.error;
  const editable = (shelters ?? []).filter(
    (s) =>
      s.owner_profile_id === c.user.id ||
      memberships.data?.some((m) => m.canil_id === s.id && m.role === "editor"),
  );
  const linkPage = (n: number) =>
    `${path}?kind=${kind}&status=${filterStatus}&page=${n}`;
  return (
    <main id="main-content" className="space-y-6">
      <header className="space-y-3">
        <h1 className="page-title">
          {admin
            ? pt
              ? "Parcerias e apoio aos canis"
              : "Partnerships and shelter support"
            : pt
              ? "Pedir ajuda à FYA"
              : "Ask FYA for help"}
        </h1>
        <p className="text-muted-foreground">
          {admin
            ? pt
              ? "Acompanha propostas de marcas e pedidos privados dos canis."
              : "Manage brand proposals and private shelter requests."
            : pt
              ? "Envia dúvidas sobre a plataforma. A equipa do teu canil pode acompanhar as respostas aqui. Para emergências com animais, contacta os serviços veterinários locais."
              : "Send platform questions. Your shelter team can follow replies here. For animal emergencies, contact local veterinary services."}
        </p>
      </header>
      <Feedback search={search} pt={pt} />
      {admin && (
        <nav
          className="flex flex-wrap gap-3"
          aria-label={pt ? "Tipo de pedidos" : "Request type"}
        >
          {(["partnership", "help"] as const).map((k) => (
            <Link
              key={k}
              aria-current={kind === k ? "page" : undefined}
              className={`rounded-full border px-5 py-3 ${kind === k ? "bg-primary text-primary-foreground" : ""}`}
              href={`${path}?kind=${k}`}
            >
              {k === "partnership"
                ? pt
                  ? "Parcerias"
                  : "Partnerships"
                : pt
                  ? "Apoio aos canis"
                  : "Shelter support"}
            </Link>
          ))}
        </nav>
      )}
      <p role="status" className="rounded-2xl bg-muted p-4 font-semibold">
        {pending ?? 0}{" "}
        {pt
          ? "pedidos por concluir nesta área"
          : "requests awaiting completion in this area"}
      </p>
      {!admin && editable.length > 0 && (
        <details className="rounded-2xl border bg-card p-5">
          <summary className="cursor-pointer py-2 font-semibold">
            {pt ? "Criar um pedido de ajuda" : "Create a help request"}
          </summary>
          <form action={submitHelp} className="mt-5 space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <label className="block">
              {pt ? "Canil" : "Shelter"}
              <select name="shelter" className={inputClass}>
                {editable.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                {pt ? "Categoria" : "Category"}
                <select name="category" className={inputClass}>
                  {helpCategories.map((k) => (
                    <option key={k} value={k}>
                      {label(categories, k, pt)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {pt ? "Prioridade" : "Priority"}
                <select name="priority" className={inputClass}>
                  <option value="normal">Normal</option>
                  <option value="high">
                    {pt ? "Alta — impede o trabalho" : "High — blocks work"}
                  </option>
                </select>
              </label>
            </div>
            <label className="block">
              {pt ? "Assunto" : "Subject"}
              <input
                name="subject"
                required
                minLength={3}
                maxLength={160}
                className={inputClass}
              />
            </label>
            <label className="block">
              {pt ? "Como podemos ajudar?" : "How can we help?"}
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                className={inputClass}
              />
            </label>
            <p className="text-sm text-muted-foreground">
              {pt
                ? "Não incluas passwords nem dados sensíveis desnecessários. Até 10 pedidos por canil em 24 horas."
                : "Do not include passwords or unnecessary sensitive data. Up to 10 requests per shelter in 24 hours."}
            </p>
            <SubmitButton className={buttonClass}>
              {pt ? "Enviar pedido" : "Send request"}
            </SubmitButton>
          </form>
        </details>
      )}
      {!admin && !editable.length && (
        <p>
          {pt
            ? "Podes consultar os pedidos. Apenas responsáveis e editores podem enviar mensagens."
            : "You can view requests. Only owners and editors can send messages."}
        </p>
      )}
      <form className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="kind" value={kind} />
        <label>
          {pt ? "Filtrar por estado" : "Filter by status"}
          <select
            name="status"
            defaultValue={filterStatus}
            className={inputClass}
          >
            <option value="">{pt ? "Todos" : "All"}</option>
            {(kind === "partnership" ? partnershipStatuses : helpStatuses).map(
              (k) => (
                <option key={k} value={k}>
                  {label(statuses, k, pt)}
                </option>
              ),
            )}
          </select>
        </label>
        <button className={buttonClass}>{pt ? "Filtrar" : "Filter"}</button>
      </form>
      <p>
        {count ?? 0} {pt ? "pedidos encontrados" : "requests found"}
      </p>
      <div className="space-y-3">
        {!requests?.length && (
          <p className="rounded-2xl border p-5">
            {pt ? "Ainda não há pedidos para mostrar." : "No requests to show."}
          </p>
        )}
        {requests?.map((r) => (
          <Link
            key={r.id}
            href={`${path}?id=${r.id}`}
            className="block space-y-2 rounded-2xl border bg-card p-5 hover:border-primary"
          >
            <h2 className="break-words text-lg font-semibold">{r.subject}</h2>
            <p>
              {r.organization} · {label(statuses, r.status, pt)}
              {r.priority === "high"
                ? pt
                  ? " · Prioridade alta"
                  : " · High priority"
                : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString(locale)} ·{" "}
              {label(categories, r.category, pt)}
            </p>
          </Link>
        ))}
      </div>
      <nav
        className="flex gap-4"
        aria-label={pt ? "Páginas de pedidos" : "Request pages"}
      >
        {page > 1 && (
          <Link className="underline" href={linkPage(page - 1)}>
            {pt ? "Anterior" : "Previous"}
          </Link>
        )}
        {page * 25 < (count ?? 0) && (
          <Link className="underline" href={linkPage(page + 1)}>
            {pt ? "Seguinte" : "Next"}
          </Link>
        )}
      </nav>
    </main>
  );
}
function Feedback({ search, pt }: { search: ContactSearch; pt: boolean }) {
  return (
    <>
      {search.success && (
        <p role="status">
          {pt ? "Guardado com sucesso." : "Saved successfully."}
        </p>
      )}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Confirma os campos e permissões, ou tenta mais tarde."
            : "Could not save. Check the fields and permissions, or try later."}
        </p>
      )}
    </>
  );
}
