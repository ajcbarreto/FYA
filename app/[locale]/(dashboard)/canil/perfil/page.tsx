import { getOwnedShelter } from "@/lib/canil/owned-shelter";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
/** Owners see the same real public profile as adopters, avoiding duplicated placeholder content. */
export default async function ShelterProfile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { supabase, user } = await getAuthUser();
  if (!user || !supabase) redirect(`/${locale}/auth/login?next=/canil/perfil`);
  const data = await getOwnedShelter(supabase,user.id);
  if (!data) redirect(`/${locale}/canil?error=no_shelter`);
  redirect(`/${locale}/canis/${data.id}`);
}
