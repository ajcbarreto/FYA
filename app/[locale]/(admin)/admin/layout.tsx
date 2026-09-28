import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { resolveUserRole } from "@/lib/auth/role";
import { hasSecondFactor, mfaPath } from "@/lib/auth/mfa";
import { AdminSidebar } from "@/components/admin-sidebar";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "adminArea", "/admin");
}

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const { supabase, user } = await getAuthUser();

  if (!user || !supabase) {
    redirect(`/${locale}/auth/login?next=/admin`);
  }

  const role = await resolveUserRole(supabase, user);
  if (role !== "admin") {
    redirect(`/${locale}`);
  }

  if (!(await hasSecondFactor(supabase))) {
    redirect(mfaPath(locale, `/${locale}/admin`));
  }

  return (
    <div className="dashboard-shell">
      <AdminSidebar locale={locale as Locale} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
