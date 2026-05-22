import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { PageHeader } from "@/components/page-header";

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
  const t = getDictionary(locale).userSettings;

  return (
    <main className="space-y-6">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t.name}</dt>
            <dd className="font-semibold">{displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-semibold">{profile?.email ?? user.email ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.accountType}</dt>
            <dd className="font-semibold">{t.adopter}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
