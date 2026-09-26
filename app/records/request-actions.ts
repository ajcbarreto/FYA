"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
import { queueQuery, type QueueSearch } from "@/lib/records/request-queue";
function finish(locale: string, form: FormData, ok: boolean) {
  const query = queueQuery(
    Object.fromEntries(
      new URLSearchParams(String(form.get("filters") ?? "")),
    ) as QueueSearch,
  );
  revalidatePath(`/${locale}/canil/pedidos`);
  revalidatePath(`/${locale}/canil/operacao`);
  redirect(
    `/${locale}/canil/pedidos?${query}&${ok ? "success=updated" : "error=save_failed"}`,
  );
}
export async function assignApplication(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const id = String(form.get("applicationId") ?? ""),
    assignee = String(form.get("assigneeId") ?? "");
  if (!validId(id) || (assignee && !validId(assignee)))
    finish(c.locale, form, false);
  const { error } = await c.supabase
    .from("request_internal_notes")
    .upsert({ request_id: id, assignee_id: assignee || null });
  finish(c.locale, form, !error);
}
export async function saveReplyTemplate(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const id = String(form.get("templateId") ?? ""),
    title = String(form.get("title") ?? "").trim(),
    body = String(form.get("body") ?? "").trim();
  if (
    !c.shelter ||
    (id && !validId(id)) ||
    !title ||
    title.length > 100 ||
    !body ||
    body.length > 3000
  )
    finish(c.locale, form, false);
  const values = { title, body, updated_at: new Date().toISOString() };
  const result = id
    ? await c.supabase
        .from("shelter_reply_templates")
        .update(values)
        .eq("id", id)
        .eq("canil_id", c.shelter!.id)
        .select("id")
    : await c.supabase
        .from("shelter_reply_templates")
        .insert({ ...values, canil_id: c.shelter!.id })
        .select("id");
  finish(c.locale, form, !result.error && Boolean(result.data?.length));
}
export async function deleteReplyTemplate(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const id = String(form.get("templateId") ?? "");
  if (!c.shelter || !validId(id)) finish(c.locale, form, false);
  const { error, data } = await c.supabase
    .from("shelter_reply_templates")
    .delete()
    .eq("id", id)
    .eq("canil_id", c.shelter!.id)
    .select("id");
  finish(c.locale, form, !error && Boolean(data?.length));
}
export async function replyToApplication(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const id = String(form.get("applicationId") ?? ""),
    messageId = String(form.get("messageId") ?? ""),
    body = String(form.get("reply") ?? "").trim();
  if (!validId(id) || !validId(messageId) || !body || body.length > 4000)
    finish(c.locale, form, false);
  const { error } = await c.supabase.rpc("reply_to_application", {
    p_request: id,
    p_message_id: messageId,
    p_body: body,
  });
  revalidatePath(`/${c.locale}/canil/mensagens`);
  finish(c.locale, form, !error);
}
