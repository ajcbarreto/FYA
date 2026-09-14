import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthContext = {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
};

export const getAuthUser = cache(async (): Promise<AuthContext> => {
  if (!hasSupabaseEnv) {
    return { supabase: null, user: null };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});
