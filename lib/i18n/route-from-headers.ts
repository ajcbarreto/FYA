import { headers } from "next/headers";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

export type RouteSkeletonKind =
  | "home"
  | "dashboard"
  | "generic";

export async function getRouteSkeletonKindFromHeaders(): Promise<RouteSkeletonKind> {
  const pathname = (await headers()).get("x-fya-pathname") ?? "";
  const locale = await getLocaleFromHeaders();

  if (pathname === `/${locale}` || pathname === `/${locale}/`) {
    return "home";
  }

  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1];

  if (section === "user" || section === "canil" || section === "admin") {
    return "dashboard";
  }

  return "generic";
}
