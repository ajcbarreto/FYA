"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetCatalogFiltersKey, parseCommaSeparatedList } from "@/lib/pet-catalog/filter-config";
import { getPlatformSettingsKey } from "@/lib/admin/platform-settings";
import type { UserRole } from "@/lib/supabase/types";

function getLocale(formData: FormData): Locale {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return isLocale(localeValue) ? localeValue : defaultLocale;
}

async function requireAdmin(locale: Locale) {
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
    .maybeSingle();

  if ((profile?.role as UserRole | undefined) !== "admin") {
    redirect(`/${locale}/admin?error=unauthorized`);
  }

  return supabase;
}

export async function updatePlatformSettings(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await requireAdmin(locale);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const platformName = String(formData.get("platformName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  const defaultAdoptionFee = String(formData.get("defaultAdoptionFee") ?? "").trim();
  const requireVerificationToPublish = String(formData.get("requireVerificationToPublish") ?? "") === "on";

  if (!platformName) {
    redirect(`/${locale}/admin/configuracoes?error=invalid_platform`);
  }

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: getPlatformSettingsKey(),
      value: {
        platformName,
        contactEmail,
        supportEmail,
        defaultAdoptionFee,
        requireVerificationToPublish,
      },
      updated_by: user?.id ?? null,
    },
    { onConflict: "key" },
  );

  if (error) {
    redirect(`/${locale}/admin/configuracoes?error=platform_failed`);
  }

  revalidatePath(`/${locale}/admin/configuracoes`);
  redirect(`/${locale}/admin/configuracoes?success=platform_saved`);
}

export async function toggleShelterVerification(formData: FormData) {
  const locale = getLocale(formData);
  const shelterId = String(formData.get("shelterId") ?? "").trim();
  const verify = String(formData.get("verify") ?? "") === "true";

  if (!shelterId) {
    redirect(`/${locale}/admin/canis?error=invalid_shelter`);
  }

  const supabase = await requireAdmin(locale);
  const { error } = await supabase
    .from("canis")
    .update({ verificado: verify })
    .eq("id", shelterId);

  if (error) {
    redirect(`/${locale}/admin/canis?error=verification_failed`);
  }

  revalidatePath(`/${locale}/admin/canis`);
  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin/canis?success=${verify ? "shelter_verified" : "shelter_unverified"}`);
}

export async function updatePetCatalogFilters(formData: FormData) {
  const locale = getLocale(formData);
  const dictionary = getDictionary(locale);
  const supabase = await requireAdmin(locale);

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    redirect(`/${locale}/admin/configuracoes?error=${encodeURIComponent(dictionary.admin.genericError)}`);
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
      updated_by: user?.id ?? null,
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    redirect(`/${locale}/admin/configuracoes?error=${encodeURIComponent(dictionary.admin.genericError)}`);
  }

  revalidatePath(`/${locale}/admin/configuracoes`);
  redirect(`/${locale}/admin/configuracoes?success=${encodeURIComponent(dictionary.admin.success)}`);
}
