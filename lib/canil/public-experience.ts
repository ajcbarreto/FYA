import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
type Client = SupabaseClient<Database>;
type DbError = { code?: string; message: string };
export function missingFeature(error: DbError | null, name: string) {
  return Boolean(
    error &&
    ["42P01", "PGRST205", "PGRST202", "42883"].includes(error.code ?? "") &&
    error.message.includes(name),
  );
}
export async function hasShelterExperience(db: Client) {
  const { data, error } = await db.rpc("shelter_experience_version");
  if (missingFeature(error, "shelter_experience_version")) return false;
  if (error)
    throw new Error("Unable to check shelter features", { cause: error });
  return data === 1;
}
export async function getPublicShelterExperience(db: Client, id: string) {
  const [enabled, projects] = await Promise.all([
    hasShelterExperience(db),
    db
      .from("support_projects")
      .select(
        "id,title,description,kind,goal,unit,received,deadline,status,created_at",
      )
      .eq("canil_id", id)
      .eq("published", true)
      .order("status")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);
  const supportReady = !missingFeature(projects.error, "support_projects");
  if (projects.error && supportReady)
    throw new Error("Unable to load public campaigns", {
      cause: projects.error,
    });
  const campaignIds = (projects.data ?? []).map((p) => p.id);
  const [details, news, updates] = await Promise.all([
    enabled
      ? db
          .from("shelter_public_details")
          .select("visit_hours,visit_instructions")
          .eq("canil_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    enabled
      ? db
          .from("shelter_news")
          .select("id,title,body,created_at")
          .eq("canil_id", id)
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
    campaignIds.length
      ? db
          .from("support_updates")
          .select("id,project_id,body,created_at")
          .in("project_id", campaignIds)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (details.error || news.error || updates.error)
    throw new Error("Unable to load shelter information", {
      cause: details.error ?? news.error ?? updates.error,
    });
  return {
    enabled,
    details: details.data,
    news: news.data ?? [],
    projects: projects.data ?? [],
    supportReady,
    updates: updates.data ?? [],
  };
}
