"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { ANIMAL_PHOTOS_BUCKET, buildPhotoStoragePath } from "@/lib/canil/animal-photos";
import { getPlatformSettings } from "@/lib/admin/platform-settings";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_SPECIES = ["cao", "gato", "outro"];
const ALLOWED_SEX = ["macho", "femea"];
const ALLOWED_SIZE = ["pequeno", "medio", "grande"];
const ALLOWED_STATUS = ["disponivel", "reservado", "em_tratamento", "adotado"];

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

type AnimalInput = {
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string | null;
  idade_anos: number | null;
  porte: string | null;
  status: string;
  descricao: string | null;
};

function parseAnimalInput(formData: FormData): AnimalInput | null {
  const nome = String(formData.get("nome") ?? "").trim();
  const especie = String(formData.get("especie") ?? "").trim().toLowerCase();
  const racaRaw = String(formData.get("raca") ?? "").trim();
  const sexoRaw = String(formData.get("sexo") ?? "").trim().toLowerCase();
  const porteRaw = String(formData.get("porte") ?? "").trim().toLowerCase();
  const statusRaw = String(formData.get("status") ?? "disponivel").trim().toLowerCase();
  const idadeRaw = String(formData.get("idade_anos") ?? "").trim();
  const descricaoRaw = String(formData.get("descricao") ?? "").trim();

  if (!nome || !ALLOWED_SPECIES.includes(especie) || !ALLOWED_STATUS.includes(statusRaw)) {
    return null;
  }
  const idade = idadeRaw ? Number.parseInt(idadeRaw, 10) : NaN;

  return {
    nome,
    especie,
    raca: racaRaw || null,
    sexo: ALLOWED_SEX.includes(sexoRaw) ? sexoRaw : null,
    idade_anos: Number.isFinite(idade) && idade >= 0 ? idade : null,
    porte: ALLOWED_SIZE.includes(porteRaw) ? porteRaw : null,
    status: statusRaw,
    descricao: descricaoRaw || null,
  };
}

async function ensureShelterOwnsAnimal(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  animalId: string,
) {
  const { shelter } = await getShelterForUser(supabase, userId);
  if (!shelter) return null;

  const { data: animal } = await supabase
    .from("animais")
    .select("id,canil_id")
    .eq("id", animalId)
    .maybeSingle();

  if (!animal || animal.canil_id !== shelter.id) return null;

  return { shelter, animal };
}

