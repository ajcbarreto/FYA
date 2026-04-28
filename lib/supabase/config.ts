type SupabaseEnvName = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function readEnv(name: SupabaseEnvName) {
  return process.env[name] ?? "";
}

const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabasePublishableKey = readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

const hasSupabaseEnv = Boolean(supabaseUrl && supabasePublishableKey);

function assertSupabaseEnv() {
  if (hasSupabaseEnv) {
    return;
  }

  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export { supabaseUrl, supabasePublishableKey, hasSupabaseEnv, assertSupabaseEnv };
