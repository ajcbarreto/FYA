import { Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  ALLOWED_HEALTH_TIPOS,
  type HealthEvent,
  type HealthEventTipo,
} from "@/lib/canil/animal-health";
import { addHealthEvent, deleteHealthEvent } from "@/app/canil/animais/health-actions";

type AnimalHealthEditorProps = {
  locale: Locale;
  scope: "canil" | "user";
  animalId: string;
  events: HealthEvent[];
};

export function AnimalHealthEditor({ locale, scope, animalId, events }: AnimalHealthEditorProps) {
  const t = getDictionary(locale).animalHealth;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="rounded-2xl border border-border/25 bg-card p-6">
      <header>
        <h2 className="text-lg font-bold">{t.sectionTitle}</h2>
      </header>

      <form
        action={addHealthEvent}
        className="mt-4 grid gap-3 rounded-xl border border-border/25 p-4 sm:grid-cols-[140px_140px_1fr_auto]"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground sm:col-span-4">
          {t.addTitle}
        </p>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="scope" value={scope} />
        <input type="hidden" name="animalId" value={animalId} />
        <label className="space-y-1 text-xs font-semibold">
          {t.typeLabel}
          <select
            name="tipo"
            required
            defaultValue="vacina"
            className="mt-1 h-9 w-full rounded-lg border border-border/30 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          >
            {ALLOWED_HEALTH_TIPOS.map((tipo: HealthEventTipo) => (
              <option key={tipo} value={tipo}>
                {t.types[tipo]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold">
          {t.dateLabel}
          <input
            type="date"
            name="data"
            defaultValue={today}
            className="mt-1 h-9 w-full rounded-lg border border-border/30 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold">
          {t.descriptionLabel}
          <input
            name="descricao"
            placeholder={t.descriptionPlaceholder}
            className="mt-1 h-9 w-full rounded-lg border border-border/30 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:self-end"
        >
          {t.submitAdd}
        </button>
      </form>

      <div className="mt-5">
        {events.length === 0 ? (
          <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-xs text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => {
              const formattedDate = new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(event.data));
              return (
                <li key={event.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/25 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {t.types[event.tipo]}
                      <span className="ml-2 text-[11px] font-medium text-muted-foreground">{formattedDate}</span>
                    </p>
                    {event.descricao && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{event.descricao}</p>
                    )}
                  </div>
                  <form action={deleteHealthEvent}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="scope" value={scope} />
                    <input type="hidden" name="animalId" value={animalId} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t.deleteAction}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

type AnimalHealthTimelineProps = {
  locale: Locale;
  events: HealthEvent[];
};

export function AnimalHealthTimeline({ locale, events }: AnimalHealthTimelineProps) {
  const t = getDictionary(locale).animalHealth;
  if (events.length === 0) return null;

  return (
    <ul className="space-y-2">
      {events.map((event) => {
        const formattedDate = new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(event.data));
        return (
          <li key={event.id} className="rounded-xl border border-border/25 px-3 py-2 text-xs">
            <p className="font-semibold">
              {t.types[event.tipo]}
              <span className="ml-2 text-[11px] font-medium text-muted-foreground">{formattedDate}</span>
            </p>
            {event.descricao && (
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{event.descricao}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
