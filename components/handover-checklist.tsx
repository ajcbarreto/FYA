import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  saveHandover,
  saveHandoverSettings,
} from "@/app/records/handover-actions";
import { SubmitButton } from "@/components/submit-button";
export async function HandoverChecklist({
  supabase,
  shelterId,
  animalId,
  locale,
  settingsOnly = false,
}: {
  supabase: SupabaseClient<Database>;
  shelterId: string;
  animalId?: string;
  locale: string;
  settingsOnly?: boolean;
}) {
  const { data: settings, error } = await supabase
    .from("shelter_handover_settings")
    .select("*")
    .eq("canil_id", shelterId)
    .maybeSingle();
  if (error) throw new Error("Unable to load checklist");
  const pt = locale === "pt";
  if (settingsOnly)
    return (
      <form
        action={saveHandoverSettings}
        className="rounded-2xl border border-border p-6 space-y-4"
      >
        <input type="hidden" name="locale" value={locale} />
        <h2 className="font-bold">
          {pt ? "Checklist de entrega" : "Handover checklist"}
        </h2>
        <label className="block">
          {pt ? "Um requisito por linha" : "One requirement per line"}
          <textarea
            className="field"
            name="items"
            rows={4}
            required
            defaultValue={
              settings?.items.join("\n") ??
              (pt
                ? "Identificação conferida\nCuidados explicados\nDocumentos de entrega"
                : "Identification checked\nCare explained\nHandover documents")
            }
          />
        </label>
        <label className="flex gap-2">
          <input
            type="checkbox"
            name="required"
            defaultChecked={settings?.required ?? false}
          />
          {pt
            ? "Exigir checklist completa antes de concluir a adoção"
            : "Require a complete checklist before completing adoption"}
        </label>
        <SubmitButton className="button-primary">
          {pt ? "Guardar checklist" : "Save checklist"}
        </SubmitButton>
      </form>
    );
  if (!settings || !animalId) return null;
  const { data: handover, error: he } = await supabase
    .from("animal_handover")
    .select("*")
    .eq("animal_id", animalId)
    .maybeSingle();
  if (he) throw new Error("Unable to load handover");
  return (
    <form
      action={saveHandover}
      className="rounded-2xl border border-border p-6 space-y-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="animalId" value={animalId} />
      <h2 className="font-bold">
        {pt ? "Preparação da entrega" : "Handover preparation"}
      </h2>
      {settings.items.map((item) => (
        <label className="flex gap-2" key={item}>
          <input
            type="checkbox"
            name="items"
            value={item}
            defaultChecked={handover?.checked_items.includes(item) ?? false}
          />
          {item}
        </label>
      ))}
      <p>
        {settings.required
          ? pt
            ? "Obrigatória para concluir a adoção."
            : "Required to complete adoption."
          : pt
            ? "Checklist de apoio à equipa."
            : "Team checklist."}
      </p>
      <SubmitButton className="button-primary">
        {pt ? "Guardar confirmação" : "Save confirmation"}
      </SubmitButton>
    </form>
  );
}
