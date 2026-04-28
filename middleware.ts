import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client";
import type { UserRole } from "@/lib/supabase/types";

const protectedRoleByPrefix: Record<string, UserRole> = {
  "/user": "user",
  "/canil": "canil",
  "/admin": "admin",
};

function getRequiredRole(pathname: string) {
  return Object.entries(protectedRoleByPrefix).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (!maybeLocale || !isLocale(maybeLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = maybeLocale;
  const pathnameWithoutLocale = `/${segments.slice(1).join("/")}`.replace(/\/+$/, "") || "/";
  const requiredRole = getRequiredRole(pathnameWithoutLocale);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("next", pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;
  const authorized = role === requiredRole || (role === "admin" && requiredRole !== "admin");

  if (!authorized) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
