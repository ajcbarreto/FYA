import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { UserSidebar } from "@/components/user-sidebar";

type UserLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user`);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:px-8">
      <UserSidebar locale={locale as Locale} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
