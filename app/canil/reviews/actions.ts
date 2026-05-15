"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function submitShelterReview(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const shelterId = String(formData.get("shelterId") ?? "").trim();
  const ratingValue = Number.parseInt(String(formData.get("rating") ?? ""), 10);
  const comentario = String(formData.get("comentario") ?? "").trim();
  const redirectBase = `/${locale}/canis/${shelterId}`;

  if (!shelterId || !Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    redirect(`${redirectBase}?error=invalid_review`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canis/${shelterId}`);
  }

  const { error } = await supabase.from("avaliacoes_canil").upsert(
    {
      canil_id: shelterId,
      author_profile_id: user.id,
      rating: ratingValue,
      comentario: comentario || null,
    },
    { onConflict: "canil_id,author_profile_id" },
  );

  if (error) {
    console.error("[submitShelterReview] error:", error.message);
    redirect(`${redirectBase}?error=review_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=review_saved`);
}
