import { getAuthUser } from "@/lib/supabase/get-user";
export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return new Response("Unauthorized", { status: 401 });
  const [profile, terms, requests] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("terms_acceptances")
      .select("version,accepted_at")
      .eq("profile_id", user.id),
    supabase.from("privacy_requests").select("*").eq("profile_id", user.id),
  ]);
  if (profile.error || terms.error || requests.error)
    return new Response("Export unavailable", { status: 503 });
  const applications: unknown[] = [],
    messages: unknown[] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase
      .from("pedidos_adocao")
      .select(
        "id,animal_id,canil_id,status,respostas,mensagem_inicial,observacoes_canil,created_at,reviewed_at",
      )
      .eq("applicant_profile_id", user.id)
      .order("id")
      .range(start, start + 499);
    if (error) return new Response("Export unavailable", { status: 503 });
    applications.push(...data);
    if (data.length < 500) break;
  }
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase
      .from("mensagens_adocao")
      .select("id,conversa_id,conteudo,created_at")
      .eq("sender_profile_id", user.id)
      .order("id")
      .range(start, start + 499);
    if (error) return new Response("Export unavailable", { status: 503 });
    messages.push(...data);
    if (data.length < 500) break;
  }
  return Response.json(
    {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      terms: terms.data,
      privacy_requests: requests.data,
      applications,
      messages,
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="fya-account.json"',
        "Cache-Control": "private, no-store",
      },
    },
  );
}
