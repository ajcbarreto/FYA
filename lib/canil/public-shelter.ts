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

const columns =
  "id,nome,localizacao,missao,telefone,email_contacto,verificado,created_at,donation_url,donation_message,image_url";
type QueryError = { code?: string; message: string };

// Keep optional photography from taking down public pages during a staggered migration.
// Retry only the specific missing-column error; auth, RLS and network failures still surface.
export async function readPublicShelterQuery<T>(
  run: (
    selection: string,
  ) => PromiseLike<{ data: T | null; error: QueryError | null }>,
): Promise<T | null> {
  const result = await run(columns);
  if (!result.error) return result.data;
  if (
    result.error.code !== "42703" ||
    result.error.message !== "column canis.image_url does not exist"
  ) {
    throw new Error("Unable to load public shelter", { cause: result.error });
  }
  const fallback = await run(columns.replace(",image_url", ""));
  if (fallback.error)
    throw new Error("Unable to load public shelter", { cause: fallback.error });
  if (!fallback.data) return null;
  const withoutPhoto = (row: unknown) => ({
    ...(row as object),
    image_url: null,
  });
  return (
    Array.isArray(fallback.data)
      ? fallback.data.map(withoutPhoto)
      : withoutPhoto(fallback.data)
  ) as T;
}

export async function getPublicShelterById(
  supabase: SupabaseClient,
  shelterId: string,
) {
  return readPublicShelterQuery<PublicShelter>((selection) =>
    supabase
      .from("canis")
      .select(selection)
      .eq("id", shelterId)
      .eq("tipo", "canil")
      .maybeSingle(),
  );
}
