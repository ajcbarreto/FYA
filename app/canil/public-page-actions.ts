"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
function finish(locale: string, id: string, ok: boolean) {
  revalidatePath(`/${locale}/canis/${id}`);
  revalidatePath(`/${locale}/canil/pagina-publica`);
  redirect(
    `/${locale}/canil/pagina-publica?${ok ? "success=saved" : "error=failed"}`,
  );
}
export async function savePublicDetails(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("shelterId") ?? ""),
    hours = String(form.get("visit_hours") ?? "").trim(),
    instructions = String(form.get("visit_instructions") ?? "").trim();
  if (
    !validId(id) ||
    !c.shelters.some((s) => s.id === id) ||
    hours.length > 500 ||
    instructions.length > 2000
  )
    redirect(`/${c.locale}/canil/pagina-publica?error=failed`);
  const { data: existing, error: readError } = await c.supabase
    .from("shelter_public_details")
    .select("canil_id")
    .eq("canil_id", id)
    .maybeSingle();
  if (readError) finish(c.locale, id, false);
  const values = { visit_hours: hours, visit_instructions: instructions };
  const { error } = existing
    ? await c.supabase
        .from("shelter_public_details")
        .update(values)
        .eq("canil_id", id)
    : await c.supabase
        .from("shelter_public_details")
        .insert({ canil_id: id, ...values });
  finish(c.locale, id, !error);
}
export async function publishShelterNews(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("shelterId") ?? ""),
    title = String(form.get("title") ?? "").trim(),
    body = String(form.get("body") ?? "").trim();
  if (
    !validId(id) ||
    !c.shelters.some((s) => s.id === id) ||
    title.length < 3 ||
    title.length > 160 ||
    body.length < 10 ||
    body.length > 3000
  )
    redirect(`/${c.locale}/canil/pagina-publica?error=failed`);
  const { error } = await c.supabase.from("shelter_news").insert({
    canil_id: id,
    title,
    body,
    published: form.get("published") === "on",
  });
  finish(c.locale, id, !error);
}
export async function changeNewsVisibility(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("newsId") ?? "");
  if (!validId(id)) redirect(`/${c.locale}/canil/pagina-publica?error=failed`);
  const { data: row, error } = await c.supabase
    .from("shelter_news")
    .update({ published: form.get("published") === "true" })
    .eq("id", id)
    .select("canil_id")
    .single();
  if (error || !row) redirect(`/${c.locale}/canil/pagina-publica?error=failed`);
  finish(c.locale, row.canil_id, true);
}
