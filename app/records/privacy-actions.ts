"use server";
import { recordsContext } from "@/lib/records/context";
import { shortText, validId } from "@/lib/records/validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function requestPrivacy(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    kind = String(form.get("kind"));
  if (!["access", "erasure", "rectification"].includes(kind))
    redirect(`/${c.locale}/conta/privacidade?error=invalid`);
  const { error } = await c.supabase
    .from("privacy_requests")
    .insert({ kind, message: shortText(form, "message") });
  revalidatePath(`/${c.locale}/conta/privacidade`);
  redirect(
    `/${c.locale}/conta/privacidade?${error ? "error=failed" : "success=saved"}`,
  );
}
export async function respondPrivacy(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const { data: profile } = await c.supabase
    .from("profiles")
    .select("role")
    .eq("id", c.user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  const id = String(form.get("requestId")),
    status = String(form.get("status")),
    response = shortText(form, "response");
  if (
    !validId(id) ||
    !["in_progress", "completed", "declined"].includes(status) ||
    !response
  )
    redirect(`/${c.locale}/admin/privacidade?error=invalid`);
  const { error } = await c.supabase
    .from("privacy_requests")
    .update({ status, response, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/${c.locale}/admin/privacidade`);
  redirect(
    `/${c.locale}/admin/privacidade?${error ? "error=failed" : "success=saved"}`,
  );
}
