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
    <div className="inline-flex items-center rounded-full bg-muted/80 p-1 text-xs font-semibold">
      <Link
        href={`/pt${nextPath}`}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "pt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
        }`}
      >
        PT
      </Link>
      <Link
        href={`/en${nextPath}`}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
