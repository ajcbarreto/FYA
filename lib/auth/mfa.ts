import type { SupabaseClient } from "@supabase/supabase-js";

/** Administrators must reach aal2 (password + TOTP); the database enforces the same rule. */
export async function hasSecondFactor(supabase: SupabaseClient) {
  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return !error && data.currentLevel === "aal2";
}

export function mfaPath(locale: string, next?: string | null) {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  return `/${locale}/auth/mfa${query}`;
}
