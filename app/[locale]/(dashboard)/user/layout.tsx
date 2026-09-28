import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { UserSidebar } from "@/components/user-sidebar";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "userArea", "/user");
}

type UserLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const { user } = await getAuthUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user`);
  }

  return (
    <div className="dashboard-shell">
      <UserSidebar locale={locale as Locale} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
