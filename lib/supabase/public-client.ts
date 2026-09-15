import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** Cookie-free client: shared caches must only contain anonymous, public reads. */
export function createPublicSupabaseClient(
  url: string,
  publishableKey: string,
) {
  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
