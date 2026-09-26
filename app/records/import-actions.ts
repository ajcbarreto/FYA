"use server";
import { recordsContext } from "@/lib/records/context";
import { parseAnimalCsv } from "@/lib/records/csv";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function importAnimals(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt"));
  const base = `/${c.locale}/canil/importar`;
  if (!c.shelter) redirect(`${base}?error=failed`);
  let rows;
  try {
    rows = parseAnimalCsv(String(form.get("csv") ?? ""));
  } catch {
    redirect(`${base}?error=invalid`);
  }
  const { error } = await c.supabase.rpc("import_animals", {
    p_shelter: c.shelter.id,
    p_rows: rows,
  });
  if (error) redirect(`${base}?error=failed`);
  revalidatePath(`/${c.locale}/canil/animais`);
  redirect(`${base}?success=${rows.length}`);
}
