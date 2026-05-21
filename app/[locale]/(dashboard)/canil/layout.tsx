import { notFound, redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { CanilSidebar } from "@/components/canil-sidebar";
import { getShelterForUser } from "@/lib/canil/shelter-data";

type CanilLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function CanilLayout({ children, params }: CanilLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);

  const [pendingRequestsResult, pendingReviewsResult] = shelter
    ? await Promise.all([
        supabase
          .from("pedidos_adocao")
          .select("id", { count: "exact", head: true })
          .eq("canil_id", shelter.id)
          .in("status", ["pendente", "entrevista"]),
        supabase
          .from("avaliacoes_canil")
          .select("id", { count: "exact", head: true })
          .eq("canil_id", shelter.id)
          .eq("estado", "pendente"),
      ])
    : [{ count: 0 }, { count: 0 }];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:px-8">
      <CanilSidebar
        locale={locale as Locale}
        pendingRequestsCount={pendingRequestsResult.count ?? 0}
        pendingReviewsCount={pendingReviewsResult.count ?? 0}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
