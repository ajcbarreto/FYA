import type { SupabaseClient } from "@supabase/supabase-js";
import { helpGuides } from "@/lib/help/guides";
import { validId } from "@/lib/records/validation";
import type { PublicResource } from "@/lib/routing/public-resource-path";

/**
 * Checked in the proxy, before the page streams, so a missing resource gets a
 * real HTTP 404 instead of a streamed not-found page with status 200.
 * Without a client, or when the query fails, only the id format is checked and
 * the page keeps the final say (a failed query surfaces as the page's error).
 */
export async function publicResourceExists(
  resource: PublicResource,
  locale: string,
  supabase: SupabaseClient | null,
) {
  if (resource.kind === "guide")
    return helpGuides(locale).some((guide) => guide.slug === resource.slug);
  if (!validId(resource.id)) return false;
  if (!supabase) return true;
  const selection = resource.table === "animais" ? "id,canis!inner(id)" : "id";
  const { data, error } = await supabase
    .from(resource.table)
    .select(selection)
    .eq("id", resource.id)
    .maybeSingle();
  if (error) return true;
  return data !== null;
}
