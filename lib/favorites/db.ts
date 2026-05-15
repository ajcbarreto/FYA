import type { SupabaseClient } from "@supabase/supabase-js";
import { toCatalogItem, type AnimalRow, type PetCatalogItem } from "@/lib/pet-catalog/db-pets";
import { listPrimaryPhotosForAnimals } from "@/lib/canil/animal-photos";

export async function getFavoriteAnimalIds(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("favoritos")
    .select("animal_id")
    .eq("user_profile_id", userId);

  if (error || !data) {
    if (error) console.error("[getFavoriteAnimalIds] Supabase error:", error.message);
    return new Set<string>();
  }

  return new Set<string>(data.map((row) => row.animal_id as string));
}

export async function getFavoritesForUser(
  supabase: SupabaseClient,
  userId: string,
  locale: string,
): Promise<PetCatalogItem[]> {
  const { data, error } = await supabase
    .from("favoritos")
    .select(
      "animal_id,created_at,animais(id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao))",
    )
    .eq("user_profile_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getFavoritesForUser] Supabase error:", error.message);
    return [];
  }

  const animals: AnimalRow[] = [];
  for (const row of data) {
    const value = Array.isArray(row.animais) ? row.animais[0] : row.animais;
    if (value) animals.push(value as AnimalRow);
  }
  const photoMap = await listPrimaryPhotosForAnimals(
    supabase,
    animals.map((animal) => animal.id),
  );
  return animals.map((animal) => toCatalogItem(animal, locale, photoMap.get(animal.id)));
}
