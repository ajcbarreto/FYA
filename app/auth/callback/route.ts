import { safeLocalPath } from "@/lib/auth/redirect";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { defaultLocale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // Use the configured public origin: the internal Next server may see localhost
  // behind a proxy even when the browser used a different hostname.
  const origin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : request.nextUrl.origin;
  const code = searchParams.get("code");
  const next = safeLocalPath(searchParams.get("next")) ?? `/${defaultLocale}`;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/${defaultLocale}/auth/login?error=auth_callback`,
  );
}
