import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";

// Cliente com service role — usado apenas no servidor para operacoes que
// precisam de contornar RLS (ex: obter o email de outro utilizador para
// enviar uma notificacao transacional). Devolve null se a chave nao estiver
// configurada, para o codigo degradar sem quebrar.
export function createAdminSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getProfileEmail(userId: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return (data.email as string | null) ?? null;
}
