import type { SupabaseClient } from "@supabase/supabase-js";

export type PetCatalogFiltersConfig = {
  species: string[];
  ageRanges: string[];
  sizes: string[];
  genders: string[];
  compatibilities: string[];
};

const defaults: PetCatalogFiltersConfig = {
  species: ["Dog", "Cat", "Other"],
  ageRanges: ["Baby (0-1)", "Young (1-3)", "Adult (3-7)", "Senior (7+)"],
  sizes: ["Small", "Medium", "Large"],
  genders: ["Male", "Female"],
  compatibilities: ["Kid Friendly", "Senior Friendly", "Apartment Life", "Well Trained"],
};

const SETTINGS_KEY = "pet_catalog_filters";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeArray(value: unknown, fallback: string[]) {
  if (!isStringArray(value)) {
    return fallback;
  }

  const normalized = value.map((item) => item.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

export function parseCommaSeparatedList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizePetCatalogFiltersConfig(value: unknown): PetCatalogFiltersConfig {
  if (typeof value !== "object" || value === null) {
    return defaults;
  }

  const candidate = value as Partial<PetCatalogFiltersConfig>;
  return {
    species: normalizeArray(candidate.species, defaults.species),
    ageRanges: normalizeArray(candidate.ageRanges, defaults.ageRanges),
    sizes: normalizeArray(candidate.sizes, defaults.sizes),
    genders: normalizeArray(candidate.genders, defaults.genders),
    compatibilities: normalizeArray(candidate.compatibilities, defaults.compatibilities),
  };
}

export async function getPetCatalogFiltersConfig(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  return normalizePetCatalogFiltersConfig(data.value);
}

export function getPetCatalogFiltersKey() {
  return SETTINGS_KEY;
}
