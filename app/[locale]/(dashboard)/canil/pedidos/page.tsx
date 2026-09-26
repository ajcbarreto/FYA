import { HelpLink } from "@/components/help-link";
import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ApplicationReply } from "@/components/application-reply";
import {
  assignApplication,
  saveReplyTemplate,
  deleteReplyTemplate,
} from "@/app/records/request-actions";
import {
  queueFilters,
  queueQuery,
  queueStatuses,
  defaultReplyTemplates,
  type QueueSearch,
} from "@/lib/records/request-queue";
import type { AdoptionRequestRow } from "@/lib/adoption/db";
import { ListPagination } from "@/components/list-pagination";
import { SubmitButton } from "@/components/submit-button";
import { requestTransitions } from "@/lib/adoption/status";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getOwnedShelter } from "@/lib/canil/shelter-data";
import {
  getRowAnimal,
  localizeRequestStatus,
  mapRequestApplicantName,
} from "@/lib/adoption/db";
import { updateRequestStatus } from "@/app/adoption/actions";
import { getVisitsByPedido } from "@/lib/adoption/visits";
import { AdoptionAnswers } from "@/components/adoption-answers";
import { ToastFeedback } from "@/components/toast-feedback";
import { VisitPanel } from "@/components/visit-panel";

type CanilRequestsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<QueueSearch>;
};

