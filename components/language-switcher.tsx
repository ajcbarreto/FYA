"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  localeMetadata,
  locales,
  localizedPath,
  stripLocaleFromPath,
  type Locale,
} from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const nextPath = stripLocaleFromPath(pathname);

  return (
    <div
      className="inline-flex h-10 items-center rounded-lg border border-border/60 bg-muted/60 p-1 text-xs font-bold"
      role="group"
      aria-label="Language"
    >
      {locales.map((code) => (
        <Link
          key={code}
          href={localizedPath(code, nextPath)}
          // Switching language is rare; prefetching both variants of every
          // page doubles requests and 404s when a translation is missing.
          prefetch={false}
          aria-current={locale === code ? "true" : undefined}
          aria-label={localeMetadata[code].name}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            locale === code
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {localeMetadata[code].label}
        </Link>
      ))}
    </div>
  );
}
