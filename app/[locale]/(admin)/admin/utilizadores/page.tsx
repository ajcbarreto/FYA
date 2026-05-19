import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

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

  const copy =
    locale === "pt"
      ? {
          title: "Utilizadores",
          subtitle: "Todos os perfis registados na plataforma.",
          colName: "Nome",
          colEmail: "Email",
          colRole: "Perfil",
          colJoined: "Registo",
          empty: "Sem utilizadores.",
          roles: { admin: "Admin", canil: "Canil", user: "Adotante" } as Record<string, string>,
        }
      : {
          title: "Users",
          subtitle: "All profiles registered on the platform.",
          colName: "Name",
          colEmail: "Email",
          colRole: "Role",
          colJoined: "Joined",
          empty: "No users.",
          roles: { admin: "Admin", canil: "Shelter", user: "Adopter" } as Record<string, string>,
        };

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {profiles.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.colName}</th>
                  <th className="px-6 py-4 font-bold">{copy.colEmail}</th>
                  <th className="px-6 py-4 font-bold">{copy.colRole}</th>
                  <th className="px-6 py-4 font-bold">{copy.colJoined}</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-t border-border/15">
                    <td className="px-6 py-4 font-semibold">{profile.full_name ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{profile.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                        {copy.roles[profile.role] ?? profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
                        new Date(profile.created_at),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
