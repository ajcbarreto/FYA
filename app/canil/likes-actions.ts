"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function setShelterLike(form: FormData) {
  const locale = String(form.get("locale"));
  const id = String(form.get("shelterId"));
  if (!isLocale(locale) || !/^[0-9a-f-]{36}$/i.test(id)) return;
  const path = `/${locale}/canis/${id}`;
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=${encodeURIComponent(path)}`);
  const { error } = form.get("liked") === "true"
    ? await db.from("canil_likes").upsert({ canil_id: id, user_profile_id: user.id }, { onConflict: "canil_id,user_profile_id" })
    : await db.from("canil_likes").delete().eq("canil_id", id).eq("user_profile_id", user.id);
  if (error) redirect(`${path}?error=like_failed`);
  revalidatePath(path);
}
