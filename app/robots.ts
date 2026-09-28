import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { siteOrigin } from "@/lib/seo/site";

// Private areas stay out of crawls. Sign-in pages are not blocked here: they
// carry noindex, which crawlers can only see if they may fetch the page.
const privatePaths = [
  "/user",
  "/canil",
  "/admin",
  "/conta",
  "/dossier",
  "/convites",
  "/notificacoes",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/callback",
        "/*/pets/*/imprimir",
        ...locales.flatMap((locale) =>
          privatePaths.map((path) => `/${locale}${path}`),
        ),
      ],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
