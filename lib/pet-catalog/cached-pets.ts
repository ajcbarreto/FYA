import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { getPetById } from "@/lib/pet-catalog/db-pets";

export const getCachedPetById = cache(
  (supabase: SupabaseClient, petId: string, locale: string) =>
    getPetById(supabase, petId, locale),
);
