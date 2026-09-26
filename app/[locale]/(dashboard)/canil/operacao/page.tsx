import { HelpLink } from "@/components/help-link";
import Link from "next/link";
import { LocalDateTime } from "@/components/local-datetime";
import { recordsContext } from "@/lib/records/context";
import {
  createTask,
  completeTask,
  saveInternalNote,
  retryEmail,
} from "@/app/records/operations-actions";
import { SubmitButton } from "@/components/submit-button";
export default async function Operations({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string; q?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    search = await searchParams;
  if (!c.shelter)
    return (
      <main id="main-content">
        {pt
          ? "Seleciona um canil na página Equipa."
          : "Select a shelter on the Team page."}
      </main>
    );
  let query = c.supabase
    .from("pedidos_adocao")
    .select(
      "id,status,created_at,reviewed_at,animais(nome),profiles!pedidos_adocao_applicant_profile_id_fkey(full_name,email)",
    )
    .eq("canil_id", c.shelter.id)
    .in("status", ["pendente", "entrevista", "aprovado"])
    .order("created_at");
  if (search.q && /^[0-9a-f-]{36}$/i.test(search.q))
    query = query.eq("id", search.q);
  const [
    tasks,
    animals,
    requests,
    notes,
    visits,
    delivery,
    members,
    completed,
  ] = await Promise.all([
    c.supabase
      .from("shelter_tasks")
      .select("*,animais(nome),profiles(full_name)")
      .eq("canil_id", c.shelter.id)
      .is("completed_at", null)
      .order("due_at")
      .limit(100),
    c.supabase
      .from("animais")
      .select("id,nome,status,created_at,archived_at")
      .eq("canil_id", c.shelter.id)
      .order("nome"),
    query.limit(100),
    c.supabase.from("request_internal_notes").select("*"),
    c.supabase
      .from("visitas")
      .select("id,scheduled_at,status,animais(nome)")
      .eq("canil_id", c.shelter.id)
      .in("status", ["proposta", "confirmada"])
      .order("scheduled_at")
      .limit(100),
    c.supabase.rpc("shelter_delivery_status", { p_shelter: c.shelter.id }),
    c.supabase
      .from("shelter_memberships")
      .select("profile_id,profiles(full_name)")
      .eq("canil_id", c.shelter.id)
      .eq("role", "editor"),
    c.supabase
      .from("pedidos_adocao")
      .select("id", { count: "exact", head: true })
      .eq("canil_id", c.shelter.id)
      .eq("status", "concluido"),
  ]);
  if (
    [
      tasks,
      animals,
      requests,
      notes,
      visits,
      delivery,
      members,
      completed,
    ].some((x) => x.error)
  )
    throw new Error("Unable to load operations");
  const now = new Date().getTime();
  const { data: metricData, error: metricError } = await c.supabase.rpc(
    "shelter_metrics",
    { p_shelter: c.shelter.id },
  );
  if (metricError) throw new Error("Unable to load metrics");
  const metrics = metricData as Record<string, number>;
  const hidden = <input type="hidden" name="locale" value={locale} />,
    box = "rounded-2xl border border-border bg-card p-6 space-y-4",
    input = "field",
    button =
      "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground";
  const jobs = delivery.data as unknown as {
    id: string;
    sent_at: string | null;
    attempts: number;
    last_error: string | null;
  }[];
  return (
    <main id="main-content" className="space-y-6">
      <header>
        <h1 className="page-title">
          {pt ? "Trabalho do dia" : "Daily work"}
        </h1>
        <p>{c.shelter.nome}</p>
      </header>
      <HelpLink locale={locale} guide="equipa-tarefas-visitas" />
      {search.success && <p role="status">{pt ? "Guardado." : "Saved."}</p>}
      {search.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Verifica os dados e as permissões."
            : "Could not save. Check data and permissions."}
        </p>
      )}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          [
            pt ? "Adoções registadas" : "Recorded adoptions",
            completed.count ?? 0,
          ],
          [
            pt ? "Animais ativos" : "Active animals",
            animals.data?.filter(
              (a) => !a.archived_at && a.status !== "adotado",
            ).length ?? 0,
          ],
          [
            pt
              ? "Tarefas em atraso (nas 100 apresentadas)"
              : "Overdue tasks (of 100 shown)",
            tasks.data?.filter((t) => Date.parse(t.due_at) < now).length ?? 0,
          ],
        ].map(([label, count]) => (
          <article key={label} className={box}>
            <p>{label}</p>
            <strong className="text-3xl">{count}</strong>
          </article>
        ))}
      </section>
      <section className={box}>
        <h2 className="font-bold">
          {pt ? "Indicadores do canil" : "Shelter indicators"}
        </h2>
        <p>
          {pt
            ? "Pedidos sem revisão há mais de 48h"
            : "Applications unreviewed for over 48h"}
          : {metrics.unreviewed_over_48h}
        </p>
        <p>
          {pt
            ? "Seguimentos concluídos / vencidos"
            : "Completed / due follow-ups"}
          : {metrics.followups_done} / {metrics.followups_due}
        </p>
        <p>
          {pt
            ? "Tempo médio até à última revisão (horas)"
            : "Average time to latest review (hours)"}
          : {metrics.average_review_hours ?? "—"}
        </p>
        <p>
          {pt
            ? "Tarefas vencidas, em todo o canil"
            : "Overdue tasks across the shelter"}
          : {metrics.overdue_tasks}
        </p>
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Tarefas e acompanhamento" : "Tasks and follow-up"}
        </h2>
        <p>
          {pt
            ? "As adoções concluídas geram seguimentos a 7, 30 e 90 dias. Mostramos as primeiras 100 tarefas por prazo."
            : "Completed adoptions create follow-ups at 7, 30 and 90 days. Showing the first 100 tasks by due date."}
        </p>
        {!tasks.data?.length && (
          <p>{pt ? "Sem tarefas pendentes." : "No pending tasks."}</p>
        )}
        {tasks.data?.map((t) => (
          <form
            className="border-t border-border pt-4 space-y-2"
            action={completeTask}
            key={t.id}
          >
            {hidden}
            <input type="hidden" name="taskId" value={t.id} />
            <strong>{t.title}</strong>
            <p className="text-sm">
              {t.animais?.nome} · {new Date(t.due_at).toLocaleString(locale)} ·{" "}
              {t.profiles?.full_name ?? (pt ? "Sem responsável" : "Unassigned")}
            </p>
            {t.animal_id && (
              <Link
                className="underline text-sm"
                href={`/${locale}/canil/animais/${t.animal_id}/registos`}
              >
                {pt ? "Abrir ficha" : "Open record"}
              </Link>
            )}
            <label className="block">
              {pt ? "Resultado / observações" : "Outcome / notes"}
              <textarea
                name="outcome"
                className={input}
                maxLength={4000}
                required={Boolean(t.followup_day)}
              />
            </label>
            <SubmitButton className={button}>
              {pt ? "Concluir tarefa" : "Complete task"}
            </SubmitButton>
          </form>
        ))}
      </section>
      <form className={box} action={createTask}>
        {hidden}
        <h2 className="font-bold">{pt ? "Nova tarefa" : "New task"}</h2>
        <label className="block">
          {pt ? "Descrição" : "Description"}
          <input className={input} name="title" maxLength={240} required />
        </label>
        <label className="block">
          {pt ? "Prazo (hora local)" : "Due date (local time)"}
          <LocalDateTime name="due_at" />
        </label>
        <label className="block">
          {pt ? "Animal" : "Animal"}
          <select className={input} name="animalId">
            <option value="">—</option>
            {animals.data?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          {pt ? "Responsável" : "Assignee"}
          <select name="assigneeId" className={input}>
            <option value="">—</option>
            <option value={c.shelter.owner_profile_id ?? ""}>
              {pt ? "Responsável do canil" : "Shelter owner"}
            </option>
            {members.data?.map((m) => (
              <option key={m.profile_id} value={m.profile_id}>
                {m.profiles?.full_name}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton className={button}>
          {pt ? "Criar tarefa" : "Create task"}
        </SubmitButton>
      </form>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Candidaturas por tratar" : "Active applications"}
        </h2>
        <p>
          {pt
            ? "Primeiras 100, da mais antiga à mais recente. As notas abaixo são privadas."
            : "First 100, oldest first. Notes below are private."}
        </p>
        <Link className="underline" href={`/${locale}/canil/pedidos`}>
          {pt ? "Gerir estados e responder" : "Manage statuses and reply"}
        </Link>
        {requests.data?.map((r) => (
          <form
            key={r.id}
            action={saveInternalNote}
            className="border-t border-border pt-4 space-y-2"
          >
            {hidden}
            <input type="hidden" name="requestId" value={r.id} />
            <strong>
              {r.animais?.nome} · {r.profiles?.full_name}
            </strong>
            <p>
              {r.status} · {new Date(r.created_at).toLocaleDateString(locale)}
            </p>
            <label className="block">
              {pt ? "Notas internas — só equipa" : "Internal notes — team only"}
              <textarea
                className={input}
                name="notes"
                maxLength={8000}
                defaultValue={
                  notes.data?.find((n) => n.request_id === r.id)?.notes ?? ""
                }
              />
            </label>
            <SubmitButton className={button}>
              {pt ? "Guardar nota" : "Save note"}
            </SubmitButton>
          </form>
        ))}
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Próximas visitas" : "Upcoming visits"}
        </h2>
        {!visits.data?.length && (
          <p>{pt ? "Sem visitas pendentes." : "No pending visits."}</p>
        )}
        {visits.data?.map((v) => (
          <p key={v.id}>
            {v.animais?.nome} ·{" "}
            {new Date(v.scheduled_at).toLocaleString(locale)} · {v.status}
          </p>
        ))}
        <Link className="underline" href={`/${locale}/canil/agenda`}>
          {pt
            ? "Gerir disponibilidade e agenda"
            : "Manage availability and calendar"}
        </Link>
      </section>
      <section className={box}>
        <h2 className="text-xl font-bold">
          {pt ? "Entrega de dossiers por email" : "Dossier email delivery"}
        </h2>
        {!jobs?.length && <p>{pt ? "Sem envios." : "No deliveries."}</p>}
        {jobs?.map((j) => (
          <div key={j.id}>
            <p>
              {j.sent_at
                ? pt
                  ? "Enviado"
                  : "Sent"
                : j.attempts >= 5
                  ? pt
                    ? "Falhou — requer intervenção"
                    : "Failed — intervention required"
                  : pt
                    ? "Na fila"
                    : "Queued"}{" "}
              · {j.attempts} {pt ? "tentativas" : "attempts"} {j.last_error}
            </p>
            {!j.sent_at && j.attempts >= 5 && (
              <form action={retryEmail}>
                {hidden}
                <input type="hidden" name="jobId" value={j.id} />
                <SubmitButton className={button}>
                  {pt ? "Tentar novamente" : "Retry"}
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
