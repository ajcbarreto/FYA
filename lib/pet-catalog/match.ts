import type { SupabaseClient } from "@supabase/supabase-js";
import { listPrimaryPhotosForAnimals } from "@/lib/canil/animal-photos";
import { toCatalogItem, type AnimalRow, type PetCatalogItem } from "./db-pets";

export type MatchSpecies = "cao" | "gato" | "";
export type MatchHome = "apartamento" | "casa" | "casa_grande" | "";
export type MatchTime = "pouco" | "medio" | "muito" | "";

export type MatchProfile = {
  species: MatchSpecies;
  home: MatchHome;
  time: MatchTime;
};

export type MatchReason = "speciesMatch" | "sizeMatch" | "energyMatch" | "calmMatch";

export type MatchResult = {
  pet: PetCatalogItem;
  score: number;
  reasons: MatchReason[];
};

const SIZE_ORDER: Record<string, number> = { pequeno: 0, medio: 1, grande: 2 };

// Casa pequena ou pouco tempo livre pedem um porte menor; casa com quintal e
// muito tempo livre comportam um porte maior. O resto fica no porte medio.
function idealSize(home: MatchHome, time: MatchTime): "pequeno" | "medio" | "grande" {
  if (home === "apartamento" || time === "pouco") return "pequeno";
  if (home === "casa_grande" && time === "muito") return "grande";
  return "medio";
}

export function scoreAnimal(animal: AnimalRow, profile: MatchProfile) {
  let score = 0;
  const reasons: MatchReason[] = [];

  // Especie — 35 pontos. Sem preferencia nao penaliza.
  if (!profile.species) {
    score += 35;
  } else if (animal.especie.toLowerCase() === profile.species) {
    score += 35;
    reasons.push("speciesMatch");
  }

  // Porte — 40 pontos, ponderado pela distancia ao porte ideal.
  const ideal = idealSize(profile.home, profile.time);
  const animalSize = animal.porte ? SIZE_ORDER[animal.porte.toLowerCase()] : undefined;
  if (animalSize === undefined) {
    score += 20;
  } else {
    const distance = Math.abs(animalSize - SIZE_ORDER[ideal]);
    if (distance === 0) {
      score += 40;
      reasons.push("sizeMatch");
    } else if (distance === 1) {
      score += 22;
    } else {
      score += 6;
    }
  }

  // Idade vs. tempo livre — 25 pontos.
  const age = animal.idade_anos;
  if (age === null || Number.isNaN(age)) {
    score += 13;
  } else if (profile.time === "muito") {
    if (age <= 3) {
      score += 25;
      reasons.push("energyMatch");
    } else {
      score += 13;
    }
  } else if (profile.time === "pouco") {
    if (age >= 3) {
      score += 25;
      reasons.push("calmMatch");
    } else {
      score += 10;
    }
  } else if (profile.time === "medio") {
    score += age >= 1 && age <= 8 ? 25 : 15;
  } else {
    score += 18;
  }

  return { score: Math.round(score), reasons };
}

const ANIMAL_SELECT =
  "id,canil_id,owner_profile_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao),owner_profile:profiles!owner_profile_id(full_name,email)";

export async function rankMatches(
  supabase: SupabaseClient,
  locale: string,
  profile: MatchProfile,
  limit = 6,
): Promise<MatchResult[]> {
  const { data, error } = await supabase
    .from("animais")
    .select(ANIMAL_SELECT)
    .neq("status", "adotado")
    .limit(80);

  if (error || !data) {
    if (error) console.error("[rankMatches] Supabase error:", error.message);
    return [];
  }

  const animals = data as AnimalRow[];
  const scored = animals
    .map((animal) => ({ animal, ...scoreAnimal(animal, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) return [];

  const photoMap = await listPrimaryPhotosForAnimals(
    supabase,
    scored.map((entry) => entry.animal.id),
  );

  return scored.map((entry) => ({
    pet: toCatalogItem(entry.animal, locale, photoMap.get(entry.animal.id)),
    score: entry.score,
    reasons: entry.reasons,
  }));
}