export default async function CanilRequestsPage({
  params,
  searchParams,
}: CanilRequestsPageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const now = new Date().getTime();
  const { success, error } = search;
  const filters = queueFilters(search),
    queryString = queueQuery(search),
    pt = locale === "pt";

  if (!isLocale(locale)) {
    notFound();
  }

  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    redirect(`/${locale}/auth/login?next=/canil/pedidos`);
  }

  const shelter = await getOwnedShelter(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil?error=no_shelter`);
  }

  const [queue, members, templates] = await Promise.all([
    supabase.rpc("search_shelter_requests", {
      p_shelter: shelter.id,
      p_query: filters.q,
      p_status: filters.status,
      p_assignee: filters.assignee,
      p_min_days: Number(filters.days),
      p_unanswered: filters.unanswered === "1",
      p_order: filters.order,
      p_page: Math.min(
        1000000,
        Math.max(1, Number.parseInt(search.page ?? "1", 10) || 1),
      ),
    }),
    supabase
      .from("shelter_memberships")
      .select("profile_id,role,profiles(full_name)")
      .eq("canil_id", shelter.id),
    supabase
      .from("shelter_reply_templates")
      .select("*")
      .eq("canil_id", shelter.id)
      .order("title"),
  ]);
  if (queue.error || members.error || templates.error)
    throw new Error("Unable to load application queue");
  const {
    total,
    page,
    items: requests,
  } = queue.data as unknown as {
    total: number;
    page: number;
    items: (AdoptionRequestRow & {
      assignee_id: string | null;
      first_response_at: string | null;
      unanswered: boolean;
    })[];
  };
  const canEdit =
    shelter.owner_profile_id === user.id ||
    members.data?.some((m) => m.profile_id === user.id && m.role === "editor");
  const assignees = [
    {
      id: shelter.owner_profile_id!,
      name: pt ? "Responsável do canil" : "Shelter owner",
    },
    ...(members.data ?? [])
      .filter((m) => m.role === "editor")
      .map((m) => ({
        id: m.profile_id,
        name: m.profiles?.full_name ?? m.profile_id,
      })),
  ];
  const replyTemplates = [
    ...(templates.data ?? []),
    ...defaultReplyTemplates(pt),
  ];
  const inputClass =
    "field";
  const formFields = (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="filters" value={queryString} />
    </>
  );
  const visitsByPedido = await getVisitsByPedido(
    supabase,
    requests.map((request) => request.id),
  );
  const copy =
    locale === "pt"
      ? {
          title: "Pedidos de Adocao",
          subtitle: "Fila de candidaturas recebidas para os teus animais.",
          columns: {
            applicant: "Candidato e Pet",
            date: "Submissao",
            status: "Estado",
            actions: "Acoes",
          },
          empty:
            "Sem pedidos no momento. Quando chegarem novos pedidos, eles vao aparecer aqui.",
          action: "Atualizar pedido",
          statuses: {
            pendente: "Pendente",
            entrevista: "Entrevista",
            aprovado: "Aprovado",
            rejeitado: "Rejeitado",
            concluido: "Adocao concluida",
          },
          hint: "Atualiza o estado e adiciona notas para manter o adotante informado.",
          notePlaceholder: "Observacoes para o adotante (opcional)",
          save: "Guardar",
          success: {
            updated: "Pedido atualizado com sucesso.",
            visit_updated: "Visita atualizada.",
          } as Record<string, string>,
          errors: {
            invalid_request: "Pedido invalido.",
            save_failed: "Nao foi possivel guardar alteracoes.",
            unauthorized: "Nao autorizado.",
            no_shelter: "Nao foi encontrado canil associado.",
            invalid_visit: "Dados de visita invalidos.",
            visit_failed: "Nao foi possivel atualizar a visita.",
          } as Record<string, string>,
        }
      : {
          title: "Adoption Requests",
          subtitle: "Queue of applications received for your pets.",
          columns: {
            applicant: "Applicant & Pet",
            date: "Submission",
            status: "Status",
            actions: "Actions",
          },
          empty: "No requests right now. New requests will show up here.",
          action: "Update request",
          statuses: {
            pendente: "Pending",
            entrevista: "Interview",
            aprovado: "Approved",
            rejeitado: "Rejected",
            concluido: "Adoption completed",
          },
          hint: "Update statuses and notes to keep adopters informed.",
          notePlaceholder: "Notes for adopter (optional)",
          save: "Save",
          success: {
            updated: "Request updated successfully.",
            visit_updated: "Visit updated.",
          } as Record<string, string>,
          errors: {
            invalid_request: "Invalid request.",
            save_failed: "Could not save changes.",
            unauthorized: "Not authorized.",
            no_shelter: "No linked shelter found.",
            invalid_visit: "Invalid visit data.",
            visit_failed: "Could not update the visit.",
          } as Record<string, string>,
        };

  const feedback =
    (success && copy.success[success]) || (error && copy.errors[error]) || null;

  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
        <h1 className="display-title text-4xl sm:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>
      <HelpLink locale={locale} guide="candidaturas-respostas" />
      <ToastFeedback
        message={feedback}
        variant={success ? "success" : "error"}
      />

      <form
        method="get"
        className="rounded-2xl border border-border bg-card p-5 grid gap-4 sm:grid-cols-3"
      >
        <label>
          {pt ? "Pesquisar animal ou adotante" : "Search animal or applicant"}
          <input
            type="search"
            name="q"
            maxLength={160}
            defaultValue={filters.q}
            className={inputClass}
          />
        </label>
        <label>
          {pt ? "Estado" : "Status"}
          <select
            name="status"
            defaultValue={filters.status}
            className={inputClass}
          >
            <option value="">{pt ? "Todos" : "All"}</option>
            {queueStatuses.map((s) => (
              <option key={s} value={s}>
                {localizeRequestStatus(s, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {pt ? "Responsável" : "Assignee"}
          <select
            name="assignee"
            defaultValue={filters.assignee}
            className={inputClass}
          >
            <option value="">{pt ? "Todos" : "All"}</option>
            <option value="unassigned">
              {pt ? "Sem responsável" : "Unassigned"}
            </option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.id === user.id ? (pt ? " (eu)" : " (me)") : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          {pt ? "Antiguidade mínima (dias)" : "Minimum age (days)"}
          <input
            type="number"
            min={0}
            max={36500}
            name="days"
            defaultValue={filters.days}
            className={inputClass}
          />
        </label>
        <label>
          {pt ? "Ordenar" : "Sort"}
          <select
            name="order"
            defaultValue={filters.order}
            className={inputClass}
          >
            <option value="oldest">
              {pt ? "Mais antigos primeiro" : "Oldest first"}
            </option>
            <option value="newest">
              {pt ? "Mais recentes primeiro" : "Newest first"}
            </option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="unanswered"
            value="1"
            defaultChecked={filters.unanswered === "1"}
          />
          {pt
            ? "Só candidaturas ativas sem resposta"
            : "Only unanswered active applications"}
        </label>
        <button className="rounded-full bg-primary px-4 py-2 text-primary-foreground">
          {pt ? "Filtrar candidaturas" : "Filter applications"}
        </button>
        <Link
          className="self-center underline"
          href={`/${locale}/canil/pedidos`}
        >
          {pt ? "Limpar filtros" : "Clear filters"}
        </Link>
        <p className="self-center text-sm" role="status">
          {total} {pt ? "candidaturas encontradas" : "applications found"}
        </p>
      </form>
      <p className="text-sm text-muted-foreground">
        {pt
          ? "Sem resposta significa que ainda não foi registada uma mensagem ou nota partilhada com o adotante. Pedidos ativos há mais de 48 horas ficam destacados."
          : "Unanswered means no message or shared note has been recorded for the applicant. Active applications older than 48 hours are highlighted."}
      </p>
      <details className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer font-semibold">
          {pt ? "Gerir respostas modelo" : "Manage reply templates"}
        </summary>
        <p className="my-3 text-sm">
          {pt
            ? "Usa {animal}, {adotante} e {canil} para preencher os dados ao inserir o modelo. Os modelos guardados são partilhados com a equipa."
            : "Use {animal}, {adotante} and {canil} to fill in details when inserting a template. Saved templates are shared with your team."}
        </p>
        {(templates.data ?? []).map((t) => (
          <div key={t.id} className="my-4 border-t pt-4">
            {canEdit ? (
              <>
                <form action={saveReplyTemplate} className="space-y-2">
                  {formFields}
                  <input type="hidden" name="templateId" value={t.id} />
                  <label>
                    {pt ? "Título do modelo" : "Template title"}
                    <input
                      name="title"
                      required
                      maxLength={100}
                      defaultValue={t.title}
                      className={inputClass}
                    />
                  </label>
                  <label>
                    {pt ? "Texto do modelo" : "Template text"}
                    <textarea
                      name="body"
                      required
                      maxLength={3000}
                      rows={4}
                      defaultValue={t.body}
                      className={inputClass}
                    />
                  </label>
                  <SubmitButton className="underline">
                    {pt ? "Guardar modelo" : "Save template"}
                  </SubmitButton>
                </form>
                <form action={deleteReplyTemplate} className="mt-2">
                  {formFields}
                  <input type="hidden" name="templateId" value={t.id} />
                  <SubmitButton className="text-sm underline">
                    {pt ? "Eliminar modelo" : "Delete template"}
                  </SubmitButton>
                </form>
              </>
            ) : (
              <>
                <strong>{t.title}</strong>
                <p className="whitespace-pre-wrap">{t.body}</p>
              </>
            )}
          </div>
        ))}
        {canEdit && (
          <form action={saveReplyTemplate} className="mt-4 space-y-2">
            {formFields}
            <h2 className="font-semibold">
              {pt ? "Novo modelo" : "New template"}
            </h2>
            <label>
              {pt ? "Título do modelo" : "Template title"}
              <input
                name="title"
                required
                maxLength={100}
                className={inputClass}
              />
            </label>
            <label>
              {pt ? "Texto do modelo" : "Template text"}
              <textarea
                name="body"
                required
                maxLength={3000}
                rows={4}
                className={inputClass}
              />
            </label>
            <SubmitButton className="rounded-full bg-primary px-4 py-2 text-primary-foreground">
              {pt ? "Criar modelo" : "Create template"}
            </SubmitButton>
          </form>
        )}
      </details>
      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {requests.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">
            {copy.empty}
          </p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">
                    {copy.columns.applicant}
                  </th>
                  <th className="px-6 py-4 font-bold">{copy.columns.date}</th>
                  <th className="px-6 py-4 font-bold">{copy.columns.status}</th>
                  <th className="px-6 py-4 font-bold">
                    {copy.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className={`border-t border-border/15 align-top ${request.unanswered && now - Date.parse(request.created_at) > 172800000 ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold">
                        {mapRequestApplicantName(request, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRowAnimal(request)?.nome ?? "-"}
                      </p>
                      <details className="mt-3 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-semibold text-primary">
                          {locale === "pt"
                            ? "Questionario e visitas"
                            : "Questionnaire and visits"}
                        </summary>
                        <div className="mt-2 space-y-2">
                          {request.mensagem_inicial && (
                            <p className="rounded-xl bg-muted px-3 py-2 italic">
                              {request.mensagem_inicial}
                            </p>
                          )}
                          <AdoptionAnswers
                            answers={request.respostas}
                            locale={locale}
                          />
                          <VisitPanel
                            locale={locale}
                            pedidoId={request.id}
                            visits={visitsByPedido.get(request.id) ?? []}
                            audience="canil"
                          />
                        </div>
                      </details>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Intl.DateTimeFormat(locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(request.created_at))}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                        {localizeRequestStatus(request.status, locale)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.unanswered && (
                        <p className="mb-3 text-sm font-semibold">
                          {now - Date.parse(request.created_at) > 172800000
                            ? pt
                              ? "Sem resposta há mais de 48h"
                              : "Unanswered for over 48h"
                            : pt
                              ? "Ainda sem resposta"
                              : "Awaiting first response"}
                        </p>
                      )}
                      {canEdit ? (
                        <form
                          action={assignApplication}
                          className="mb-4 space-y-2"
                        >
                          {formFields}
                          <input
                            type="hidden"
                            name="applicationId"
                            value={request.id}
                          />
                          <label className="text-sm">
                            {pt
                              ? "Responsável pela candidatura"
                              : "Application assignee"}
                            <select
                              name="assigneeId"
                              defaultValue={request.assignee_id ?? ""}
                              className={inputClass}
                            >
                              <option value="">
                                {pt ? "Sem responsável" : "Unassigned"}
                              </option>
                              {assignees.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <SubmitButton className="text-sm underline">
                            {pt ? "Guardar responsável" : "Save assignee"}
                          </SubmitButton>
                        </form>
                      ) : (
                        <p className="mb-3 text-sm">
                          {assignees.find((a) => a.id === request.assignee_id)
                            ?.name ?? (pt ? "Sem responsável" : "Unassigned")}
                        </p>
                      )}
                      {canEdit && (
                        <>
                          <form
                            action={updateRequestStatus}
                            className="space-y-2"
                          >
                            <input
                              type="hidden"
                              name="filters"
                              value={queryString}
                            />
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="requestId"
                              value={request.id}
                            />
                            <select
                              aria-label={copy.columns.status}
                              name="status"
                              defaultValue={request.status}
                              className="h-9 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              {[
                                request.status,
                                ...requestTransitions[request.status],
                              ].map((status) => (
                                <option key={status} value={status}>
                                  {copy.statuses[status]}
                                </option>
                              ))}
                            </select>
                            <input
                              aria-label={
                                locale === "pt"
                                  ? "Notas partilhadas com o adotante"
                                  : "Notes shared with the adopter"
                              }
                              name="notes"
                              defaultValue={request.observacoes_canil ?? ""}
                              placeholder={copy.notePlaceholder}
                              className="h-9 w-full rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <SubmitButton
                              type="submit"
                              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                            >
                              {copy.save}
                            </SubmitButton>
                          </form>
                          <ApplicationReply
                            key={randomUUID()}
                            locale={locale}
                            requestId={request.id}
                            messageId={randomUUID()}
                            templates={replyTemplates}
                            values={{
                              animal: getRowAnimal(request)?.nome ?? "",
                              adotante: mapRequestApplicantName(
                                request,
                                locale,
                              ),
                              canil: shelter.nome,
                            }}
                            filters={queryString}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">
        {copy.hint}
      </p>
      <ListPagination
        page={page}
        total={total}
        base={`/${locale}/canil/pedidos?${queryString}`}
        locale={locale}
      />
    </main>
  );
}
