import { NavigationLink as Link } from "@/components/navigation-link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { getNavbarUserData } from "@/lib/supabase/get-navbar-user";

type NavbarDashboardLinkProps = {
  locale: Locale;
};

export async function NavbarDashboardLink({ locale }: NavbarDashboardLinkProps) {
  const dictionary = getDictionary(locale);
  const { user, role } = await getNavbarUserData();

  if (!user) {
    return null;
  }

  const roleDashboardHref =
    role === "admin"
      ? `/${locale}/admin`
      : role === "canil"
        ? `/${locale}/canil`
        : `/${locale}/user`;
  const roleDashboardLabel =
    role === "admin"
      ? dictionary.nav.admin
      : role === "canil"
        ? dictionary.nav.canilDashboard
        : dictionary.nav.userDashboard;

  return (
    <Link
      href={roleDashboardHref}
      className="rounded-full bg-muted px-4 py-2 text-primary"
    >
      {roleDashboardLabel}
    </Link>
  );
}
