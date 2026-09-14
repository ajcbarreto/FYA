export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

export type LocaleMetadata = {
  /** Short code shown in the language switcher (e.g. PT, EN). */
  label: string;
  /** Native language name for accessibility and future dropdown UI. */
  name: string;
  /** BCP 47 tag for Intl date/number formatting. */
  dateLocale: string;
};

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  pt: {
    label: "PT",
    name: "Português",
    dateLocale: "pt-PT",
  },
  en: {
    label: "EN",
    name: "English",
    dateLocale: "en-GB",
  },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const LOCALE_COOKIE = "fya-locale";

const localePattern = new RegExp(`^/(${locales.join("|")})(?=\\/|$)`);

export function stripLocaleFromPath(pathname: string): string {
  return pathname.replace(localePattern, "") || "/";
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = stripLocaleFromPath(normalized);
  return `/${locale}${withoutLocale === "/" ? "" : withoutLocale}`;
}

export function resolvePreferredLocale(
  acceptLanguage: string | null | undefined,
  cookieValue: string | undefined,
): Locale {
  if (cookieValue && isLocale(cookieValue)) {
    return cookieValue;
  }

  if (acceptLanguage) {
    for (const part of acceptLanguage.split(",")) {
      const tag = part.trim().split(";")[0]?.toLowerCase();
      if (!tag) continue;

      const lang = tag.split("-")[0];
      const match = locales.find((item) => item === lang || item === tag);
      if (match) return match;
    }
  }

  return defaultLocale;
}
