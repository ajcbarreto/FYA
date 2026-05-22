import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
};

type ProfileAdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .order("created_at", { ascending: false });

  const profiles = (data as ProfileAdminRow[] | null) ?? [];

  const copy = getDictionary(locale).adminUsers;
  const roles: Record<string, string> = {
    admin: copy.roleAdmin,
    canil: copy.roleCanil,
    user: copy.roleAdopter,
  };

  return (
    <main className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {profiles.length === 0 ? (
        <PageEmpty title={copy.empty} icon={Users} />
      ) : (
        <ul className="space-y-3">
          {profiles.map((profile) => {
            const displayName = profile.full_name?.trim() || profile.email.split("@")[0];
            const initial = (displayName.charAt(0) || "?").toUpperCase();
            const joined = new Intl.DateTimeFormat(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(profile.created_at));
            const roleClass =
              profile.role === "admin"
                ? "bg-destructive/10 text-destructive"
                : profile.role === "canil"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground";
            return (
              <li
                key={profile.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/25 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{profile.full_name ?? displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{joined}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${roleClass}`}>
                  {roles[profile.role] ?? profile.role}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
