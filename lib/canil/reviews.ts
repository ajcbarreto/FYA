import type { SupabaseClient } from "@supabase/supabase-js";
import { getDisplayName } from "@/lib/adoption/db";

export type ShelterReviewRow = {
  id: string;
  canil_id: string;
  author_profile_id: string;
  rating: number;
  comentario: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
};

export type ShelterRatingSummary = {
  average: number;
  count: number;
};

function firstRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getShelterRatingSummaries(supabase: SupabaseClient, shelterIds: string[]) {
  const result = new Map<string, ShelterRatingSummary>();
  if (shelterIds.length === 0) return result;

  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("canil_id,rating")
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

export async function getShelterReviews(supabase: SupabaseClient, shelterId: string) {
  const { data, error } = await supabase
    .from("avaliacoes_canil")
    .select("id,canil_id,author_profile_id,rating,comentario,created_at,profiles!avaliacoes_canil_author_profile_id_fkey(full_name,email)")
    .eq("canil_id", shelterId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("[getShelterReviews] Supabase error:", error.message);
    return [];
  }

  return data as ShelterReviewRow[];
}

export function reviewAuthorName(review: ShelterReviewRow, locale: string) {
  const author = firstRelation(review.profiles);
  return getDisplayName(
    author?.full_name ?? null,
    author?.email ?? "adopter@fya.local",
    locale === "pt" ? "Adotante" : "Adopter",
  );
}

export async function getReviewEligibility(supabase: SupabaseClient, shelterId: string, userId: string) {
  const [{ data: completed }, { data: existing }] = await Promise.all([
    supabase
      .from("pedidos_adocao")
      .select("id")
      .eq("canil_id", shelterId)
      .eq("applicant_profile_id", userId)
      .eq("status", "concluido")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("avaliacoes_canil")
      .select("id,rating,comentario")
      .eq("canil_id", shelterId)
      .eq("author_profile_id", userId)
      .maybeSingle(),
  ]);

  return {
    canReview: Boolean(completed),
    existingReview: (existing as { id: string; rating: number; comentario: string | null } | null) ?? null,
  };
}
