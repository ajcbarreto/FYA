import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n/config";
import { resolveUserRole } from "./lib/auth/role";
import { createProxySupabaseClient } from "./lib/supabase/proxy-client";
import { hasSupabaseEnv } from "./lib/supabase/config";
import type { UserRole } from "./lib/supabase/types";

const protectedRoles: Record<string, UserRole> = {
  user: "user",
  canil: "canil",
  admin: "admin",
};
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/auth/callback") || pathname.startsWith("/api/"))
    return NextResponse.next();
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (!isLocale(locale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }
  request.headers.set("x-fya-locale", locale);
  const next = NextResponse.next({ request: { headers: request.headers } });
  const required = protectedRoles[segments[1]];
  if (!hasSupabaseEnv) {
    return required
      ? NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
      : next;
  }
  const client = createProxySupabaseClient(request);
  const {
    data: { user },
  } = await client.supabase.auth.getUser();
  if (!required) return client.response;
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    client.response.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };
  if (!user)
    return redirectTo(
      `/${locale}/auth/login?next=${encodeURIComponent("/" + segments.slice(1).join("/"))}`,
    );
  try {
    const role = await resolveUserRole(client.supabase, user);
    if (role !== required && role !== "admin")
      return redirectTo(`/${locale}?error=unauthorized`);
  } catch {
    return redirectTo(`/${locale}/auth/login?error=permissions_unavailable`);
  }
  return client.response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
