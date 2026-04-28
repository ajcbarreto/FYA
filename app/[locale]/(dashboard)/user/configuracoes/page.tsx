import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type UserSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function UserSettingsPage({ params }: UserSettingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/configuracoes`);
  }

  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  const displayName = profile?.full_name ?? user.user_metadata.full_name ?? user.email ?? "User";

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{locale === "pt" ? "Configuracoes da Conta" : "Account Settings"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "pt"
            ? "Area basica para dados de conta. Podes expandir esta pagina com preferencias e notificacoes."
            : "Basic account area. You can later extend this page with preferences and notifications."}
        </p>
      </header>

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{locale === "pt" ? "Nome" : "Name"}</dt>
            <dd className="font-semibold">{displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-semibold">{profile?.email ?? user.email ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{locale === "pt" ? "Tipo de conta" : "Account type"}</dt>
            <dd className="font-semibold">{locale === "pt" ? "Adotante" : "Adopter"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
