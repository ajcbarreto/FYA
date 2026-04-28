import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { UserRole } from "@/lib/supabase/types";
import { AccountDropdown } from "@/components/account-dropdown";

type NavbarProps = {
  locale: Locale;
};

export async function Navbar({ locale }: NavbarProps) {
  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole | null = null;
  let fullName: string | null = null;
  let email: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,full_name,email")
      .eq("id", user.id)
      .maybeSingle();

    role = (profile?.role as UserRole | undefined) ?? null;
    fullName = profile?.full_name ?? null;
    email = profile?.email ?? user.email ?? null;

    // Fallback resilience: if profile role is missing for any reason, infer from owned shelter.
    if (!role) {
      const metadataRole = user.user_metadata?.role;
      if (metadataRole === "admin" || metadataRole === "user" || metadataRole === "canil") {
        role = metadataRole;
      } else {
        const { data: ownedShelter } = await supabase
          .from("canis")
          .select("id")
          .eq("owner_profile_id", user.id)
          .limit(1)
          .maybeSingle();
        if (ownedShelter) {
          role = "canil";
        }
      }
    }
  }

  const roleDashboardHref =
    role === "admin" ? `/${locale}/admin` : role === "canil" ? `/${locale}/canil` : `/${locale}/user`;
  const roleDashboardLabel =
    role === "admin"
      ? dictionary.nav.admin
      : role === "canil"
        ? dictionary.nav.canilDashboard
        : dictionary.nav.userDashboard;
  const roleSettingsHref = role === "canil" ? `/${locale}/canil/configuracoes` : `/${locale}/user/configuracoes`;
  const roleSettingsLabel = role === "canil" ? dictionary.nav.canilSettings : dictionary.nav.userSettings;
  const userDisplayName =
    fullName?.trim() ||
    (email?.includes("@") ? email.split("@")[0] : null) ||
    (locale === "pt" ? "Conta" : "Account");
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const menuCopy =
    locale === "pt"
      ? {
          openMenu: "Abrir menu da conta",
          panel: "Meu painel",
          settings: "Configuracoes",
          logout: "Terminar sessao",
        }
      : {
          openMenu: "Open account menu",
          panel: "My dashboard",
          settings: "Settings",
          logout: "Sign out",
        };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-2xl font-black tracking-tight text-primary">
            FYA
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href={`/${locale}`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.home}
            </Link>
            <Link href={`/${locale}/pets`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.pets}
            </Link>

            {role === "user" && (
              <>
                <Link href={`/${locale}/user`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.userDashboard}
                </Link>
                <Link href={`/${locale}/user/pedidos`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.userRequests}
                </Link>
                <Link href={`/${locale}/user/mensagens`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.userMessages}
                </Link>
              </>
            )}

            {role === "canil" && (
              <>
                <Link href={`/${locale}/canil`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.canilDashboard}
                </Link>
                <Link href={`/${locale}/canil/configuracoes`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.canilSettings}
                </Link>
              </>
            )}

            {role === "admin" && (
              <Link href={`/${locale}/admin`} className="text-muted-foreground transition-colors hover:text-primary">
                {dictionary.nav.admin}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />

            {!user && (
              <Link
                href={`/${locale}/auth/login`}
                className="hidden rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary sm:inline-flex"
              >
                {dictionary.nav.login}
              </Link>
            )}
            {!user && (
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-full bg-gradient-to-br from-primary to-accent px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[0.98]"
              >
                {dictionary.nav.register}
              </Link>
            )}

            {user && (
              <AccountDropdown
                locale={locale}
                displayName={userDisplayName}
                email={email}
                initial={userInitial}
                dashboardHref={roleDashboardHref}
                dashboardLabel={roleDashboardLabel}
                settingsHref={roleSettingsHref}
                settingsLabel={roleSettingsLabel}
                menuCopy={menuCopy}
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold md:hidden">
          <Link href={`/${locale}`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
            {dictionary.nav.home}
          </Link>
          <Link href={`/${locale}/pets`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
            {dictionary.nav.pets}
          </Link>

          {role === "user" && (
            <>
              <Link href={`/${locale}/user`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
                {dictionary.nav.userDashboard}
              </Link>
              <Link href={`/${locale}/user/pedidos`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
                {dictionary.nav.userRequests}
              </Link>
              <Link href={`/${locale}/user/mensagens`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
                {dictionary.nav.userMessages}
              </Link>
            </>
          )}

          {role === "canil" && (
            <>
              <Link href={`/${locale}/canil`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
                {dictionary.nav.canilDashboard}
              </Link>
              <Link href={`/${locale}/canil/configuracoes`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
                {dictionary.nav.canilSettings}
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link href={`/${locale}/admin`} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:text-primary">
              {dictionary.nav.admin}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
