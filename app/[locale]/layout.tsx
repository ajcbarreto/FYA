import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
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
      <Navbar locale={locale as Locale} />
      {children}
    </>
  );
}
