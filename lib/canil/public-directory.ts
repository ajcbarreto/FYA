import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toCatalogItem,
  type AnimalRow,
  type PetCatalogItem,
} from "@/lib/pet-catalog/db-pets";
import { listPrimaryPhotosForAnimals } from "@/lib/canil/animal-photos";

import { readPublicShelterQuery, type PublicShelter } from "./public-shelter";
export { getPublicShelterById, type PublicShelter } from "./public-shelter";

type ShelterAnimalCountRow = {
  canil_id: string;
};

export async function listPublicShelters(
  supabase: SupabaseClient,
  options: { search?: string } = {},
) {
  return (
    (await readPublicShelterQuery<PublicShelter[]>(async (selection) => {
      let query = supabase
        .from("canis")
        .select(selection)
        .order("nome", { ascending: true });
      const search = options.search?.trim();
      if (search) {
        const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
        query = query.or(
          `nome.ilike.%${escaped}%,localizacao.ilike.%${escaped}%,missao.ilike.%${escaped}%`,
        );
      }
      const { data, error } = await query;
      return { data: data as unknown as PublicShelter[] | null, error };
    })) ?? []
  );
}

export async function countAnimalsByShelter(
  supabase: SupabaseClient,
  shelterIds: string[],
) {
  if (shelterIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase
    .from("animais")
    .select("canil_id")
    .in("canil_id", shelterIds);

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return new Map<string, number>();
  }

  const result = new Map<string, number>();
  for (const row of data as ShelterAnimalCountRow[]) {
    result.set(row.canil_id, (result.get(row.canil_id) ?? 0) + 1);
  }
  return result;
}

export async function getAnimalsForPublicShelter(
  supabase: SupabaseClient,
  shelterId: string,
  locale: string,
): Promise<PetCatalogItem[]> {
  const { data, error } = await supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)",
    )
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return [];
  }

  const rows = data as AnimalRow[];
  const photoMap = await listPrimaryPhotosForAnimals(
    supabase,
    rows.map((row) => row.id),
  );
  return rows.map((animal) =>
    toCatalogItem(animal, locale, photoMap.get(animal.id)),
  );
}
