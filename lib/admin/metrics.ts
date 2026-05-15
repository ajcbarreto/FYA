import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminMetrics = {
  adoptionsCompleted: number;
  pendingRequests: number;
  totalRequests: number;
  sheltersTotal: number;
  sheltersPending: number;
  usersTotal: number;
  newUsersThisWeek: number;
  animalsTotal: number;
  animalsAvailable: number;
};

type CountResult = PromiseLike<{ count: number | null; error: { message: string } | null }>;

async function resolveCount(label: string, query: CountResult) {
  const { count, error } = await query;
  if (error) {
    console.error(`[metrics:${label}] Supabase error:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getAdminMetrics(supabase: SupabaseClient): Promise<AdminMetrics> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const head = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [
    adoptionsCompleted,
    pendingRequests,
    totalRequests,
    sheltersTotal,
    sheltersPending,
    usersTotal,
    newUsersThisWeek,
    animalsTotal,
    animalsAvailable,
  ] = await Promise.all([
    resolveCount("adoptions", head("pedidos_adocao").eq("status", "concluido")),
    resolveCount("pending", head("pedidos_adocao").in("status", ["pendente", "entrevista"])),
    resolveCount("requests", head("pedidos_adocao")),
    resolveCount("shelters", head("canis")),
    resolveCount("sheltersPending", head("canis").eq("verificado", false)),
    resolveCount("users", head("profiles")),
    resolveCount("newUsers", head("profiles").gte("created_at", weekAgo)),
    resolveCount("animals", head("animais")),
    resolveCount("animalsAvailable", head("animais").eq("status", "disponivel")),
  ]);

  return {
    adoptionsCompleted,
    pendingRequests,
    totalRequests,
    sheltersTotal,
    sheltersPending,
    usersTotal,
    newUsersThisWeek,
    animalsTotal,
    animalsAvailable,
  };
}
