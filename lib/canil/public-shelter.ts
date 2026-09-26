import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicShelter = {
  id: string;
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

export async function getPublicShelterById(
  supabase: SupabaseClient,
  shelterId: string,
) {
  const { data, error } = await supabase
    .from("canis")
    .select(
      "id,nome,localizacao,missao,telefone,email_contacto,verificado,created_at,donation_url,donation_message,image_url",
    )
    .eq("id", shelterId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load public shelter", { cause: error });
  }

  return (data as PublicShelter | null) ?? null;
}
