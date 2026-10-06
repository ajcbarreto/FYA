"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { contactContext } from "@/lib/contact/context";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "@/lib/records/validation";
import { partnershipCategories } from "@/lib/contact/config";
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function submitPartnership(
  _previous: { error: string },
  f: FormData,
): Promise<{ error: string }> {
  const locale = isLocale(field(f, "locale")) ? field(f, "locale") : "pt",
    pt = locale === "pt";
  const organization = field(f, "organization"),
    contact = field(f, "contact"),
    email = field(f, "email"),
    website = field(f, "website"),
    category = field(f, "category"),
    subject = field(f, "subject"),
    message = field(f, "message");
  let websiteValid = !website;
  try {
    if (website) websiteValid = new URL(website).protocol === "https:";
  } catch {}
  if (
    field(f, "fax") ||
    organization.length < 2 ||
    organization.length > 160 ||
    contact.length < 2 ||
    contact.length > 120 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !websiteValid ||
    website.length > 500 ||
    !partnershipCategories.some((c) => c === category) ||
    subject.length < 3 ||
    subject.length > 160 ||
    message.length < 10 ||
    message.length > 4000 ||
    f.get("consent") !== "on"
  )
    return {
      error: pt
        ? "Verifica os campos e a autorização de contacto."
        : "Check the fields and contact consent.",
    };
  const admin = createAdminSupabaseClient();
  if (!admin)
    return {
      error: pt
        ? "O formulário está temporariamente indisponível. Tenta mais tarde."
        : "The form is temporarily unavailable. Try again later.",
    };
  const { data, error } = await admin.rpc("submit_partnership", {
    p_organization: organization,
    p_contact: contact,
    p_email: email,
    p_website: website,
    p_category: category,
    p_subject: subject,
    p_message: message,
    p_consent: true,
  });
  if (error || !data)
    return {
      error: pt
        ? "Não foi possível registar. Tenta mais tarde; são permitidos até três pedidos por email em 24 horas."
        : "Unable to submit. Try later; up to three requests per email are allowed in 24 hours.",
    };
  revalidatePath(`/${locale}/admin/contactos`);
  redirect(`/${locale}/parcerias?received=${data}#proposta`);
}
export async function submitHelp(f: FormData) {
  const c = await contactContext(field(f, "locale"));
  const { data, error } = await c.supabase.rpc("submit_shelter_help", {
    p_shelter: field(f, "shelter"),
    p_category: field(f, "category"),
    p_subject: field(f, "subject"),
    p_message: field(f, "message"),
    p_priority: field(f, "priority"),
  });
  revalidatePath(`/${c.locale}/admin/contactos`);
  revalidatePath(`/${c.locale}/canil/ajuda-fya`);
  redirect(
    `/${c.locale}/canil/ajuda-fya?${error || !data ? "error=failed" : `id=${data}&success=saved`}`,
  );
}
export async function updateContact(f: FormData) {
  const admin = field(f, "audience") === "admin",
    c = await contactContext(field(f, "locale"), admin),
    id = field(f, "id"),
    path = `/${c.locale}/${admin ? "admin/contactos" : "canil/ajuda-fya"}`;
  if (!validId(id)) redirect(`${path}?error=failed`);
  const { error } = await c.supabase.rpc("update_contact_request", {
    p_id: id,
    p_status: field(f, "status"),
    p_priority: field(f, "priority"),
    p_body: field(f, "body"),
    p_internal: admin && f.get("internal") === "on",
  });
  revalidatePath(`/${c.locale}/admin/contactos`);
  revalidatePath(`/${c.locale}/canil/ajuda-fya`);
  redirect(`${path}?id=${id}&${error ? "error=failed" : "success=saved"}`);
}
