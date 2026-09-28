import type { MetadataRoute } from "next";
import { helpGuides } from "@/lib/help/guides";
import { locales } from "@/lib/i18n/config";
import { pageCopy, type PageEntry } from "@/lib/seo/pages";
import { siteOrigin } from "@/lib/seo/site";
import {
  hasSupabaseEnv,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";

// Built per request (crawlers fetch it rarely), never at build time, so new
// animals and shelters appear without a deploy and a build never depends on
// the database being reachable.
export const dynamic = "force-dynamic";

const HELP_UPDATED = "2026-09-28";

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const languages = {
    ...Object.fromEntries(locales.map((l) => [l, `${origin}/${l}${path}`])),
    "x-default": `${origin}/pt${path}`,
  };
  return locales.map((locale) => ({
    url: `${origin}/${locale}${path}`,
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

const latest = (dates: string[]) =>
  dates.reduce<string | undefined>(
    (max, d) => (!max || d > max ? d : max),
    undefined,
  );

/**
 * Only indexable, canonical URLs: fixed pages without noindex, help guides,
 * and the animals and shelters an anonymous visitor can see (published
 * animals of verified shelters, per RLS). Adopted animals stay reachable
 * from their stories but are left out, as are 404s and private areas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const animals: { id: string; created_at: string }[] = [];
  const shelters: { id: string; created_at: string }[] = [];

  if (hasSupabaseEnv) {
    const db = createPublicSupabaseClient(supabaseUrl, supabasePublishableKey);
    const [animalRows, shelterRows] = await Promise.all([
      db
        .from("animais")
        .select("id,created_at,canis!inner(id)")
        .neq("status", "adotado")
        .order("created_at", { ascending: false })
        .limit(5000),
      db
        .from("canis")
        .select("id,created_at")
        .eq("verificado", true)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);
    // Fail the request (crawlers retry) instead of publishing a sitemap that
    // silently drops every animal and shelter.
    if (animalRows.error)
      throw new Error(`sitemap animals: ${animalRows.error.message}`);
    if (shelterRows.error)
      throw new Error(`sitemap shelters: ${shelterRows.error.message}`);
    animals.push(...animalRows.data);
    shelters.push(...shelterRows.data);
  }

  const newestAnimal = latest(animals.map((a) => a.created_at));
  const newestShelter = latest(shelters.map((s) => s.created_at));
  // Listings change whenever what they list changes.
  const listingUpdated: Partial<Record<string, string | undefined>> = {
    "": latest(
      [pageCopy.home.updated, newestAnimal].filter(Boolean) as string[],
    ),
    "/pets": latest(
      [pageCopy.pets.updated, newestAnimal].filter(Boolean) as string[],
    ),
    "/canis": latest(
      [pageCopy.shelters.updated, newestShelter].filter(Boolean) as string[],
    ),
  };

  const pages = (Object.values(pageCopy) as PageEntry[]).filter(
    (page) => !page.noindex,
  );

  return [
    ...pages.flatMap((page) =>
      entry(page.path, listingUpdated[page.path] ?? page.updated),
    ),
    ...helpGuides("pt").flatMap((guide) =>
      entry(`/ajuda/${guide.slug}`, HELP_UPDATED),
    ),
    ...animals.flatMap((animal) =>
      entry(`/pets/${animal.id}`, animal.created_at),
    ),
    ...shelters.flatMap((shelter) =>
      entry(`/canis/${shelter.id}`, shelter.created_at),
    ),
  ];
}
