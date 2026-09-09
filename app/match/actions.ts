"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

// Mapeia respostas de estilo de vida para filtros do catalogo.
export async function findMatches(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const species = String(formData.get("species") ?? "").trim();
  const home = String(formData.get("home") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();

  const params = new URLSearchParams();

  if (species === "cao" || species === "gato") {
    params.set("species", species);
  }

  // Only use an observed compatibility, never infer temperament from body size.
  if (home === "apartamento") params.set("compatibility", "apartment");
  if (time === "pouco") params.set("guidance", "routine");
  params.set("match", "true");

  const serialized = params.toString();
  redirect(serialized ? `/${locale}/pets?${serialized}` : `/${locale}/pets`);
}
