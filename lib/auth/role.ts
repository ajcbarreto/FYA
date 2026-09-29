import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/supabase/types";
import { cache } from "react";

// React's cache only deduplicates reads within a server render, never across users.
export const getAccountProfile = cache(
  async (supabase: SupabaseClient, userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role,full_name,email")
      .eq("id", userId)
      .maybeSingle();
    if (error)
      throw new Error("Unable to verify account permissions", { cause: error });
    return data;
  },
);

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: Pick<User, "id"> | null | undefined,
): Promise<UserRole | null> {
  if (!user) return null;
  const data = await getAccountProfile(supabase, user.id);
  return data && ["admin", "user", "canil"].includes(data.role)
    ? (data.role as UserRole)
    : null;
}
