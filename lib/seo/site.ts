// Plain module (no framework imports) so it can be unit-tested with node --test.

export const siteName = "FYA";

/**
 * Absolute origin used for canonical URLs, hreflang, Open Graph and the
 * sitemap. NEXT_PUBLIC_APP_URL wins; on Vercel without it, the production
 * domain Vercel exposes is used, so previews still point at production.
 */
export function siteOrigin(
  env: Record<string, string | undefined> = process.env,
) {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/** "Topic | FYA", unless the topic already ends with the brand. */
export function pageTitle(topic: string) {
  return topic.endsWith(`| ${siteName}`) ? topic : `${topic} | ${siteName}`;
}

/**
 * Trims free text (animal or shelter descriptions) to at most `max`
 * characters on a word boundary, padding short text with `fallback`.
 */
export function describe(
  text: string | null | undefined,
  fallback: string,
  max = 160,
) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  let result =
    clean.length >= 70 ? clean : [clean, fallback].filter(Boolean).join(" ");
  if (result.length > max) {
    const cut = result.slice(0, max - 1);
    result = `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "")}…`;
  }
  return result;
}
