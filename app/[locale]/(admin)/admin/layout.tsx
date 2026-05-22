import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { resolveUserRole } from "@/lib/auth/role";
import { AdminSidebar } from "@/components/admin-sidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/admin`);
  }

  const role = await resolveUserRole(supabase, user);
  if (role !== "admin") {
    redirect(`/${locale}`);
  }

  const [pendingAnimalsResult, openDenunciasResult] = await Promise.all([
    supabase.from("animais").select("id", { count: "exact", head: true }).eq("estado_moderacao", "pendente"),
    supabase.from("denuncias").select("id", { count: "exact", head: true }).eq("estado", "aberta"),
  ]);
  const moderationQueueCount = (pendingAnimalsResult.count ?? 0) + (openDenunciasResult.count ?? 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:px-8">
      <AdminSidebar locale={locale as Locale} moderationQueueCount={moderationQueueCount} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
