import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { getPublicShelterById } from "@/lib/canil/public-directory";

export const getCachedPublicShelterById = cache(
  (supabase: SupabaseClient, shelterId: string) =>
    getPublicShelterById(supabase, shelterId),
);
