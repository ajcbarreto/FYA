import { HelpLink } from "@/components/help-link";
import { recordsContext } from "@/lib/records/context";
import {
  createSlot,
  removeSlot,
  rescheduleVisit,
} from "@/app/records/agenda-actions";
import { LocalDateTime } from "@/components/local-datetime";
import { SubmitButton } from "@/components/submit-button";
export default async function Agenda({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params,
    c = await recordsContext(locale),
    pt = locale === "pt",
    feedback = await searchParams;
  if (!c.shelter) return null;
  const [slots, visits] = await Promise.all([
    c.supabase
      .from("visit_slots")
      .select("*")
      .eq("canil_id", c.shelter.id)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(100),
    c.supabase
      .from("visitas")
      .select("id,scheduled_at,status,animais(nome)")
      .eq("canil_id", c.shelter.id)
      .in("status", ["proposta", "confirmada"])
      .order("scheduled_at")
      .limit(100),
  ]);
  if (slots.error || visits.error) throw new Error("Unable to load agenda");
  const hidden = <input name="locale" type="hidden" value={locale} />,
    box = "rounded-2xl border border-border p-6 space-y-3",
    button = "rounded-full bg-primary px-5 py-2 text-primary-foreground";
  return (
    <main id="main-content" className="space-y-6">
      <h1 className="page-title">
        {pt ? "Agenda de visitas" : "Visit calendar"}
      </h1>
      <HelpLink locale={locale} guide="equipa-tarefas-visitas" />
      <p>
        {pt
          ? "Com horários futuros definidos, as novas marcações têm de usar um desses horários. Sem horários definidos, o canil recebe propostas livres."
          : "When future slots exist, new bookings must use one of them. Otherwise the shelter receives open proposals."}
      </p>
      {feedback.error && (
        <p role="alert">
          {pt
            ? "Não foi possível guardar. Verifica disponibilidade, capacidade e permissões."
            : "Could not save. Check availability, capacity and permissions."}
        </p>
      )}
      {feedback.success && (
        <p role="status">{pt ? "Agenda atualizada." : "Calendar updated."}</p>
      )}
      <form action={createSlot} className={box}>
        {hidden}
        <label className="block">
          {pt ? "Data e hora local" : "Local date and time"}
          <LocalDateTime name="starts_at" />
        </label>
        <label className="block">
          {pt ? "Capacidade" : "Capacity"}
          <input
            name="capacity"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="field"
            required
          />
        </label>
        <SubmitButton className={button}>
          {pt ? "Adicionar horário" : "Add slot"}
        </SubmitButton>
      </form>
      <section className={box}>
        <h2 className="font-bold">
          {pt ? "Horários (até 100)" : "Slots (up to 100)"}
        </h2>
        {slots.data?.map((s) => (
          <form action={removeSlot} key={s.id}>
            {hidden}
            <input type="hidden" name="slotId" value={s.id} />
            <p>
              {new Date(s.starts_at).toLocaleString(locale)} ·{" "}
              {pt ? "capacidade" : "capacity"} {s.capacity}
            </p>
            <SubmitButton className="text-destructive">
              {pt ? "Remover horário sem reservas" : "Remove unbooked slot"}
            </SubmitButton>
          </form>
        ))}
      </section>
      <section className={box}>
        <h2 className="font-bold">
          {pt ? "Visitas (até 100)" : "Visits (up to 100)"}
        </h2>
        {visits.data?.map((v) => (
          <form
            action={rescheduleVisit}
            key={v.id}
            className="space-y-3 border-t border-border pt-4"
          >
            {hidden}
            <input type="hidden" name="visitId" value={v.id} />
            <p>
              {v.animais?.nome} ·{" "}
              {new Date(v.scheduled_at).toLocaleString(locale)} · {v.status}
            </p>
            <label className="block">
              {pt ? "Novo horário" : "New time"}
              <LocalDateTime name="starts_at" />
            </label>
            <SubmitButton className={button}>
              {pt
                ? "Reagendar como nova proposta"
                : "Reschedule as new proposal"}
            </SubmitButton>
          </form>
        ))}
      </section>
    </main>
  );
}
