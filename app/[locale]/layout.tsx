import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { NavbarSkeleton } from "@/components/navbar-skeleton";
import { SiteFooter } from "@/components/site-footer";
import { isLocale, type Locale } from "@/lib/i18n/config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <Suspense fallback={<NavbarSkeleton locale={locale as Locale} />}>
        <Navbar locale={locale as Locale} />
      </Suspense>
      {children}
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
