import { ShelterDetailSkeleton } from "@/components/skeletons/shelter-detail-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

export default async function ShelterDetailLoading() {
  const locale = await getLocaleFromHeaders();
  return <ShelterDetailSkeleton locale={locale} />;
}
