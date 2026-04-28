"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { UserRole } from "@/lib/supabase/types";

const allowedRoles: UserRole[] = ["user", "canil"];

export async function register(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const dictionary = getDictionary(locale);
  const source = String(formData.get("source") ?? "register");
  const redirectBasePath =
    source === "shelter_registration" ? `/${locale}/auth/shelter-registration` : `/${locale}/auth/register`;
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "user") as UserRole;
  const shelterName = String(formData.get("shelter_name") ?? "").trim();
  const shelterLocation = String(formData.get("shelter_location") ?? "").trim();
  const shelterMission = String(formData.get("shelter_mission") ?? "").trim();
  const contactRole = String(formData.get("contact_role") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();

  if (!fullName || !email || !password || !allowedRoles.includes(role)) {
    redirect(`${redirectBasePath}?error=${encodeURIComponent(dictionary.auth.invalidData)}`);
  }

  const userMetadata: Record<string, string> = {
    full_name: fullName,
    role,
  };

  if (role === "canil") {
    if (shelterName) userMetadata.shelter_name = shelterName;
    if (shelterLocation) userMetadata.shelter_location = shelterLocation;
    if (shelterMission) userMetadata.shelter_mission = shelterMission;
    if (contactRole) userMetadata.contact_role = contactRole;
    if (contactPhone) userMetadata.contact_phone = contactPhone;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
    },
  });

  if (error) {
    redirect(`${redirectBasePath}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`${redirectBasePath}?success=${encodeURIComponent(dictionary.auth.accountCreated)}`);
}

export async function logout(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  const locale: Locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
