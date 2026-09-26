import { getAuthUser } from "@/lib/supabase/get-user";
import { csvCell } from "@/lib/records/csv";
export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return new Response("Unauthorized", { status: 401 });
  const { data: shelters, error: se } = await supabase.rpc("my_shelters");
  const shelter = shelters?.[0];
  if (se || !shelter) return new Response("Forbidden", { status: 403 });
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from("animais")
      .select(
        "id,nome,especie,raca,idade_anos,descricao,status,published,archived_at,animal_records(internal_ref)",
      )
      .eq("canil_id", shelter.id)
      .order("id")
      .range(offset, offset + 499);
    if (error) return new Response("Export unavailable", { status: 503 });
    rows.push(...data);
    if (data.length < 500) break;
  }
  const csv = [
    "reference,name,species,breed,age,description,status,published,archived_at",
    ...rows.map((r) => {
      const records = r.animal_records as
        { internal_ref: string }[] | { internal_ref: string } | null;
      return [
        Array.isArray(records)
          ? records[0]?.internal_ref
          : records?.internal_ref,
        r.nome,
        r.especie,
        r.raca,
        r.idade_anos,
        r.descricao,
        r.status,
        r.published,
        r.archived_at,
      ]
        .map(csvCell)
        .join(",");
    }),
  ].join("\r\n");
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fya-animals.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
