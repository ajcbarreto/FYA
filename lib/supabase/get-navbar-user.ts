import { cache } from "react";
import { getAccountProfile, resolveUserRole } from "@/lib/auth/role";
import { getAuthUser } from "@/lib/supabase/get-user";
import type { UserRole } from "@/lib/supabase/types";

export const getNavbarUserData = cache(async () => {
  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    return {
      user: null,
      role: null as UserRole | null,
      fullName: null as string | null,
      email: null as string | null,
    };
  }

  const [profile, role] = await Promise.all([
    getAccountProfile(supabase, user.id),
    resolveUserRole(supabase, user),
  ]);

  return {
    user,
    role,
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
  };
});
