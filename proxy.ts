import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n/config";
import { createProxySupabaseClient } from "./lib/supabase/proxy-client";
import type { UserRole } from "./lib/supabase/types";

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

export async function proxy(request: NextRequest) {
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

  let supabase: ReturnType<typeof createProxySupabaseClient>["supabase"];
  let response: ReturnType<typeof createProxySupabaseClient>["response"];

  try {
    ({ supabase, response } = createProxySupabaseClient(request));
  } catch {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("next", pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

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
    .maybeSingle();

  let role = profile?.role as UserRole | undefined;

  if (!role) {
    const metadataRole = user.user_metadata?.role;
    if (metadataRole === "admin" || metadataRole === "user" || metadataRole === "canil") {
      role = metadataRole;
    } else {
      const { data: ownedShelter } = await supabase
        .from("canis")
        .select("id")
        .eq("owner_profile_id", user.id)
        .limit(1)
        .maybeSingle();

      if (ownedShelter) {
        role = "canil";
      }
    }
  }

  const authorized = role === requiredRole || (role === "admin" && requiredRole !== "admin");

  if (!authorized) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
