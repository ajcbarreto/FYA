const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const hasSupabaseEnv = Boolean(supabaseUrl && supabasePublishableKey);

function assertSupabaseEnv() {
  if (hasSupabaseEnv) {
    return;
  }

  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export {
  supabaseUrl,
  supabasePublishableKey,
  hasSupabaseEnv,
  assertSupabaseEnv,
};
