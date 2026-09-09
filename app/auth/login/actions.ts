"use server";

import { safeLocalPath } from "@/lib/auth/redirect";
import { loginErrorMessage } from "@/lib/auth/login-error";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { UserRole } from "@/lib/supabase/types";

const oauthProviders = ["google", "facebook", "apple"] as const;

export async function login(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const dictionary = getDictionary(locale);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextValue = String(formData.get("next") ?? "").trim();
  const nextPath = safeLocalPath(nextValue);

  if (!email || !password) {
    redirect(
      `/${locale}/auth/login?error=${encodeURIComponent(dictionary.auth.invalidData)}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    console.error("[login] Authentication failed", {
      code: error?.code ?? "missing_user",
      status: error?.status,
    });
    redirect(
      `/${locale}/auth/login?error=${encodeURIComponent(loginErrorMessage(error?.code, locale))}`,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (nextPath) {
    redirect(
      /^\/(pt|en)(\/|$)/.test(nextPath) ? nextPath : `/${locale}${nextPath}`,
    );
  }

  if (role === "admin") {
    redirect(`/${locale}/admin`);
  }

  if (role === "canil") {
    redirect(`/${locale}/canil`);
  }

  redirect(`/${locale}/user`);
}

export async function signInWithProvider(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const provider = String(formData.get("provider") ?? "");
  if (!oauthProviders.includes(provider as (typeof oauthProviders)[number])) {
    redirect(`/${locale}/auth/login?error=provider_unavailable`);
  }
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const nextPath = safeLocalPath(String(formData.get("next") ?? ""));
  const callback = new URL(`${origin}/auth/callback`);
  callback.searchParams.set("next", nextPath ?? `/${locale}/user`);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "google" | "facebook" | "apple",
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) {
    redirect(`/${locale}/auth/login?error=provider_unavailable`);
  }
  redirect(data.url);
}
