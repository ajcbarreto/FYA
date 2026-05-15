import Link from "next/link";
import { Bell } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { resolveUserRole } from "@/lib/auth/role";
import { getUnreadNotificationsCount } from "@/lib/notifications/db";
import type { UserRole } from "@/lib/supabase/types";
import { AccountDropdown } from "@/components/account-dropdown";
import { MobileMenu, type MobileLink } from "@/components/mobile-menu";

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
  let unreadNotifications = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", user.id)
      .maybeSingle();

    fullName = profile?.full_name ?? null;
    email = profile?.email ?? user.email ?? null;
    [role, unreadNotifications] = await Promise.all([
      resolveUserRole(supabase, user),
      getUnreadNotificationsCount(supabase, user.id),
    ]);
  }

  const roleDashboardHref =
    role === "admin" ? `/${locale}/admin` : role === "canil" ? `/${locale}/canil` : `/${locale}/user`;
  const roleDashboardLabel =
    role === "admin"
      ? dictionary.nav.admin
      : role === "canil"
        ? dictionary.nav.canilDashboard
        : dictionary.nav.userDashboard;
  const roleSettingsHref =
    role === "admin"
      ? `/${locale}/admin/configuracoes`
      : role === "canil"
        ? `/${locale}/canil/configuracoes`
        : `/${locale}/user/configuracoes`;
  const roleSettingsLabel = role === "canil" ? dictionary.nav.canilSettings : dictionary.nav.userSettings;
  const roleLabel =
    role === "admin"
      ? locale === "pt"
        ? "Administrador"
        : "Administrator"
      : role === "canil"
        ? "Canil"
        : locale === "pt"
          ? "Adotante"
          : "Adopter";
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

  const mobileLinks: MobileLink[] = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/pets`, label: dictionary.nav.pets },
    { href: `/${locale}/canis`, label: dictionary.nav.shelters },
    { href: `/${locale}/historias`, label: dictionary.nav.stories },
  ];
  if (user) {
    mobileLinks.push({ href: `/${locale}/notificacoes`, label: dictionary.nav.notifications });
  }
  if (role === "user") {
    mobileLinks.push(
      { href: `/${locale}/user`, label: dictionary.nav.userDashboard },
      { href: `/${locale}/user/favoritos`, label: dictionary.nav.userFavorites },
      { href: `/${locale}/user/pedidos`, label: dictionary.nav.userRequests },
      { href: `/${locale}/user/mensagens`, label: dictionary.nav.userMessages },
    );
  } else if (role === "canil") {
    mobileLinks.push(
      { href: `/${locale}/canil`, label: dictionary.nav.canilDashboard },
      { href: `/${locale}/canil/configuracoes`, label: dictionary.nav.canilSettings },
    );
  } else if (role === "admin") {
    mobileLinks.push({ href: `/${locale}/admin`, label: dictionary.nav.admin });
  }
  if (!user) {
    mobileLinks.push(
      { href: `/${locale}/auth/login`, label: dictionary.nav.login },
      { href: `/${locale}/auth/register`, label: dictionary.nav.register },
    );
  }
  const mobileMenuCopy =
    locale === "pt"
      ? { open: "Abrir menu", close: "Fechar menu" }
      : { open: "Open menu", close: "Close menu" };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-2xl font-bold tracking-tight text-primary">
            FYA
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href={`/${locale}`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.home}
            </Link>
            <Link href={`/${locale}/pets`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.pets}
            </Link>
            <Link href={`/${locale}/canis`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.shelters}
            </Link>
            <Link href={`/${locale}/historias`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.stories}
            </Link>

            {role === "user" && (
              <>
                <Link href={`/${locale}/user`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.userDashboard}
                </Link>
                <Link href={`/${locale}/user/favoritos`} className="text-muted-foreground transition-colors hover:text-primary">
                  {dictionary.nav.userFavorites}
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

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />

            {user && (
              <Link
                href={`/${locale}/notificacoes`}
                aria-label={dictionary.nav.notifications}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {!user && (
              <Link
                href={`/${locale}/auth/login`}
                className="hidden h-10 items-center rounded-lg px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                {dictionary.nav.login}
              </Link>
            )}
            {!user && (
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
                roleLabel={roleLabel}
                dashboardHref={roleDashboardHref}
                dashboardLabel={roleDashboardLabel}
                settingsHref={roleSettingsHref}
                settingsLabel={roleSettingsLabel}
                menuCopy={menuCopy}
              />
            )}

            <MobileMenu links={mobileLinks} openLabel={mobileMenuCopy.open} closeLabel={mobileMenuCopy.close} />
          </div>
        </div>
      </nav>
    </header>
  );
}
