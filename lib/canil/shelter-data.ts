import type { SupabaseClient } from "@supabase/supabase-js";
import { speciesLabel, statusLabel } from "@/lib/i18n/animals";
import { getOwnedShelter } from "./owned-shelter";
export { getOwnedShelter } from "./owned-shelter";

export type ShelterRecord = {
  id: string;
  owner_profile_id: string | null;
  nome: string;
  localizacao: string;
  missao: string | null;
  telefone: string | null;
  email_contacto: string | null;
  verificado: boolean;
  donation_url: string | null;
  donation_message: string | null;
  image_url: string | null;
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

export async function getShelterForUser(
  supabase: SupabaseClient,
  userId: string,
) {
  const shelter = await getOwnedShelter(supabase, userId);

  const { data: animals } = shelter
    ? await supabase
        .from("animais")
        .select(
          "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,created_at",
        )
        .eq("canil_id", shelter.id)
        .order("created_at", { ascending: false })
    : { data: [] as ShelterAnimalRecord[] };

  return {
    shelter,
    animals: (animals as ShelterAnimalRecord[] | null) ?? [],
  };
}

export const localizeAnimalStatus = statusLabel;
export const localizeSpecies = speciesLabel;
