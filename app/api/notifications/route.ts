import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import {
  getUnreadNotificationsCount,
  listNotifications,
  localizeNotification,
} from "@/lib/notifications/db";
import { getAuthUser } from "@/lib/supabase/get-user";

const PANEL_LIMIT = 8;

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  }

  try {
    const [notifications, unread] = await Promise.all([
      listNotifications(supabase, user.id, PANEL_LIMIT),
      getUnreadNotificationsCount(supabase, user.id),
    ]);

    const items = notifications.map((notification) => ({
      id: notification.id,
      tipo: notification.tipo,
      link: notification.link,
      lida: notification.lida,
      created_at: notification.created_at,
      ...localizeNotification(notification, locale),
    }));

    return NextResponse.json({ items, unread });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ items: [], unread: 0 }, { status: 500 });
  }
}
