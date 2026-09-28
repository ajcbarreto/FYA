import type { SupabaseClient } from "@supabase/supabase-js";
import { helpGuides } from "@/lib/help/guides";
import { validId } from "@/lib/records/validation";
import type { PublicResource } from "@/lib/routing/public-resource-path";

/**
 * Checked in the proxy, before the page streams, so a missing resource gets a
 * real HTTP 404 instead of a streamed not-found page with status 200.
 * Without a client (Supabase not configured) no record can exist. When the
 * query fails the page keeps the final say and surfaces the error itself.
 */
export async function publicResourceExists(
  resource: PublicResource,
  locale: string,
  supabase: SupabaseClient | null,
) {
  if (resource.kind === "guide")
    return helpGuides(locale).some((guide) => guide.slug === resource.slug);
  if (!validId(resource.id)) return false;
  if (!supabase) return false;
  const selection =
    resource.table === "animais"
      ? "id,canis!inner(id)"
      : resource.verifiedOnly
        ? "id,verificado"
        : "id";
  const { data, error } = await supabase
    .from(resource.table)
    .select(selection)
    .eq("id", resource.id)
    .maybeSingle<{ id: string; verificado?: boolean }>();
  if (error) return true;
  return data !== null && (!resource.verifiedOnly || data.verificado === true);
}
