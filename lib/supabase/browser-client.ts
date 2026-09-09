import type { Database } from "./database.types";
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
