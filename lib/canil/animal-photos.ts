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

export async function listAnimalPhotos(
  supabase: SupabaseClient,
  animalId: string,
) {
  const { data, error } = await supabase
    .from("animal_fotos")
    .select("id,animal_id,storage_path,public_url,is_primary,created_at")
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return [];
  }

  return data as AnimalPhotoRow[];
}

export async function listPhotosForAnimals(
  supabase: SupabaseClient,
  animalIds: string[],
) {
  if (animalIds.length === 0) return new Map<string, string[]>();

  const { data, error } = await supabase
    .from("animal_fotos")
    .select("animal_id,public_url,is_primary,created_at")
    .in("animal_id", animalIds)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return new Map<string, string[]>();
  }

  const map = new Map<string, string[]>();
  for (const row of data as Array<{
    animal_id: string;
    public_url: string | null;
    is_primary: boolean;
  }>) {
    if (!row.public_url) continue;
    const photos = map.get(row.animal_id) ?? [];
    if (!photos.includes(row.public_url)) photos.push(row.public_url);
    map.set(row.animal_id, photos);
  }
  return map;
}

export async function listPrimaryPhotosForAnimals(
  supabase: SupabaseClient,
  animalIds: string[],
) {
  const photos = await listPhotosForAnimals(supabase, animalIds);
  return new Map([...photos].map(([id, urls]) => [id, urls[0]]));
}

export function buildPhotoStoragePath(animalId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${animalId}/${Date.now()}-${safeName}`;
}
