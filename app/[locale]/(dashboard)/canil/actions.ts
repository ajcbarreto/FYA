"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";

const allowedStatuses = [
  "disponivel",
  "reservado",
  "em_tratamento",
  "adotado",
] as const;

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function updateAnimalStatus(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const animalId = String(formData.get("animalId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    !animalId ||
    !allowedStatuses.includes(status as (typeof allowedStatuses)[number])
  ) {
    redirect(`/${locale}/canil/animais?error=invalid_status`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);

  if (!shelter) {
    redirect(`/${locale}/canil/animais?error=no_shelter`);
  }

  const { error } = await supabase
    .from("animais")
    .update({ status })
    .eq("id", animalId)
    .eq("canil_id", shelter.id);

  if (error) {
    redirect(`/${locale}/canil/animais?error=save_failed`);
  }

  redirect(`/${locale}/canil/animais?success=updated`);
}

export async function updateShelterSettings(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const nome = String(formData.get("nome") ?? "").trim();
  const localizacao = String(formData.get("localizacao") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const emailContacto = String(formData.get("email_contacto") ?? "").trim();
  const missao = String(formData.get("missao") ?? "").trim();

  if (!nome || !localizacao) {
    redirect(`/${locale}/canil/configuracoes?error=invalid_data`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/configuracoes`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);

  if (!shelter) {
    redirect(`/${locale}/canil/configuracoes?error=no_shelter`);
  }

  const donationUrl = String(formData.get("donation_url") ?? "").trim();
  const donationMessage = String(formData.get("donation_message") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  if (imageUrl) { try { const url = new URL(imageUrl); if (url.protocol !== "https:") throw new Error(); } catch { redirect(`/${locale}/canil/configuracoes?error=invalid_data`); } }
  if (donationUrl) {
    let valid = false;
    try {
      const url = new URL(donationUrl);
      valid = url.protocol === "https:" && !url.username && !url.password;
    } catch {}
    if (!valid || donationUrl.length > 2000) redirect(`/${locale}/canil/configuracoes?error=invalid_data`);
  }
  if (donationMessage.length > 1000) redirect(`/${locale}/canil/configuracoes?error=invalid_data`);
  const payload = {
    donation_url: donationUrl || null,
    donation_message: donationMessage || null,
    image_url: imageUrl || null,
    nome,
    localizacao,
    telefone: telefone || null,
    email_contacto: emailContacto || null,
    missao: missao || null,
  };

  const { error } = await supabase
    .from("canis")
    .update(payload)
    .eq("id", shelter.id);

  if (error) {
    redirect(`/${locale}/canil/configuracoes?error=save_failed`);
  }

  redirect(`/${locale}/canil/configuracoes?success=saved`);
}
