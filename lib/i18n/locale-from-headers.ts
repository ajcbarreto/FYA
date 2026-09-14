import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export async function getLocaleFromHeaders(): Promise<Locale> {
  const localeHeader = (await headers()).get("x-fya-locale");
  return localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
}
