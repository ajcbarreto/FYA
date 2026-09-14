import { CatalogPageSkeleton } from "@/components/skeletons/catalog-page-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

export default async function PetsLoading() {
  const locale = await getLocaleFromHeaders();
  return <CatalogPageSkeleton locale={locale} />;
}
