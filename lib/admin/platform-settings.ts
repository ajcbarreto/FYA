import type { SupabaseClient } from "@supabase/supabase-js";

export type PlatformSettings = {
  platformName: string;
  contactEmail: string;
  supportEmail: string;
  defaultAdoptionFee: string;
  requireVerificationToPublish: boolean;
};

const defaults: PlatformSettings = {
  platformName: "FYA (Found Your Animal)",
  contactEmail: "contacto@fya.local",
  supportEmail: "apoio@fya.local",
  defaultAdoptionFee: "",
  requireVerificationToPublish: false,
};

const SETTINGS_KEY = "platform_settings";

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  return fallback;
}

export function normalizePlatformSettings(value: unknown): PlatformSettings {
  if (typeof value !== "object" || value === null) {
    return defaults;
  }

  const candidate = value as Partial<Record<keyof PlatformSettings, unknown>>;
  return {
    platformName: readString(candidate.platformName, defaults.platformName),
    contactEmail: readString(candidate.contactEmail, defaults.contactEmail),
    supportEmail: readString(candidate.supportEmail, defaults.supportEmail),
    defaultAdoptionFee: readString(candidate.defaultAdoptionFee, defaults.defaultAdoptionFee),
    requireVerificationToPublish: readBoolean(
      candidate.requireVerificationToPublish,
      defaults.requireVerificationToPublish,
    ),
  };
}

export async function getPlatformSettings(supabase: SupabaseClient): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  return normalizePlatformSettings(data.value);
}

export function getPlatformSettingsKey() {
  return SETTINGS_KEY;
}
