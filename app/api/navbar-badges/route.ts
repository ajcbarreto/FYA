import { NextResponse } from "next/server";
import { getUnreadMessagesCount } from "@/lib/adoption/db";
import { getUnreadNotificationsCount } from "@/lib/notifications/db";
import { getAuthUser } from "@/lib/supabase/get-user";

export async function GET() {
  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    return NextResponse.json({ unreadNotifications: 0, unreadMessages: 0 });
  }

  const [unreadNotifications, unreadMessages] = await Promise.all([
    getUnreadNotificationsCount(supabase, user.id),
    getUnreadMessagesCount(supabase, user.id),
  ]);

  return NextResponse.json({ unreadNotifications, unreadMessages });
}
