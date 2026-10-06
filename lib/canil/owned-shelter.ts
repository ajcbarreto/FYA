import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShelterRecord } from "./shelter-data";

/** Load ownership without fetching the shelter's entire animal inventory. */
export async function getOwnedShelter(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase.rpc("my_shelters");
  if (error) throw new Error("Unable to load shelter", { cause: error });
  // The RPC derives membership from auth.uid(), never from a supplied profile id.
  if (!userId) return null;
  return (data?.[0] as ShelterRecord | undefined) ?? null;
}

/** True when the signed-in person owns or is on the team of this shelter. */
export async function canManageShelter(
  supabase: SupabaseClient,
  shelterId: string,
) {
  const { data, error } = await supabase.rpc("my_shelters");
  if (error) throw new Error("Unable to load shelter", { cause: error });
  return ((data ?? []) as { id: string }[]).some((s) => s.id === shelterId);
}
