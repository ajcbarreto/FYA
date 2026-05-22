import { Check } from "lucide-react";
import { AdoptionAnswers } from "@/components/adoption-answers";
import { VisitPanel } from "@/components/visit-panel";
import type { AdoptionRequestRow } from "@/lib/adoption/db";
import { getRowAnimal, localizeRequestStatus, mapRequestApplicantName } from "@/lib/adoption/db";
import type { VisitRow } from "@/lib/adoption/visits";
import { updateRequestStatus } from "@/app/adoption/actions";

type RequestCardProps = {
  request: AdoptionRequestRow;
  visits: VisitRow[];
  locale: string;
  audience: "canil" | "owner";
  copy: {
    questionnaireVisits: string;
    notePlaceholder: string;
    save: string;
    statuses: {
      pendente: string;
      entrevista: string;
      aprovado: string;
      concluido: string;
      rejeitado: string;
    };
  };
};

type StatusCopy = RequestCardProps["copy"]["statuses"];

// Mini stepper horizontal com os 4 estados positivos do fluxo. "Rejeitado"
// e um estado terminal off-flow e e mostrado num banner proprio.
function StatusTimeline({ status, statuses }: { status: string; statuses: StatusCopy }) {
  if (status === "rejeitado") {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
        {statuses.rejeitado}
      </p>
    );
  }

  const steps = [
    { key: "pendente", label: statuses.pendente },
    { key: "entrevista", label: statuses.entrevista },
    { key: "aprovado", label: statuses.aprovado },
    { key: "concluido", label: statuses.concluido },
  ];
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === status),
  );

  return (
    <ol className="mt-3 flex items-stretch gap-1 text-[10px] font-semibold">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="flex flex-1 flex-col items-stretch">
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  done
                    ? "bg-secondary text-secondary-foreground"
                    : current
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : index + 1}
              </span>
              {!isLast && (
                <span className={`h-px flex-1 ${done ? "bg-secondary" : "bg-border/40"}`} aria-hidden />
              )}
            </div>
            <span
              className={`mt-1 truncate ${
                done ? "text-secondary" : current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function statusToneClass(status: string) {
  switch (status) {
    case "aprovado":
    case "concluido":
      return "bg-secondary/15 text-secondary";
    case "entrevista":
      return "bg-primary/15 text-primary";
    case "rejeitado":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// Card unificado para listas de pedidos de adopcao (canil e dono particular).
// Mostra nome do candidato, animal, data, status, com detalhes colapsaveis e
// um pequeno formulario inline para atualizar o estado e adicionar notas.
export function RequestCard({ request, visits, locale, audience, copy }: RequestCardProps) {
  const animal = getRowAnimal(request);
  const applicantName = mapRequestApplicantName(request, locale);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(request.created_at));

  return (
    <article className="rounded-2xl border border-border/25 bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{applicantName}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {animal?.nome ?? "-"} • {formattedDate}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusToneClass(request.status)}`}>
          {localizeRequestStatus(request.status, locale)}
        </span>
      </header>

      <StatusTimeline status={request.status} statuses={copy.statuses} />

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-primary">{copy.questionnaireVisits}</summary>
        <div className="mt-3 space-y-2">
          {request.mensagem_inicial && (
            <p className="rounded-xl bg-muted/60 px-3 py-2 italic">{request.mensagem_inicial}</p>
          )}
          <AdoptionAnswers answers={request.respostas} locale={locale} />
          <VisitPanel
            locale={locale}
            pedidoId={request.id}
            visits={visits}
            audience="canil"
          />
        </div>
      </details>

      <form
        action={updateRequestStatus}
        className="mt-4 flex flex-col gap-2 border-t border-border/15 pt-4 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="requestId" value={request.id} />
        {audience === "owner" && <input type="hidden" name="audience" value="owner" />}
        <select
          name="status"
          defaultValue={request.status}
          className="h-9 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 sm:w-40"
        >
          <option value="pendente">{copy.statuses.pendente}</option>
          <option value="entrevista">{copy.statuses.entrevista}</option>
          <option value="aprovado">{copy.statuses.aprovado}</option>
          <option value="concluido">{copy.statuses.concluido}</option>
          <option value="rejeitado">{copy.statuses.rejeitado}</option>
        </select>
        <input
          name="notes"
          defaultValue={request.observacoes_canil ?? ""}
          placeholder={copy.notePlaceholder}
          className="h-9 flex-1 rounded-full border border-border/30 bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="h-9 shrink-0 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {copy.save}
        </button>
      </form>
    </article>
  );
}
