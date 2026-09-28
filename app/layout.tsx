import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import { metadataBase } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeHeader = (await headers()).get("x-fya-locale");
  const locale =
    localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          {locale === "pt" ? "Saltar para o conteúdo" : "Skip to content"}
        </a>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
