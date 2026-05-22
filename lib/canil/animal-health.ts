import type { SupabaseClient } from "@supabase/supabase-js";

export type HealthEventTipo =
  | "vacina"
  | "desparasitacao"
  | "cirurgia"
  | "consulta"
  | "peso"
  | "outro";

export type HealthEvent = {
  id: string;
  animal_id: string;
  tipo: HealthEventTipo;
  data: string;
  descricao: string | null;
  created_at: string;
};

export const ALLOWED_HEALTH_TIPOS: HealthEventTipo[] = [
  "vacina",
  "desparasitacao",
  "cirurgia",
  "consulta",
  "peso",
  "outro",
];

export async function listHealthEvents(supabase: SupabaseClient, animalId: string) {
  const { data, error } = await supabase
    .from("animal_saude")
    .select("id,animal_id,tipo,data,descricao,created_at")
    .eq("animal_id", animalId)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[listHealthEvents] Supabase error:", error.message);
    return [];
  }
  return data as HealthEvent[];
}
