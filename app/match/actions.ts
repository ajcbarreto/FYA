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

  // Apartamento ou pouco tempo livre -> porte pequeno.
  // Casa com espaco e muito tempo -> porte grande.
  let size = "";
  if (home === "apartamento" || time === "pouco") {
    size = "pequeno";
  } else if (home === "casa_grande" && time === "muito") {
    size = "grande";
  } else if (home === "casa" || time === "medio") {
    size = "medio";
  }
  if (size) {
    params.set("size", size);
  }

  const serialized = params.toString();
  redirect(serialized ? `/${locale}/pets?${serialized}` : `/${locale}/pets`);
}
