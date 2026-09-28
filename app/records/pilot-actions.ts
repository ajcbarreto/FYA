"use server";
import { verifyCaptcha } from "@/lib/captcha";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n/config";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
export async function requestPilot(form: FormData) {
  const locale = isLocale(String(form.get("locale")))
    ? String(form.get("locale"))
    : "pt";
  const fields = Object.fromEntries(
    ["organization", "contact", "email", "location", "message"].map((k) => [
      k,
      String(form.get(k) ?? "").trim(),
    ]),
  );
  const invalid =
    fields.organization.length < 2 ||
    fields.organization.length > 160 ||
    fields.contact.length < 2 ||
    fields.contact.length > 120 ||
    fields.location.length < 2 ||
    fields.location.length > 160 ||
    fields.message.length > 2000 ||
    fields.email.length > 254 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
    form.get("consent") !== "on";
  if (invalid) redirect(`/${locale}/para-canis?error=invalid#piloto`);
  if (String(form.get("website") ?? ""))
    redirect(`/${locale}/para-canis?success=received#piloto`);
  if (!(await verifyCaptcha(form)))
    redirect(`/${locale}/para-canis?error=captcha#piloto`);
  const admin = createAdminSupabaseClient();
  if (!admin) redirect(`/${locale}/para-canis?error=unavailable#piloto`);
  const { error } = await admin.rpc("submit_pilot_request", {
    p_organization: fields.organization,
    p_contact: fields.contact,
    p_email: fields.email,
    p_location: fields.location,
    p_message: fields.message,
    p_consent: true,
  });
  redirect(
    `/${locale}/para-canis?${error ? "error=unavailable" : "success=received"}#piloto`,
  );
}
export async function updatePilot(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("requestId") ?? ""),
    status = String(form.get("status") ?? ""),
    notes = String(form.get("notes") ?? "").trim();
  const { data: profile } = await c.supabase
    .from("profiles")
    .select("role")
    .eq("id", c.user.id)
    .single();
  if (
    profile?.role !== "admin" ||
    !validId(id) ||
    !["new", "contacted", "accepted", "closed"].includes(status) ||
    notes.length > 4000
  )
    redirect(`/${c.locale}/admin/pilotos?error=failed`);
  const { error, data } = await c.supabase
    .from("pilot_requests")
    .update({
      status,
      internal_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");
  revalidatePath(`/${c.locale}/admin/pilotos`);
  redirect(
    `/${c.locale}/admin/pilotos?${error || !data?.length ? "error=failed" : "success=saved"}`,
  );
}
