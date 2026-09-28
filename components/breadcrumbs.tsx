import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

export type Crumb = {
  label: string;
  /** Path after the locale; omitted for the current page. */
  path?: string;
  /** Visible link when it differs from the canonical path (e.g. kept filters). */
  href?: string;
};

/**
 * Visible trail for inner pages plus the matching BreadcrumbList. "Início" is
 * added first; the last crumb is the current page.
 */
export function Breadcrumbs({
  locale,
  items,
  currentPath,
}: {
  locale: Locale;
  items: Crumb[];
  /** Path of the current page, used for its BreadcrumbList entry. */
  currentPath: string;
}) {
  const trail: Crumb[] = [
    { label: locale === "pt" ? "Início" : "Home", path: "" },
    ...items,
  ];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          trail.map((crumb, i) => ({
            name: crumb.label,
            path: `/${locale}${i === trail.length - 1 ? currentPath : (crumb.path ?? "")}`,
          })),
        )}
      />
      <nav aria-label="breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={i} className="inline-flex items-center gap-1.5">
                {last ? (
                  <span
                    aria-current="page"
                    className="font-medium text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href ?? `/${locale}${crumb.path ?? ""}`}
                      className="hover:text-primary hover:underline"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

const sections = {
  pets: {
    path: "/pets",
    pt: "Animais para adoção",
    en: "Animals for adoption",
  },
  shelters: {
    path: "/canis",
    pt: "Canis e associações",
    en: "Shelters and rescue groups",
  },
  stories: {
    path: "/historias",
    pt: "Animais adotados",
    en: "Adopted animals",
  },
  match: { path: "/match", pt: "Ajuda para escolher", en: "Help choosing" },
  help: { path: "/ajuda", pt: "Centro de ajuda", en: "Help centre" },
  forShelters: {
    path: "/para-canis",
    pt: "FYA para canis",
    en: "FYA for shelters",
  },
  privacy: { path: "/privacidade", pt: "Privacidade", en: "Privacy" },
  terms: { path: "/termos", pt: "Condições de utilização", en: "Terms of use" },
} as const;

/** Crumb for a top-level section, with the same label on every page. */
export function sectionCrumb(
  locale: Locale,
  section: keyof typeof sections,
): Crumb & { path: string } {
  const { path, ...labels } = sections[section];
  return { label: labels[locale], path };
}
