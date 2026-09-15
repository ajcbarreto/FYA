import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShelterRecord } from "./shelter-data";

/** Load ownership without fetching the shelter's entire animal inventory. */
export async function getOwnedShelter(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("canis")
    .select(
      "id,owner_profile_id,nome,localizacao,missao,telefone,email_contacto,verificado,created_at,donation_url,donation_message",
    )
    .eq("owner_profile_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load shelter", { cause: error });
  return (data as ShelterRecord | null) ?? null;
}
