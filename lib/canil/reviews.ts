import type { SupabaseClient } from "@supabase/supabase-js";

export type ReviewEstado = "pendente" | "aprovada" | "rejeitada";

export type ShelterReviewRow = {
  id: string;
  canil_id: string;
  author_profile_id: string;
  author_name: string | null;
  rating: number;
  comentario: string | null;
  estado: ReviewEstado;
  created_at: string;
};

export type ShelterRatingSummary = {
  average: number;
  count: number;
};

export async function getShelterRatingSummaries(supabase: SupabaseClient, shelterIds: string[]) {
  const result = new Map<string, ShelterRatingSummary>();
  if (shelterIds.length === 0) return result;

  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("canil_id,rating")
    .eq("estado", "aprovada")
    .in("canil_id", shelterIds);

  if (error || !data) {
    if (error) console.error("[getShelterRatingSummaries] Supabase error:", error.message);
    return result;
  }

  const totals = new Map<string, { sum: number; count: number }>();
  for (const row of data as Array<{ canil_id: string; rating: number }>) {
    const current = totals.get(row.canil_id) ?? { sum: 0, count: 0 };
    current.sum += row.rating;
    current.count += 1;
    totals.set(row.canil_id, current);
  }
  for (const [id, { sum, count }] of totals) {
    result.set(id, { average: count > 0 ? sum / count : 0, count });
  }
  return result;
}

// Avaliacoes publicas (apenas aprovadas) de um canil.
export async function getShelterReviews(supabase: SupabaseClient, shelterId: string) {
  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at")
    .eq("canil_id", shelterId)
    .eq("estado", "aprovada")
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getShelterReviews] Supabase error:", error.message);
    return [];
  }

  return data as ShelterReviewRow[];
}

// Todas as avaliacoes de um canil (qualquer estado) — para o dono moderar.
export async function getReviewsForModeration(supabase: SupabaseClient, shelterId: string) {
  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at")
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getReviewsForModeration] Supabase error:", error.message);
    return [];
  }

  return data as ShelterReviewRow[];
}

export function reviewAuthorName(review: ShelterReviewRow, locale: string) {
  return review.author_name?.trim() || (locale === "pt" ? "Adotante" : "Adopter");
}

export async function getReviewEligibility(supabase: SupabaseClient, shelterId: string, userId: string) {
  const { data: existing } = await supabase
    .from("avaliacoes_canil")
    .select("id,rating,comentario,estado")
    .eq("canil_id", shelterId)
    .eq("author_profile_id", userId)
    .maybeSingle();

  return {
    canReview: true,
    existingReview:
      (existing as { id: string; rating: number; comentario: string | null; estado: ReviewEstado } | null) ?? null,
  };
}
