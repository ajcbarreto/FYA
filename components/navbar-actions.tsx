import Link from "next/link";
import { Heart } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { getNavbarUserData } from "@/lib/supabase/get-navbar-user";
import { AccountDropdown } from "@/components/account-dropdown";
import { NavbarBadgeLinks } from "@/components/navbar-badge-links";
import { MobileMenu, type MobileLink } from "@/components/mobile-menu";

type NavbarActionsProps = {
  locale: Locale;
};

export async function NavbarActions({ locale }: NavbarActionsProps) {
  const dictionary = getDictionary(locale);
  const { user, role, fullName, email } = await getNavbarUserData();

  const roleDashboardHref =
    role === "admin"
      ? `/${locale}/admin`
      : role === "canil"
        ? `/${locale}/canil`
        : `/${locale}/user`;
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
  const roleSettingsLabel =
    role === "canil"
      ? dictionary.nav.canilSettings
      : dictionary.nav.userSettings;
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
          settings: "Configurações",
          logout: "Terminar sessão",
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
    mobileLinks.push({
      href: `/${locale}/notificacoes`,
      label: dictionary.nav.notifications,
    });
  }

  if (role === "user") {
    mobileLinks.push(
      { href: `/${locale}/user`, label: dictionary.nav.userDashboard },
      {
        href: `/${locale}/user/favoritos`,
        label: dictionary.nav.userFavorites,
      },
      { href: `/${locale}/user/pedidos`, label: dictionary.nav.userRequests },
      { href: `/${locale}/user/mensagens`, label: dictionary.nav.userMessages },
    );
  } else if (role === "canil") {
    mobileLinks.push(
      { href: `/${locale}/canil`, label: dictionary.nav.canilDashboard },
      {
        href: `/${locale}/canil/mensagens`,
        label: dictionary.nav.userMessages,
      },
      {
        href: `/${locale}/canil/configuracoes`,
        label: dictionary.nav.canilSettings,
      },
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
    <>
      {role === "user" && (
        <Link
          href={`/${locale}/user/favoritos`}
          aria-label={dictionary.nav.userFavorites}
          className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <Heart className="h-5 w-5" />
        </Link>
      )}

      {user && (
        <div className="flex items-center gap-1 sm:gap-2">
          <NavbarBadgeLinks
            locale={locale}
            role={role}
            messagesLabel={dictionary.nav.userMessages}
            notificationsLabel={dictionary.nav.notifications}
          />
        </div>
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
          className="hidden h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
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

      <MobileMenu
        links={mobileLinks}
        openLabel={mobileMenuCopy.open}
        closeLabel={mobileMenuCopy.close}
      />
    </>
  );
}
