"use server";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
function done(locale: string, ok: boolean) {
  revalidatePath(`/${locale}/canil/agenda`);
  revalidatePath(`/${locale}/user/pedidos`);
  redirect(`/${locale}/canil/agenda?${ok ? "success=saved" : "error=failed"}`);
}
export async function createSlot(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const date = String(form.get("starts_at") ?? ""),
    capacity = Number(form.get("capacity"));
  if (
    !c.shelter ||
    Number.isNaN(Date.parse(date)) ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 20
  )
    done(c.locale, false);
  const { error } = await c.supabase
    .from("visit_slots")
    .insert({ canil_id: c.shelter!.id, starts_at: date, capacity });
  done(c.locale, !error);
}
export async function removeSlot(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("slotId"));
  if (!validId(id) || !c.shelter) done(c.locale, false);
  const { data, error } = await c.supabase
    .from("visit_slots")
    .delete()
    .eq("id", id)
    .eq("canil_id", c.shelter!.id)
    .select("id");
  done(c.locale, !error && !!data?.length);
}
export async function rescheduleVisit(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const id = String(form.get("visitId")),
    date = String(form.get("starts_at"));
  if (!validId(id) || Number.isNaN(Date.parse(date))) done(c.locale, false);
  const { error } = await c.supabase.rpc("reschedule_visit", {
    p_visit: id,
    p_date: date,
  });
  done(c.locale, !error);
}
