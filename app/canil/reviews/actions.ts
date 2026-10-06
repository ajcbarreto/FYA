"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { validId } from "@/lib/records/validation";
function localeOf(form: FormData) {
  const locale = String(form.get("locale") ?? defaultLocale);
  return isLocale(locale) ? locale : defaultLocale;
}
async function context(form: FormData) {
  const locale = localeOf(form),
    db = await createServerSupabaseClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);
  return { locale, db };
}
function refresh(locale: string, id: string) {
  revalidatePath(`/${locale}/canis/${id}`);
  revalidatePath(`/${locale}/canis`);
  revalidatePath(`/${locale}/canil/avaliacoes`);
  revalidatePath(`/${locale}/admin/avaliacoes`);
}
export async function submitShelterReview(form: FormData) {
  const { locale, db } = await context(form),
    id = String(form.get("shelterId") ?? ""),
    rating = Number(form.get("rating")),
    comment = String(form.get("comentario") ?? "").trim();
  if (!validId(id)) redirect(`/${locale}/canis`);
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    comment.length > 2000
  )
    redirect(`/${locale}/canis/${id}?error=invalid_review#comentarios`);
  const { error } = await db.rpc("submit_verified_shelter_review", {
    p_shelter: id,
    p_rating: rating,
    p_comment: comment,
  });
  refresh(locale, id);
  redirect(
    `/${locale}/canis/${id}?${error ? "error=review_failed" : "success=review_saved"}#comentarios`,
  );
}
export async function replyReview(form: FormData) {
  const { locale, db } = await context(form),
    id = String(form.get("reviewId") ?? ""),
    body = String(form.get("body") ?? "").trim();
  if (!validId(id) || body.length < 3 || body.length > 2000)
    redirect(`/${locale}/canil/avaliacoes?error=failed`);
  const { data: r } = await db
    .from("avaliacoes_canil")
    .select("canil_id")
    .eq("id", id)
    .single();
  const { error } = await db.rpc("reply_shelter_review", {
    p_review: id,
    p_body: body,
  });
  if (r) refresh(locale, r.canil_id);
  redirect(
    `/${locale}/canil/avaliacoes?${error ? "error=failed" : "success=saved"}`,
  );
}
export async function reportReview(form: FormData) {
  const { locale, db } = await context(form),
    id = String(form.get("reviewId") ?? ""),
    reason = String(form.get("reason") ?? "").trim();
  if (!validId(id)) redirect(`/${locale}/canis`);
  const { data: r } = await db
    .from("avaliacoes_canil")
    .select("canil_id")
    .eq("id", id)
    .single();
  if (!r) redirect(`/${locale}/canis`);
  if (reason.length < 10 || reason.length > 2000)
    redirect(`/${locale}/canis/${r.canil_id}?error=report_failed#comentarios`);
  const { error } = await db.rpc("report_shelter_review", {
    p_review: id,
    p_reason: reason,
  });
  refresh(locale, r.canil_id);
  redirect(
    `/${locale}/canis/${r.canil_id}?${error ? "error=report_failed" : "success=report_saved"}#comentarios`,
  );
}
export async function moderateReview(form: FormData) {
  const { locale, db } = await context(form),
    id = String(form.get("reviewId") ?? ""),
    decision = String(form.get("decision") ?? ""),
    reason = String(form.get("reason") ?? "").trim();
  if (
    !validId(id) ||
    !["aprovada", "rejeitada"].includes(decision) ||
    reason.length < 10 ||
    reason.length > 2000
  )
    redirect(`/${locale}/admin/avaliacoes?error=failed`);
  const { data: r } = await db
    .from("avaliacoes_canil")
    .select("canil_id")
    .eq("id", id)
    .single();
  const { error } = await db.rpc("moderate_shelter_review", {
    p_review: id,
    p_decision: decision,
    p_reason: reason,
  });
  if (r) refresh(locale, r.canil_id);
  redirect(
    `/${locale}/admin/avaliacoes?${error ? "error=failed" : "success=saved"}`,
  );
}
