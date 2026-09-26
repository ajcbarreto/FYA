import "server-only";
import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { isLocale } from "@/lib/i18n/config";
import { validId } from "./validation";
export async function recordsContext(locale: string, animalId?: string) {
  if (!isLocale(locale)) notFound();
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) redirect(`/${locale}/auth/login`);
  const { data: shelters, error } = await supabase.rpc("my_shelters");
  if (error) throw new Error("Unable to load shelters");
  if (animalId) {
    if (!validId(animalId)) notFound();
    const { data: animal } = await supabase
      .from("animais")
      .select("*")
      .eq("id", animalId)
      .maybeSingle();
    const shelter = shelters?.find((s) => s.id === animal?.canil_id);
    if (!animal || !shelter) notFound();
    return { supabase, user, shelters: shelters!, shelter, animal, locale };
  }
  return {
    supabase,
    user,
    shelters: shelters ?? [],
    shelter: shelters?.[0],
    animal: undefined,
    locale,
  };
}
