"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

const VALID_SPECIES = new Set(["cao", "gato"]);
const VALID_HOME = new Set(["apartamento", "casa", "casa_grande"]);
const VALID_TIME = new Set(["pouco", "medio", "muito"]);

// Recolhe as respostas do questionario e reabre a pagina de match em modo
// resultados, onde os animais sao pontuados e ordenados por compatibilidade.
export async function findMatches(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const species = String(formData.get("species") ?? "").trim();
  const home = String(formData.get("home") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();

  const params = new URLSearchParams();
  if (VALID_SPECIES.has(species)) params.set("species", species);
  if (VALID_HOME.has(home)) params.set("home", home);
  if (VALID_TIME.has(time)) params.set("time", time);
  params.set("results", "1");

  redirect(`/${locale}/match?${params.toString()}`);
}
