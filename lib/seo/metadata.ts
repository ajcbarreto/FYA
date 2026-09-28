import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { pageCopy, type PageEntry, type PageKey } from "@/lib/seo/pages";
import { pageTitle, siteName, siteOrigin } from "@/lib/seo/site";

const ogLocale: Record<Locale, string> = { pt: "pt_PT", en: "en_GB" };

type PageMetadataInput = {
  locale: Locale;
  /** Path after the locale, starting with "/" ("" for the home page). */
  path: string;
  /** Topic without the brand; " | FYA" is appended. */
  title: string;
  description: string;
  image?: { url: string; alt: string } | null;
  type?: "website" | "article";
  /** Auth, private and utility pages: kept out of search results. */
  noindex?: boolean;
};

/**
 * Single source for <title>, description, canonical, hreflang, Open Graph and
 * Twitter tags. Every page's generateMetadata goes through here.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  noindex = false,
}: PageMetadataInput): Metadata {
  const fullTitle = pageTitle(title);
  const url = `/${locale}${path}`;
  const images = [
    image ?? {
      url: `/media-kit/og-${locale}.png`,
      alt:
        locale === "pt"
          ? "FYA: animais para adoção de canis e associações"
          : "FYA: animals for adoption from shelters and rescue groups",
    },
  ].map((img) => ({
    ...img,
    width: image ? undefined : 1200,
    height: image ? undefined : 630,
  }));

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      languages: noindex
        ? undefined
        : {
            ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
            "x-default": `/pt${path}`,
          },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      locale: ogLocale[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => ogLocale[l]),
      type,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((img) => img.url),
    },
  };
}

export const metadataBase = new URL(siteOrigin());

/** generateMetadata for fixed pages whose copy lives in lib/seo/pages.ts. */
export async function staticPageMetadata(
  params: Promise<{ locale: string }>,
  key: PageKey,
): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page: PageEntry = pageCopy[key];
  return pageMetadata({
    locale,
    path: page.path,
    ...page[locale],
    noindex: page.noindex,
  });
}
