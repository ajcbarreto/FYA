import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { GenericPageSkeleton } from "@/components/skeletons/generic-page-skeleton";
import { HomePageSkeleton } from "@/components/skeletons/home-page-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";
import { getRouteSkeletonKindFromHeaders } from "@/lib/i18n/route-from-headers";

export default async function LocaleLoading() {
  const [locale, kind] = await Promise.all([
    getLocaleFromHeaders(),
    getRouteSkeletonKindFromHeaders(),
  ]);

  if (kind === "home") {
    return <HomePageSkeleton locale={locale} />;
  }

  if (kind === "dashboard") {
    return <DashboardPageSkeleton locale={locale} />;
  }

  return <GenericPageSkeleton locale={locale} />;
}
