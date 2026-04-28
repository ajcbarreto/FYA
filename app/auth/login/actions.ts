"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { UserRole } from "@/lib/supabase/types";

function sanitizeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function login(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const dictionary = getDictionary(locale);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextValue = String(formData.get("next") ?? "").trim();
  const nextPath = sanitizeNextPath(nextValue);

  if (!email || !password) {
    redirect(`/${locale}/auth/login?error=${encodeURIComponent(dictionary.auth.invalidData)}`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/${locale}/auth/login?error=${encodeURIComponent(dictionary.auth.invalidCredentials)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (nextPath) {
    redirect(`/${locale}${nextPath}`);
  }

  if (role === "admin") {
    redirect(`/${locale}/admin`);
  }

  if (role === "canil") {
    redirect(`/${locale}/canil`);
  }

  redirect(`/${locale}/user`);
}
