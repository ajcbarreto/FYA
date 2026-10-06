import "server-only";
import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { resolveUserRole } from "@/lib/auth/role";
import { isLocale } from "@/lib/i18n/config";
import { missingFeature } from "@/lib/canil/public-experience";
export async function contactContext(locale: string, admin = false) {
  if (!isLocale(locale)) notFound();
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) redirect(`/${locale}/auth/login`);
  if (admin && (await resolveUserRole(supabase, user)) !== "admin") notFound();
  const { data, error } = await supabase.rpc("contact_requests_version");
  if (error && !missingFeature(error, "contact_requests_version")) throw error;
  return { supabase, user, locale, ready: data === 1 };
}
