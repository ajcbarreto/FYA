import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { locales } from "@/lib/i18n/config";

const STATIC_PATHS = ["", "/pets", "/canis", "/historias", "/match"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${base}/${locale}${path}`, changeFrequency: "daily" });
    }
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data: animals }, { data: shelters }] = await Promise.all([
      supabase.from("animais").select("id").limit(2000),
      supabase.from("canis").select("id").limit(2000),
    ]);

    for (const locale of locales) {
      for (const animal of animals ?? []) {
        entries.push({ url: `${base}/${locale}/pets/${animal.id}` });
      }
      for (const shelter of shelters ?? []) {
        entries.push({ url: `${base}/${locale}/canis/${shelter.id}` });
      }
    }
  } catch {
    // Sem ligacao a base de dados (ex: build sem env) — devolve apenas as rotas estaticas.
  }

  return entries;
}
