"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getDisplayName } from "@/lib/adoption/db";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();
  const authorName = getDisplayName(
    profile?.full_name ?? null,
    profile?.email ?? user.email ?? "adopter@fya.local",
    locale === "pt" ? "Adotante" : "Adopter",
  );

  // Nova/atualizada avaliacao volta a 'pendente' para ser moderada pelo canil.
  const { error } = await supabase.from("avaliacoes_canil").upsert(
    {
      canil_id: shelterId,
      author_profile_id: user.id,
      author_name: authorName,
      rating: ratingValue,
      comentario: comentario || null,
      estado: "pendente",
    },
    { onConflict: "canil_id,author_profile_id" },
  );

  if (error) {
    console.error("[submitShelterReview] error:", error.message);
    redirect(`${redirectBase}?error=review_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=review_pending`);
}

export async function moderateReview(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const redirectBase = `/${locale}/canil/avaliacoes`;

  if (!reviewId || (decision !== "aprovada" && decision !== "rejeitada")) {
    redirect(`${redirectBase}?error=invalid_review`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/avaliacoes`);
  }

  // A RLS garante que so o dono do canil consegue atualizar.
  const { error } = await supabase
    .from("avaliacoes_canil")
    .update({ estado: decision })
    .eq("id", reviewId);

  if (error) {
    console.error("[moderateReview] error:", error.message);
    redirect(`${redirectBase}?error=moderation_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=${decision === "aprovada" ? "review_approved" : "review_rejected"}`);
}
