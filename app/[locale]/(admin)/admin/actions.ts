"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetCatalogFiltersKey, parseCommaSeparatedList } from "@/lib/pet-catalog/filter-config";
import type { UserRole } from "@/lib/supabase/types";

function getLocale(formData: FormData): Locale {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return isLocale(localeValue) ? localeValue : defaultLocale;
}

export async function updatePetCatalogFilters(formData: FormData) {
  const locale = getLocale(formData);
  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/admin`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (role !== "admin") {
    redirect(`/${locale}/admin?error=${encodeURIComponent(dictionary.admin.unauthorized)}`);
  }

  const species = parseCommaSeparatedList(String(formData.get("species") ?? ""));
  const ageRanges = parseCommaSeparatedList(String(formData.get("ageRanges") ?? ""));
  const sizes = parseCommaSeparatedList(String(formData.get("sizes") ?? ""));
  const genders = parseCommaSeparatedList(String(formData.get("genders") ?? ""));
  const compatibilities = parseCommaSeparatedList(String(formData.get("compatibilities") ?? ""));

  if (
    species.length === 0 ||
    ageRanges.length === 0 ||
    sizes.length === 0 ||
    genders.length === 0 ||
    compatibilities.length === 0
  ) {
    redirect(`/${locale}/admin?error=${encodeURIComponent(dictionary.admin.genericError)}`);
  }

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: getPetCatalogFiltersKey(),
      value: {
        species,
        ageRanges,
        sizes,
        genders,
        compatibilities,
      },
      updated_by: user.id,
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    redirect(`/${locale}/admin?error=${encodeURIComponent(dictionary.admin.genericError)}`);
  }

  redirect(`/${locale}/admin?success=${encodeURIComponent(dictionary.admin.success)}`);
}
