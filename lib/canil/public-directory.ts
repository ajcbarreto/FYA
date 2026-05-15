import type { SupabaseClient } from "@supabase/supabase-js";
import { toCatalogItem, type AnimalRow, type PetCatalogItem } from "@/lib/pet-catalog/db-pets";
import { listPrimaryPhotosForAnimals } from "@/lib/canil/animal-photos";

export type PublicShelter = {
  id: string;
  nome: string;
  localizacao: string;
  missao: string | null;
  telefone: string | null;
  email_contacto: string | null;
  verificado: boolean;
  created_at: string;
};

type ShelterAnimalCountRow = {
  canil_id: string;
};

export async function listPublicShelters(supabase: SupabaseClient, options: { search?: string } = {}) {
  let query = supabase
    .from("canis")
    .select("id,nome,localizacao,missao,telefone,email_contacto,verificado,created_at")
    .order("nome", { ascending: true });

  const search = options.search?.trim();
  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`nome.ilike.%${escaped}%,localizacao.ilike.%${escaped}%,missao.ilike.%${escaped}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    if (error) console.error("[listPublicShelters] Supabase error:", error.message);
    return [];
  }

  return data as PublicShelter[];
}

export async function countAnimalsByShelter(supabase: SupabaseClient, shelterIds: string[]) {
  if (shelterIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase
    .from("animais")
    .select("canil_id")
    .in("canil_id", shelterIds);

  if (error || !data) {
    if (error) console.error("[countAnimalsByShelter] Supabase error:", error.message);
    return new Map<string, number>();
  }

  const result = new Map<string, number>();
  for (const row of data as ShelterAnimalCountRow[]) {
    result.set(row.canil_id, (result.get(row.canil_id) ?? 0) + 1);
  }
  return result;
}

export async function getPublicShelterById(supabase: SupabaseClient, shelterId: string) {
  const { data, error } = await supabase
    .from("canis")
    .select("id,nome,localizacao,missao,telefone,email_contacto,verificado,created_at")
    .eq("id", shelterId)
    .maybeSingle();

  if (error) {
    console.error("[getPublicShelterById] Supabase error:", error.message);
    return null;
  }

  return (data as PublicShelter | null) ?? null;
}

export async function getAnimalsForPublicShelter(
  supabase: SupabaseClient,
  shelterId: string,
  locale: string,
): Promise<PetCatalogItem[]> {
  const { data, error } = await supabase
    .from("animais")
    .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)")
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getAnimalsForPublicShelter] Supabase error:", error.message);
    return [];
  }

  const rows = data as AnimalRow[];
  const photoMap = await listPrimaryPhotosForAnimals(
    supabase,
    rows.map((row) => row.id),
  );
  return rows.map((animal) => toCatalogItem(animal, locale, photoMap.get(animal.id)));
}
