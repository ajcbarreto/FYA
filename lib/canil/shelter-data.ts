import type { SupabaseClient } from "@supabase/supabase-js";

export type ShelterRecord = {
  id: string;
  owner_profile_id: string | null;
  nome: string;
  localizacao: string;
  missao: string | null;
  telefone: string | null;
  email_contacto: string | null;
  created_at: string;
};

export type ShelterAnimalRecord = {
  id: string;
  canil_id: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string | null;
  idade_anos: number | null;
  porte: string | null;
  status: string;
  descricao: string | null;
  created_at: string;
};

export async function getShelterForUser(supabase: SupabaseClient, userId: string) {
  const { data: ownedShelter } = await supabase
    .from("canis")
    .select("id,owner_profile_id,nome,localizacao,missao,telefone,email_contacto,created_at")
    .eq("owner_profile_id", userId)
    .maybeSingle();

  const shelter = ownedShelter
    ? (ownedShelter as ShelterRecord)
    : (
        await supabase
          .from("canis")
          .select("id,owner_profile_id,nome,localizacao,missao,telefone,email_contacto,created_at")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      ).data;

  const { data: animals } = shelter
    ? await supabase
        .from("animais")
        .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,created_at")
        .eq("canil_id", shelter.id)
        .order("created_at", { ascending: false })
    : { data: [] as ShelterAnimalRecord[] };

  return {
    shelter: (shelter as ShelterRecord | null) ?? null,
    animals: (animals as ShelterAnimalRecord[] | null) ?? [],
  };
}

export function localizeAnimalStatus(status: string, locale: string) {
  const normalized = status.toLowerCase();
  if (locale === "pt") {
    if (normalized === "disponivel") return "Disponivel";
    if (normalized === "reservado") return "Reservado";
    if (normalized === "em_tratamento") return "Em tratamento";
    if (normalized === "adotado") return "Adotado";
    return status;
  }

  if (normalized === "disponivel") return "Available";
  if (normalized === "reservado") return "Reserved";
  if (normalized === "em_tratamento") return "In treatment";
  if (normalized === "adotado") return "Adopted";
  return status;
}

export function localizeSpecies(species: string, locale: string) {
  const normalized = species.toLowerCase();
  if (locale === "pt") {
    if (normalized === "cao") return "Cao";
    if (normalized === "gato") return "Gato";
    return species;
  }

  if (normalized === "cao") return "Dog";
  if (normalized === "gato") return "Cat";
  return species;
}
