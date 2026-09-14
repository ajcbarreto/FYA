import { Suspense } from "react";
import { Brand } from "@/components/brand";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { NavbarActions } from "@/components/navbar-actions";
import { NavbarActionsSkeleton } from "@/components/navbar-actions-skeleton";
import { NavbarDashboardLink } from "@/components/navbar-dashboard-link";

type NavbarProps = {
  locale: Locale;
};

export function Navbar({ locale }: NavbarProps) {
  const dictionary = getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto w-full max-w-7xl px-5 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold tracking-tight text-primary"
          >
            <Brand />
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            <Link
              href={`/${locale}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dictionary.nav.home}
            </Link>
            <Link
              href={`/${locale}/pets`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dictionary.nav.pets}
            </Link>
            <Link
              href={`/${locale}/canis`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dictionary.nav.shelters}
            </Link>
            <Link
              href={`/${locale}/historias`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {dictionary.nav.stories}
            </Link>
            <Suspense fallback={null}>
              <NavbarDashboardLink locale={locale} />
            </Suspense>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <Suspense fallback={<NavbarActionsSkeleton />}>
              <NavbarActions locale={locale} />
            </Suspense>
          </div>
        </div>
      </nav>
    </header>
  );
}
