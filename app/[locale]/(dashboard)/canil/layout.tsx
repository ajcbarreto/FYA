import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { CanilSidebar } from "@/components/canil-sidebar";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "shelterArea");
}

type CanilLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function CanilLayout({
  children,
  params,
}: CanilLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const { user } = await getAuthUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil`);
  }

  return (
    <div className="dashboard-shell">
      <CanilSidebar locale={locale as Locale} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
