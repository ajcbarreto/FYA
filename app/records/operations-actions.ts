"use server";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordsContext } from "@/lib/records/context";
import { shortText, validId } from "@/lib/records/validation";
import { deliverEmailOutbox } from "@/lib/email/outbox";
async function context(form: FormData) {
  return recordsContext(String(form.get("locale") ?? "pt"));
}
function finish(locale: string, section: string, ok: boolean) {
  const path = `/${locale}/canil/${section}`;
  revalidatePath(`/${locale}/canil`, "layout");
  redirect(`${path}?${ok ? "success=saved" : "error=failed"}`);
}
export async function selectShelter(form: FormData) {
  const c = await context(form);
  const id = String(form.get("shelterId"));
  if (!c.shelters.some((s) => s.id === id)) finish(c.locale, "equipa", false);
  const { error } = await c.supabase
    .from("shelter_preferences")
    .upsert({ profile_id: c.user.id, canil_id: id });
  finish(c.locale, "equipa", !error);
}
export async function inviteMember(form: FormData) {
  const c = await context(form);
  const email = shortText(form, "email", 254).toLowerCase(),
    role = String(form.get("role"));
  if (
    !c.shelter ||
    c.shelter.owner_profile_id !== c.user.id ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !["reader", "editor"].includes(role)
  )
    finish(c.locale, "equipa", false);
  const { error } = await c.supabase
    .from("shelter_invitations")
    .insert({ canil_id: c.shelter!.id, email, role });
  finish(c.locale, "equipa", !error);
}
export async function removeMember(form: FormData) {
  const c = await context(form);
  const id = String(form.get("profileId"));
  if (!c.shelter || c.shelter.owner_profile_id !== c.user.id || !validId(id))
    finish(c.locale, "equipa", false);
  const { error } = await c.supabase
    .from("shelter_memberships")
    .delete()
    .eq("canil_id", c.shelter!.id)
    .eq("profile_id", id);
  finish(c.locale, "equipa", !error);
}
export async function cancelInvitation(form: FormData) {
  const c = await context(form);
  const id = String(form.get("invitationId"));
  if (!validId(id) || !c.shelter) finish(c.locale, "equipa", false);
  const { error } = await c.supabase
    .from("shelter_invitations")
    .delete()
    .eq("id", id)
    .eq("canil_id", c.shelter!.id);
  finish(c.locale, "equipa", !error);
}
export async function acceptInvitation(form: FormData) {
  const c = await context(form);
  const id = String(form.get("invitationId"));
  if (!validId(id)) redirect(`/${c.locale}/convites?error=failed`);
  const { error } = await c.supabase.rpc("accept_shelter_invitation", {
    p_id: id,
  });
  if (error) redirect(`/${c.locale}/convites?error=failed`);
  finish(c.locale, "equipa", true);
}
export async function createTask(form: FormData) {
  const c = await context(form);
  const title = shortText(form, "title", 240),
    due = shortText(form, "due_at", 40),
    animal = shortText(form, "animalId", 36),
    assignee = shortText(form, "assigneeId", 36);
  if (
    !c.shelter ||
    !title ||
    Number.isNaN(Date.parse(due)) ||
    (animal && !validId(animal)) ||
    (assignee && !validId(assignee))
  )
    finish(c.locale, "operacao", false);
  const { error } = await c.supabase
    .from("shelter_tasks")
    .insert({
      canil_id: c.shelter!.id,
      title,
      due_at: new Date(due).toISOString(),
      animal_id: animal || null,
      assignee_id: assignee || null,
    });
  finish(c.locale, "operacao", !error);
}
export async function completeTask(form: FormData) {
  const c = await context(form);
  const id = String(form.get("taskId"));
  if (!validId(id) || !c.shelter) finish(c.locale, "operacao", false);
  const { error, data } = await c.supabase
    .from("shelter_tasks")
    .update({
      completed_at: new Date().toISOString(),
      outcome: shortText(form, "outcome"),
    })
    .eq("id", id)
    .eq("canil_id", c.shelter!.id)
    .select("id");
  finish(c.locale, "operacao", !error && Boolean(data?.length));
}
export async function saveInternalNote(form: FormData) {
  const c = await context(form);
  const id = String(form.get("requestId"));
  if (!validId(id) || !c.shelter) finish(c.locale, "operacao", false);
  const { data: r } = await c.supabase
    .from("pedidos_adocao")
    .select("canil_id")
    .eq("id", id)
    .maybeSingle();
  if (r?.canil_id !== c.shelter!.id) finish(c.locale, "operacao", false);
  const { error } = await c.supabase
    .from("request_internal_notes")
    .upsert({
      request_id: id,
      notes: shortText(form, "notes", 8000),
      updated_at: new Date().toISOString(),
    });
  finish(c.locale, "operacao", !error);
}
export async function retryEmail(form: FormData) {
  const c = await context(form);
  const id = String(form.get("jobId"));
  if (!validId(id)) finish(c.locale, "operacao", false);
  const { error } = await c.supabase.rpc("retry_document_email", { p_id: id });
  if (!error)
    after(async () => {
      await deliverEmailOutbox();
    });
  finish(c.locale, "operacao", !error);
}
export async function withdrawApplication(form: FormData) {
  const c = await context(form);
  const id = String(form.get("requestId"));
  if (!validId(id)) redirect(`/${c.locale}/user/pedidos?error=invalid_data`);
  const { error } = await c.supabase.rpc("withdraw_adoption", {
    p_request: id,
  });
  revalidatePath(`/${c.locale}/user/pedidos`);
  redirect(
    `/${c.locale}/user/pedidos?${error ? "error=save_failed" : "success=updated"}`,
  );
}
