import { PetDetailSkeleton } from "@/components/skeletons/pet-detail-skeleton";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

export default async function PetDetailsLoading() {
  const locale = await getLocaleFromHeaders();
  return <PetDetailSkeleton locale={locale} />;
}
