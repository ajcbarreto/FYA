"use server";

import { redirect } from "next/navigation";
import { mfaPath } from "@/lib/auth/mfa";
import { safeLocalPath } from "@/lib/auth/redirect";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export async function verifySecondFactor(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const next = safeLocalPath(String(formData.get("next") ?? ""));
  const retry = `${mfaPath(locale, next)}${next ? "&" : "?"}error=`;

  if (!factorId || !/^\d{6}$/.test(code)) redirect(`${retry}invalid_code`);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });
  if (error) {
    console.error("[mfa] Verification failed", { code: error.code });
    redirect(`${retry}invalid_code`);
  }

  redirect(next ?? `/${locale}/admin`);
}
