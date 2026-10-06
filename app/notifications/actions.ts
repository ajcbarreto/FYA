"use server";

import { getAuthUser } from "@/lib/supabase/get-user";
import { validId } from "@/lib/records/validation";
import type { NotificationRow } from "@/lib/notifications/db";
import { notificationTarget } from "@/lib/notifications/target";
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

  const target = link.startsWith("/")
    ? `/${locale}${link}`
    : `/${locale}/notificacoes`;
  redirect(target);
}

/** Called from the navbar panel: marks without redirecting away. */
export async function markNotificationsReadInPlace(notificationId?: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false };
  }

  let query = supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("user_profile_id", user.id)
    .eq("lida", false);

  if (notificationId) {
    query = query.eq("id", notificationId);
  }

  const { error } = await query;

  if (error) {
    console.error("[markNotificationsReadInPlace]", error.message);
    return { ok: false };
  }

  revalidatePath("/[locale]/notificacoes", "page");
  return { ok: true };
}

// Non-redirecting actions keep the notification panel on the current page.
export async function loadNotificationPanel() {
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user) return { ok: false as const };
  const [rows, total] = await Promise.all([
    supabase
      .from("notificacoes")
      .select("id,user_profile_id,tipo,referencia,link,lida,created_at")
      .eq("user_profile_id", user.id)
      .order("created_at", { ascending: false })
      .order("id")
      .limit(10),
    supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("user_profile_id", user.id)
      .eq("lida", false),
  ]);
  if (rows.error || total.error) return { ok: false as const };
  return {
    ok: true as const,
    items: rows.data as NotificationRow[],
    unread: total.count ?? 0,
  };
}
export async function readNotificationPanel(localeValue: string, id?: string) {
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;
  const { supabase, user } = await getAuthUser();
  if (!supabase || !user || (id !== undefined && !validId(id)))
    return { ok: false as const };
  let query = supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("user_profile_id", user.id);
  if (id) query = query.eq("id", id);
  else query = query.eq("lida", false);
  const { data, error } = await query.select("id,link");
  if (error || (id && !data?.length)) return { ok: false as const };
  revalidatePath(`/${locale}/notificacoes`);
  return {
    ok: true as const,
    target: id ? notificationTarget(data?.[0]?.link ?? null, locale) : null,
  };
}
