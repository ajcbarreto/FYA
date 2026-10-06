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
  verified_adoption?: boolean;
};

export type ShelterRatingSummary = {
  average: number;
  count: number;
};

export async function getShelterRatingSummaries(
  supabase: SupabaseClient,
  shelterIds: string[],
) {
  const result = new Map<string, ShelterRatingSummary>();
  if (shelterIds.length === 0) return result;

  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("canil_id,rating")
    .eq("estado", "aprovada")
    .in("canil_id", shelterIds);

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
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
export async function getShelterReviews(
  supabase: SupabaseClient,
  shelterId: string,
  enhanced = false,
) {
  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select(
      enhanced
        ? "id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at,verified_adoption"
        : "id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at",
    )
    .eq("canil_id", shelterId)
    .eq("estado", "aprovada")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return [];
  }

  return data as unknown as ShelterReviewRow[];
}

// Reviews for the shelter team: reply and report; moderation belongs to the platform.
export async function getReviewsForModeration(
  supabase: SupabaseClient,
  shelterId: string,
  enhanced = false,
) {
  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select(
      enhanced
        ? "id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at,verified_adoption"
        : "id,canil_id,author_profile_id,author_name,rating,comentario,estado,created_at",
    )
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return [];
  }

  return data as unknown as ShelterReviewRow[];
}

export function reviewAuthorName(review: ShelterReviewRow, locale: string) {
  return (
    review.author_name?.trim() || (locale === "pt" ? "Adotante" : "Adopter")
  );
}

export async function getReviewEligibility(
  supabase: SupabaseClient,
  shelterId: string,
  userId: string,
  enabled = false,
) {
  if (!enabled) return { canReview: false, existingReview: null };
  const { data: completed, error: completedError } = await supabase
    .from("pedidos_adocao")
    .select("id")
    .eq("canil_id", shelterId)
    .eq("applicant_profile_id", userId)
    .eq("status", "concluido")
    .limit(1);
  if (completedError)
    throw new Error("Unable to check review eligibility", {
      cause: completedError,
    });
  const { data: existing, error } = await supabase
    .from("avaliacoes_canil")
    .select("id,rating,comentario,estado")
    .eq("canil_id", shelterId)
    .eq("author_profile_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load own review", { cause: error });
  return {
    canReview: Boolean(completed?.length),
    existingReview:
      (existing as {
        id: string;
        rating: number;
        comentario: string | null;
        estado: ReviewEstado;
      } | null) ?? null,
  };
}

export async function getReviewReplies(
  supabase: SupabaseClient,
  ids: string[],
) {
  if (!ids.length)
    return new Map<string, { body: string; updated_at: string }>();
  const { data, error } = await supabase
    .from("shelter_review_replies")
    .select("review_id,body,updated_at")
    .in("review_id", ids);
  if (error) throw new Error("Unable to load review replies", { cause: error });
  return new Map<string, { body: string; updated_at: string }>(
    (data ?? []).map((r) => [
      r.review_id,
      { body: r.body, updated_at: r.updated_at },
    ]),
  );
}
