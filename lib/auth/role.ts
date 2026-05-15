import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/supabase/types";

const KNOWN_ROLES: UserRole[] = ["admin", "user", "canil"];

function fromMetadata(user: User | null | undefined): UserRole | null {
  const value = user?.user_metadata?.role;
  return KNOWN_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: User | null | undefined,
): Promise<UserRole | null> {
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole = profile?.role;
  if (KNOWN_ROLES.includes(profileRole as UserRole)) {
    return profileRole as UserRole;
  }

  const metadataRole = fromMetadata(user);
  if (metadataRole) return metadataRole;

  const { data: ownedShelter } = await supabase
    .from("canis")
    .select("id")
    .eq("owner_profile_id", user.id)
    .limit(1)
    .maybeSingle();

  return ownedShelter ? "canil" : null;
}
