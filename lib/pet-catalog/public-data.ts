import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { getCatalogPets, getCatalogPetsCount } from "./db-pets";
import {
  normalizePetCatalogFiltersConfig,
  getPetCatalogFiltersKey,
} from "./filter-config";

export const PUBLIC_CATALOG_TAG = "public-catalog";
const cacheOptions = { revalidate: 60, tags: [PUBLIC_CATALOG_TAG] };
const client = () =>
  createPublicSupabaseClient(supabaseUrl, supabasePublishableKey);

// This app does not enable Cache Components; use the existing Data Cache API.
// The project URL isolates deployments using different Supabase databases.
export const getPublicCatalogPets = unstable_cache(
  (locale: string, options: Parameters<typeof getCatalogPets>[2] = {}) =>
    getCatalogPets(client(), locale, options),
  ["public-catalog-pets-v1", supabaseUrl],
  cacheOptions,
);

export const getPublicCatalogCount = unstable_cache(
  (options: Parameters<typeof getCatalogPetsCount>[1] = {}) =>
    getCatalogPetsCount(client(), options),
  ["public-catalog-count-v1", supabaseUrl],
  cacheOptions,
);

export const getPublicCatalogFilters = unstable_cache(
  async () => {
    const { data, error } = await client()
      .from("app_settings")
      .select("value")
      .eq("key", getPetCatalogFiltersKey())
      .maybeSingle();
    if (error)
      throw new Error("Unable to load catalog filters", { cause: error });
    return normalizePetCatalogFiltersConfig(data?.value);
  },
  ["public-catalog-filters-v1", supabaseUrl],
  cacheOptions,
);
