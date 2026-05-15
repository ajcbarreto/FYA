"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function markAllNotificationsRead(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/notificacoes`);
  }

  await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("user_profile_id", user.id)
    .eq("lida", false);

  revalidatePath(`/${locale}/notificacoes`);
  redirect(`/${locale}/notificacoes`);
}

export async function openNotification(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/notificacoes`);
  }

  if (notificationId) {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", notificationId)
      .eq("user_profile_id", user.id);
  }

  const target = link.startsWith("/") ? `/${locale}${link}` : `/${locale}/notificacoes`;
  redirect(target);
}
