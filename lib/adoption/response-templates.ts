import type { SupabaseClient } from "@supabase/supabase-js";

export type ResponseTemplate = {
  id: string;
  titulo: string;
  conteudo: string;
};

export async function listTemplatesForCanil(supabase: SupabaseClient, canilId: string) {
  const { data, error } = await supabase
    .from("respostas_modelo")
    .select("id,titulo,conteudo")
    .eq("canil_id", canilId)
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("[listTemplatesForCanil] Supabase error:", error.message);
    return [];
  }
  return data as ResponseTemplate[];
}

export async function listTemplatesForOwner(supabase: SupabaseClient, ownerId: string) {
  const { data, error } = await supabase
    .from("respostas_modelo")
    .select("id,titulo,conteudo")
    .eq("owner_profile_id", ownerId)
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("[listTemplatesForOwner] Supabase error:", error.message);
    return [];
  }
  return data as ResponseTemplate[];
}
