import { LocaleDocument } from "@/components/locale-document";
import { NavigationProgress } from "@/components/navigation-progress";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Fallback for pages without their own metadata. The root not-found page sets
// its own <title>, so the root layout deliberately has none.
export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "FYA (Find Your Animal)",
        description: "FYA - Find Your Animal, animal adoption platform",
      }
    : {
        title: "FYA (Find Your Animal)",
        description: "FYA - Find Your Animal, plataforma de adoção de animais",
      };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <LocaleDocument locale={locale} />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navbar locale={locale as Locale} />
      {children}
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
