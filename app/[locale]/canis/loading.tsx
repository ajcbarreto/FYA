import { CanisPageSkeleton } from "@/components/skeletons/canis-page-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

export default async function CanisLoading() {
  const locale = await getLocaleFromHeaders();
  return <CanisPageSkeleton locale={locale} />;
}
