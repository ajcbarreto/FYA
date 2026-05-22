import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getAdoptionRequestsForCanil } from "@/lib/adoption/db";
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
    return NextResponse.redirect(new URL(`/${locale}/auth/login?next=/canil/pedidos`, _request.url));
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    return NextResponse.json({ error: "no_shelter" }, { status: 403 });
  }

  const requests = await getAdoptionRequestsForCanil(supabase, shelter.id);
  const csv = buildRequestsCsv(requests, locale);
  const filename = `pedidos-${shelter.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
