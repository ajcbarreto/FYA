import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
/** Owners see the same real public profile as adopters, avoiding duplicated placeholder content. */
export default async function ShelterProfile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/canil/perfil`);
  const { data, error } = await supabase
    .from("canis")
    .select("id")
    .eq("owner_profile_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to load shelter", { cause: error });
  if (!data) redirect(`/${locale}/canil?error=no_shelter`);
  redirect(`/${locale}/canis/${data.id}`);
}
