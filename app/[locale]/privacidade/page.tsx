import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { LegalInformation } from "@/components/legal-information";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "privacy");
}
export default async function Privacy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalInformation locale={locale} kind="privacy" />;
}