export async function createAnimal(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const input = parseAnimalInput(formData);

  if (!input) {
    redirect(`/${locale}/canil/animais/novo?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/novo`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil/animais?error=no_shelter`);
  }

  const platform = await getPlatformSettings(supabase);
  if (platform.requireVerificationToPublish && !shelter.verificado) {
    redirect(`/${locale}/canil/animais/novo?error=needs_verification`);
  }

  const { data: created, error } = await supabase
    .from("animais")
    .insert({ ...input, canil_id: shelter.id })
    .select("id")
    .maybeSingle();

  if (error || !created) {
    console.error("[createAnimal] error:", error?.message);
    redirect(`/${locale}/canil/animais/novo?error=save_failed`);
  }

  revalidatePath(`/${locale}/canil/animais`);
  redirect(`/${locale}/canil/animais/${created.id}?success=created`);
}

export async function updateAnimal(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();
  const input = parseAnimalInput(formData);
  const redirectBase = `/${locale}/canil/animais/${animalId}`;

  if (!animalId || !input) {
    redirect(`${redirectBase}?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/${animalId}`);
  }

  const ownership = await ensureShelterOwnsAnimal(supabase, user.id, animalId);
  if (!ownership) {
    redirect(`${redirectBase}?error=not_authorized`);
  }

  const { error } = await supabase
    .from("animais")
    .update(input)
    .eq("id", animalId)
    .eq("canil_id", ownership.shelter.id);

  if (error) {
    redirect(`${redirectBase}?error=save_failed`);
  }

  revalidatePath(redirectBase);
  revalidatePath(`/${locale}/canil/animais`);
  redirect(`${redirectBase}?success=updated`);
}

export async function deleteAnimal(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();

  if (!animalId) {
    redirect(`/${locale}/canil/animais?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais`);
  }

  const ownership = await ensureShelterOwnsAnimal(supabase, user.id, animalId);
  if (!ownership) {
    redirect(`/${locale}/canil/animais?error=not_authorized`);
  }

  const { error } = await supabase
    .from("animais")
    .delete()
    .eq("id", animalId)
    .eq("canil_id", ownership.shelter.id);

  if (error) {
    redirect(`/${locale}/canil/animais?error=delete_failed`);
  }

  revalidatePath(`/${locale}/canil/animais`);
  redirect(`/${locale}/canil/animais?success=animal_deleted`);
}

export async function uploadAnimalPhoto(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();
  const file = formData.get("photo");

  const redirectBase = `/${locale}/canil/animais/${animalId}`;
  if (!animalId || !(file instanceof File) || file.size === 0) {
    redirect(`${redirectBase}?error=invalid_data`);
  }
  if ((file as File).size > MAX_PHOTO_BYTES) {
    redirect(`${redirectBase}?error=photo_too_large`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/${animalId}`);
  }

  const ownership = await ensureShelterOwnsAnimal(supabase, user.id, animalId);
  if (!ownership) {
    redirect(`${redirectBase}?error=not_authorized`);
  }

  const storagePath = buildPhotoStoragePath(animalId, (file as File).name);
  const { error: uploadError } = await supabase.storage
    .from(ANIMAL_PHOTOS_BUCKET)
    .upload(storagePath, file as File, {
      cacheControl: "3600",
      upsert: false,
      contentType: (file as File).type || undefined,
    });

  if (uploadError) {
    console.error("[uploadAnimalPhoto] storage error:", uploadError.message);
    redirect(`${redirectBase}?error=upload_failed`);
  }

  const { data: publicUrlData } = supabase.storage.from(ANIMAL_PHOTOS_BUCKET).getPublicUrl(storagePath);

  const { count: existingCount } = await supabase
    .from("animal_fotos")
    .select("id", { count: "exact", head: true })
    .eq("animal_id", animalId);

  const { error: insertError } = await supabase.from("animal_fotos").insert({
    animal_id: animalId,
    storage_path: storagePath,
    public_url: publicUrlData?.publicUrl ?? null,
    is_primary: (existingCount ?? 0) === 0,
    uploaded_by: user.id,
  });

  if (insertError) {
    console.error("[uploadAnimalPhoto] insert error:", insertError.message);
    redirect(`${redirectBase}?error=upload_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=uploaded`);
}

export async function setPrimaryAnimalPhoto(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();
  const photoId = String(formData.get("photoId") ?? "").trim();

  const redirectBase = `/${locale}/canil/animais/${animalId}`;
  if (!animalId || !photoId) {
    redirect(`${redirectBase}?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/${animalId}`);
  }

  const ownership = await ensureShelterOwnsAnimal(supabase, user.id, animalId);
  if (!ownership) {
    redirect(`${redirectBase}?error=not_authorized`);
  }

  await supabase.from("animal_fotos").update({ is_primary: false }).eq("animal_id", animalId);
  const { error } = await supabase
    .from("animal_fotos")
    .update({ is_primary: true })
    .eq("animal_id", animalId)
    .eq("id", photoId);

  if (error) {
    redirect(`${redirectBase}?error=update_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=primary_set`);
}

export async function deleteAnimalPhoto(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "").trim();
  const photoId = String(formData.get("photoId") ?? "").trim();

  const redirectBase = `/${locale}/canil/animais/${animalId}`;
  if (!animalId || !photoId) {
    redirect(`${redirectBase}?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/${animalId}`);
  }

  const ownership = await ensureShelterOwnsAnimal(supabase, user.id, animalId);
  if (!ownership) {
    redirect(`${redirectBase}?error=not_authorized`);
  }

  const { data: photo } = await supabase
    .from("animal_fotos")
    .select("id,storage_path,is_primary")
    .eq("id", photoId)
    .eq("animal_id", animalId)
    .maybeSingle();

  if (!photo) {
    redirect(`${redirectBase}?error=photo_not_found`);
  }

  await supabase.storage.from(ANIMAL_PHOTOS_BUCKET).remove([photo.storage_path]);
  const { error } = await supabase.from("animal_fotos").delete().eq("id", photoId);

  if (error) {
    redirect(`${redirectBase}?error=delete_failed`);
  }

  if (photo.is_primary) {
    const { data: nextPrimary } = await supabase
      .from("animal_fotos")
      .select("id")
      .eq("animal_id", animalId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (nextPrimary) {
      await supabase.from("animal_fotos").update({ is_primary: true }).eq("id", nextPrimary.id);
    }
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=deleted`);
}
