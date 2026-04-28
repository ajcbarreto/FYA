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
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link href={`/pt${nextPath}`} className={locale === "pt" ? "text-foreground font-medium" : ""}>
        PT
      </Link>
      <span>/</span>
      <Link href={`/en${nextPath}`} className={locale === "en" ? "text-foreground font-medium" : ""}>
        EN
      </Link>
    </div>
  );
}
