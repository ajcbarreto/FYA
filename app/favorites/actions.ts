"use server";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function setFavorite(
  animalId: string,
  desired: boolean,
  locale: string,
) {
  if (
    !isLocale(locale) ||
    !/^[0-9a-f-]{36}$/i.test(animalId) ||
    typeof desired !== "boolean"
  )
    return { error: "invalid" };
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "login" };
  const { error } = desired
    ? await supabase
        .from("favoritos")
        .upsert(
          { user_profile_id: user.id, animal_id: animalId },
          { onConflict: "user_profile_id,animal_id" },
        )
    : await supabase
        .from("favoritos")
        .delete()
        .eq("user_profile_id", user.id)
        .eq("animal_id", animalId);
  if (error) return { error: "save" };
  revalidatePath(`/${locale}/user/favoritos`);
  return { saved: desired };
}
