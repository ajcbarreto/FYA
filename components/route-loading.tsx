import { GenericPageSkeleton } from "@/components/skeletons/generic-page-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

/** @deprecated Prefer route-specific skeleton components in loading.tsx files. */
export async function RouteLoading() {
  const locale = await getLocaleFromHeaders();
  return <GenericPageSkeleton locale={locale} />;
}
