import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptionRequestsForOwner } from "@/lib/adoption/db";
import { buildRequestsCsv, csvResponse } from "@/lib/adoption/export";
import { isLocale } from "@/lib/i18n/config";

type RouteParams = { locale: string };

export async function GET(_request: Request, context: { params: Promise<RouteParams> }) {
  const { locale } = await context.params;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login?next=/user/pedidos-recebidos`, _request.url));
  }

  const requests = await getAdoptionRequestsForOwner(supabase, user.id);
  const csv = buildRequestsCsv(requests, locale);
  const filename = `pedidos-recebidos-${new Date().toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
