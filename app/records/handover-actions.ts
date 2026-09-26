"use server";
import { recordsContext } from "@/lib/records/context";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function saveHandoverSettings(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  if (!c.shelter || c.shelter.owner_profile_id !== c.user.id)
    throw new Error("Forbidden");
  const items = [
    ...new Set(
      String(form.get("items") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (!items.length || items.length > 20 || items.some((i) => i.length > 200))
    redirect(`/${c.locale}/canil/equipa?error=failed`);
  const { error } = await c.supabase
    .from("shelter_handover_settings")
    .upsert({
      canil_id: c.shelter.id,
      items,
      required: form.get("required") === "on",
    });
  revalidatePath(`/${c.locale}/canil/equipa`);
  redirect(
    `/${c.locale}/canil/equipa?${error ? "error=failed" : "success=saved"}`,
  );
}
export async function saveHandover(form: FormData) {
  const c = await recordsContext(
    String(form.get("locale") ?? "pt"),
    String(form.get("animalId")),
  );
  const { data: settings, error: settingsError } = await c.supabase
    .from("shelter_handover_settings")
    .select("items")
    .eq("canil_id", c.shelter!.id)
    .maybeSingle();
  if (settingsError || !settings) throw new Error("Checklist unavailable");
  const selected = form.getAll("items").map(String);
  if (selected.some((x) => !settings.items.includes(x)))
    throw new Error("Invalid checklist");
  const { error } = await c.supabase
    .from("animal_handover")
    .upsert({
      animal_id: c.animal!.id,
      checked_items: selected,
      confirmed_by: c.user.id,
      confirmed_at: new Date().toISOString(),
    });
  const path = `/${c.locale}/canil/animais/${c.animal!.id}/registos`;
  revalidatePath(path);
  redirect(`${path}?${error ? "error=failed" : "success=saved"}`);
}
