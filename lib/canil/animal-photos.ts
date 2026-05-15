import type { SupabaseClient } from "@supabase/supabase-js";

export const ANIMAL_PHOTOS_BUCKET = "animal-photos";

export type AnimalPhotoRow = {
  id: string;
  animal_id: string;
  storage_path: string;
  public_url: string | null;
  is_primary: boolean;
  created_at: string;
};

export async function listAnimalPhotos(supabase: SupabaseClient, animalId: string) {
  const { data, error } = await supabase
    .from("animal_fotos")
    .select("id,animal_id,storage_path,public_url,is_primary,created_at")
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[listAnimalPhotos] Supabase error:", error.message);
    return [];
  }

  return data as AnimalPhotoRow[];
}

export async function listPrimaryPhotosForAnimals(supabase: SupabaseClient, animalIds: string[]) {
  if (animalIds.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("animal_fotos")
    .select("animal_id,public_url,is_primary,created_at")
    .in("animal_id", animalIds)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[listPrimaryPhotosForAnimals] Supabase error:", error.message);
    return new Map<string, string>();
  }

  const map = new Map<string, string>();
  for (const row of data as Array<{ animal_id: string; public_url: string | null; is_primary: boolean }>) {
    if (!row.public_url) continue;
    const existing = map.get(row.animal_id);
    if (row.is_primary || !existing) {
      map.set(row.animal_id, row.public_url);
    }
  }
  return map;
}

export function buildPhotoStoragePath(animalId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${animalId}/${Date.now()}-${safeName}`;
}
