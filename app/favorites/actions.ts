"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function toggleFavorite(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const action = String(formData.get("action") ?? "toggle");

  if (!animalId) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/pets/${animalId}`);
  }

  if (action === "remove") {
    await supabase
      .from("favoritos")
      .delete()
      .eq("user_profile_id", user.id)
      .eq("animal_id", animalId);
  } else if (action === "add") {
    await supabase
      .from("favoritos")
      .upsert({ user_profile_id: user.id, animal_id: animalId }, { onConflict: "user_profile_id,animal_id" });
  } else {
    const { data: existing } = await supabase
      .from("favoritos")
      .select("animal_id")
      .eq("user_profile_id", user.id)
      .eq("animal_id", animalId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("favoritos")
        .delete()
        .eq("user_profile_id", user.id)
        .eq("animal_id", animalId);
    } else {
      await supabase
        .from("favoritos")
        .insert({ user_profile_id: user.id, animal_id: animalId });
    }
  }

  if (redirectTo.startsWith("/")) {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }

  revalidatePath(`/${locale}/user/favoritos`);
  revalidatePath(`/${locale}/pets`);
  revalidatePath(`/${locale}/pets/${animalId}`);
}
