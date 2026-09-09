import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/supabase/types";

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: User | null | undefined,
): Promise<UserRole | null> {
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error)
    throw new Error("Unable to verify account permissions", { cause: error });
  return data && ["admin", "user", "canil"].includes(data.role)
    ? (data.role as UserRole)
    : null;
}
