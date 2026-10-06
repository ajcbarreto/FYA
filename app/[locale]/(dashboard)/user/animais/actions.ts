"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function startIndividualListing(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const location = String(formData.get("localizacao") ?? "").trim();
  const phone = String(formData.get("telefone") ?? "").trim();

  if (formData.get("sem_pagamentos") !== "on" || !location || !phone) {
    redirect(`/${locale}/user/animais?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/user/animais`);

  const { error } = await supabase.rpc("start_individual_listing", {
    p_location: location,
    p_phone: phone,
  });
  if (error) {
    redirect(
      `/${locale}/user/animais?error=${error.message.includes("Adopter account required") ? "not_adopter" : "invalid_data"}`,
    );
  }

  redirect(`/${locale}/canil/animais/novo`);
}
