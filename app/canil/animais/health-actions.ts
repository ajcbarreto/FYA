"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { ALLOWED_HEALTH_TIPOS } from "@/lib/canil/animal-health";

function localeFromForm(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(value) ? value : defaultLocale) as Locale;
}

function basePath(locale: Locale, scope: "canil" | "user", animalId: string) {
  return scope === "canil"
    ? `/${locale}/canil/animais/${animalId}`
    : `/${locale}/user/animais/${animalId}`;
}

async function ensureCanManage(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  animalId: string,
) {
  const { data: animal } = await supabase
    .from("animais")
    .select("id,canil_id,owner_profile_id")
    .eq("id", animalId)
    .maybeSingle();
  if (!animal) return false;
  if (animal.owner_profile_id === userId) return true;
  if (!animal.canil_id) return false;
  const { data: shelter } = await supabase
    .from("canis")
    .select("id")
    .eq("id", animal.canil_id)
    .eq("owner_profile_id", userId)
    .maybeSingle();
  return Boolean(shelter);
}

export async function addHealthEvent(formData: FormData) {
  const locale = localeFromForm(formData);
  const scope = (String(formData.get("scope") ?? "canil") as "canil" | "user") === "user" ? "user" : "canil";
  const animalId = String(formData.get("animalId") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim().toLowerCase();
  const dataRaw = String(formData.get("data") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const base = basePath(locale, scope, animalId);

  if (!animalId || !ALLOWED_HEALTH_TIPOS.includes(tipo as (typeof ALLOWED_HEALTH_TIPOS)[number])) {
    redirect(`${base}?error=invalid_health`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=${base.replace(`/${locale}`, "")}`);

  if (!(await ensureCanManage(supabase, user.id, animalId))) {
    redirect(`${base}?error=not_authorized`);
  }

  const { error } = await supabase.from("animal_saude").insert({
    animal_id: animalId,
    tipo,
    data: dataRaw || new Date().toISOString().slice(0, 10),
    descricao: descricao || null,
    created_by: user.id,
  });

  if (error) {
    console.error("[addHealthEvent] error:", error.message);
    redirect(`${base}?error=health_failed`);
  }

  revalidatePath(base);
  redirect(`${base}?success=health_added`);
}

export async function deleteHealthEvent(formData: FormData) {
  const locale = localeFromForm(formData);
  const scope = (String(formData.get("scope") ?? "canil") as "canil" | "user") === "user" ? "user" : "canil";
  const animalId = String(formData.get("animalId") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const base = basePath(locale, scope, animalId);

  if (!animalId || !eventId) redirect(`${base}?error=invalid_health`);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  if (!(await ensureCanManage(supabase, user.id, animalId))) {
    redirect(`${base}?error=not_authorized`);
  }

  const { error } = await supabase.from("animal_saude").delete().eq("id", eventId).eq("animal_id", animalId);
  if (error) {
    console.error("[deleteHealthEvent] error:", error.message);
    redirect(`${base}?error=health_failed`);
  }

  revalidatePath(base);
  redirect(`${base}?success=health_deleted`);
}
