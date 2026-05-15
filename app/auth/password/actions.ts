"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getLocaleFromForm(formData: FormData): Locale {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return isLocale(localeValue) ? localeValue : defaultLocale;
}

async function getOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.") ? "http" : "https";
  return host ? `${protocol}://${host}` : "";
}

export async function requestPasswordReset(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(`/${locale}/auth/forgot-password?error=invalid_email`);
  }

  const supabase = await createServerSupabaseClient();
  const origin = await getOrigin();
  const next = encodeURIComponent(`/${locale}/auth/reset-password`);
  const redirectTo = origin
    ? `${origin}/auth/callback?next=${next}`
    : `/auth/callback?next=${next}`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Resposta sempre generica para nao revelar se o email existe.
  redirect(`/${locale}/auth/forgot-password?success=sent`);
}

export async function updatePassword(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    redirect(`/${locale}/auth/reset-password?error=weak_password`);
  }
  if (password !== confirmPassword) {
    redirect(`/${locale}/auth/reset-password?error=mismatch`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/reset-password?error=expired`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/${locale}/auth/reset-password?error=update_failed`);
  }

  redirect(`/${locale}/auth/login?success=password_updated`);
}
