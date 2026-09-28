import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  LOCALE_COOKIE,
  resolvePreferredLocale,
  type Locale,
} from "./lib/i18n/config";
import { resolveUserRole } from "./lib/auth/role";
import { hasSecondFactor, mfaPath } from "./lib/auth/mfa";
import { createProxySupabaseClient } from "./lib/supabase/proxy-client";
import { hasSupabaseEnv } from "./lib/supabase/config";
import { publicResourceExists } from "./lib/routing/public-resource";
import { publicResourceFor } from "./lib/routing/public-resource-path";
import type { UserRole } from "./lib/supabase/types";

const protectedRoles: Record<string, UserRole> = {
  user: "user",
  canil: "canil",
  admin: "admin",
};

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/auth/callback") || pathname.startsWith("/api/"))
    return NextResponse.next();
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (!isLocale(locale)) {
    const preferred = resolvePreferredLocale(
      request.headers.get("accept-language"),
      request.cookies.get(LOCALE_COOKIE)?.value,
    );
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname}`;
    return withLocaleCookie(NextResponse.redirect(url), preferred);
  }
  const activeLocale = locale as Locale;
  request.headers.set("x-fya-locale", activeLocale);
  request.headers.set("x-fya-pathname", pathname);
  const next = withLocaleCookie(
    NextResponse.next({ request: { headers: request.headers } }),
    activeLocale,
  );
  const resource = publicResourceFor(segments.slice(1));
  if (resource) {
    const client =
      hasSupabaseEnv && resource.kind === "record"
        ? createProxySupabaseClient(request)
        : null;
    const exists = await publicResourceExists(
      resource,
      activeLocale,
      client?.supabase ?? null,
    );
    if (!exists) {
      // No route matches /{locale}/404, so the root not-found page renders
      // with the site layout and the status set here.
      const response = NextResponse.rewrite(
        new URL(`/${activeLocale}/404`, request.url),
        { status: 404, request: { headers: request.headers } },
      );
      client?.response.cookies
        .getAll()
        .forEach((cookie) => response.cookies.set(cookie));
      return withLocaleCookie(response, activeLocale);
    }
    if (client) return withLocaleCookie(client.response, activeLocale);
  }
  const required = protectedRoles[segments[1]];
  if (!hasSupabaseEnv) {
    return required
      ? withLocaleCookie(
          NextResponse.redirect(
            new URL(`/${activeLocale}/auth/login`, request.url),
          ),
          activeLocale,
        )
      : next;
  }
  if (!required) return next;
  const client = createProxySupabaseClient(request);
  const {
    data: { user },
  } = await client.supabase.auth.getUser();
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    client.response.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return withLocaleCookie(response, activeLocale);
  };
  if (!user)
    return redirectTo(
      `/${locale}/auth/login?next=${encodeURIComponent("/" + segments.slice(1).join("/"))}`,
    );
  try {
    const role = await resolveUserRole(client.supabase, user);
    let teamAccess = false;
    if (required === "canil" && role !== "canil" && role !== "admin") {
      const { data, error } = await client.supabase.rpc("my_shelters");
      if (error) throw error;
      teamAccess = Boolean(data?.length);
    }
    if (role !== required && role !== "admin" && !teamAccess)
      return redirectTo(`/${locale}?error=unauthorized`);
    if (role === "admin" && !(await hasSecondFactor(client.supabase)))
      return redirectTo(mfaPath(locale, pathname));
  } catch {
    return redirectTo(`/${locale}/auth/login?error=permissions_unavailable`);
  }
  return withLocaleCookie(client.response, activeLocale);
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
