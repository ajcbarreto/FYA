"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const nextPath = pathname.replace(/^\/(pt|en)(?=\/|$)/, "") || "/";

  return (
    <div className="inline-flex h-10 items-center rounded-lg border border-border/60 bg-muted/60 p-1 text-xs font-bold">
      <Link
        href={`/pt${nextPath}`}
        aria-current={locale === "pt" ? "true" : undefined}
        className={`rounded-md px-3 py-1.5 transition-colors ${
          locale === "pt"
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        PT
      </Link>
      <Link
        href={`/en${nextPath}`}
        aria-current={locale === "en" ? "true" : undefined}
        className={`rounded-md px-3 py-1.5 transition-colors ${
          locale === "en"
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
