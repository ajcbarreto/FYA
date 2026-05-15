import { CalendarClock } from "lucide-react";
import { proposeVisit, updateVisitStatus } from "@/app/adoption/visits-actions";
import {
  formatVisitDate,
  localizeVisitStatus,
  visitStatusClass,
  type VisitRow,
} from "@/lib/adoption/visits";

type VisitPanelProps = {
  locale: string;
  pedidoId: string;
  visits: VisitRow[];
  audience: "user" | "canil";
  canPropose?: boolean;
};

export function VisitPanel({ locale, pedidoId, visits, audience, canPropose = false }: VisitPanelProps) {
  const isPt = locale === "pt";
  const t = {
    title: isPt ? "Visitas" : "Visits",
    none: isPt ? "Sem visitas agendadas." : "No visits scheduled.",
    propose: isPt ? "Propor visita" : "Propose a visit",
    submit: isPt ? "Propor" : "Propose",
    confirm: isPt ? "Confirmar" : "Confirm",
    cancel: isPt ? "Cancelar" : "Cancel",
    markDone: isPt ? "Marcar realizada" : "Mark completed",
  };

  return (
    <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
      <p className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" />
        {t.title}
      </p>

      {visits.length === 0 ? (
        <p className="text-muted-foreground">{t.none}</p>
      ) : (
        <ul className="space-y-1.5">
          {visits.map((visit) => (
            <li key={visit.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background px-3 py-2">
              <span className="font-semibold">{formatVisitDate(visit.scheduled_at, locale)}</span>
              <span className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${visitStatusClass(visit.status)}`}>
                  {localizeVisitStatus(visit.status, locale)}
                </span>
                {audience === "canil" && visit.status === "proposta" && (
                  <>
                    <VisitAction
                      locale={locale}
                      visitId={visit.id}
                      status="confirmada"
                      label={t.confirm}
                      tone="primary"
                      audience={audience}
                    />
                    <VisitAction
                      locale={locale}
                      visitId={visit.id}
                      status="cancelada"
                      label={t.cancel}
                      tone="muted"
                      audience={audience}
                    />
                  </>
                )}
                {audience === "canil" && visit.status === "confirmada" && (
                  <VisitAction
                    locale={locale}
                    visitId={visit.id}
                    status="realizada"
                    label={t.markDone}
                    tone="primary"
                    audience={audience}
                  />
                )}
                {audience === "user" && visit.status === "proposta" && (
                  <VisitAction
                    locale={locale}
                    visitId={visit.id}
                    status="cancelada"
                    label={t.cancel}
                    tone="muted"
                    audience={audience}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {audience === "user" && canPropose && (
        <form action={proposeVisit} className="flex flex-wrap items-end gap-2 pt-1">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <label className="flex flex-col gap-1 font-semibold text-muted-foreground">
            {t.propose}
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              className="h-9 rounded-lg border border-border/30 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button type="submit" className="h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground">
            {t.submit}
          </button>
        </form>
      )}
    </div>
  );
}

function VisitAction({
  locale,
  visitId,
  status,
  label,
  tone,
  audience,
}: {
  locale: string;
  visitId: string;
  status: string;
  label: string;
  tone: "primary" | "muted";
  audience: "user" | "canil";
}) {
  return (
    <form action={updateVisitStatus}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="visitId" value={visitId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="audience" value={audience} />
      <button
        type="submit"
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          tone === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-destructive"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
