"use client";

import { NavigationLink as Link } from "@/components/navigation-link";
import { usePathname } from "next/navigation";
import { isDashboardLinkActive } from "@/lib/dashboard-navigation";
import { DashboardLinkStatus } from "@/components/dashboard-link-status";
import type { ComponentType } from "react";
import {
  Home,
  FileText,
  MessageCircle,
  Search,
  Settings,
  Heart,
  LogOut,
  PawPrint,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { logout } from "@/app/auth/register/actions";

type UserSidebarProps = {
  locale: Locale;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function UserSidebar({ locale }: UserSidebarProps) {
  const pathname = usePathname();
  const copy =
    locale === "pt"
      ? {
          subtitle: "Área do adotante",
          navLabel: "Navegação",
          accountLabel: "A tua conta",
          links: {
            dashboard: "Painel",
            catalog: "Catálogo de animais",
            favorites: "Favoritos",
            requests: "Meus Pedidos",
            messages: "Mensagens",
            listings: "Dar para adoção",
            settings: "Definições",
            logout: "Terminar sessão",
          },
        }
      : {
          subtitle: "Adopter Area",
          navLabel: "Navigation",
          accountLabel: "Your account",
          links: {
            dashboard: "Dashboard",
            catalog: "Animal catalog",
            favorites: "Favorites",
            requests: "My Requests",
            messages: "Messages",
            listings: "Rehome an animal",
            settings: "Settings",
            logout: "Sign out",
          },
        };

  const items: NavItem[] = [
    { href: `/${locale}/user`, label: copy.links.dashboard, icon: Home },
    { href: `/${locale}/pets`, label: copy.links.catalog, icon: Search },
    {
      href: `/${locale}/user/favoritos`,
      label: copy.links.favorites,
      icon: Heart,
    },
    {
      href: `/${locale}/user/pedidos`,
      label: copy.links.requests,
      icon: FileText,
    },
    {
      href: `/${locale}/user/mensagens`,
      label: copy.links.messages,
      icon: MessageCircle,
    },
    {
      href: `/${locale}/user/animais`,
      label: copy.links.listings,
      icon: PawPrint,
    },
  ];
  const accountItems: NavItem[] = [
    {
      href: `/${locale}/user/configuracoes`,
      label: copy.links.settings,
      icon: Settings,
    },
  ];

  const renderLink = (item: NavItem, extraClass = "") => {
    const Icon = item.icon;
    const active = isDashboardLinkActive(
      pathname,
      item.href,
      `/${locale}/user`,
    );

    return (
      <Link
        key={item.href}
        aria-current={active ? "page" : undefined}
        title={item.label}
        href={item.href}
        className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors lg:gap-3 lg:px-4 lg:py-3 ${extraClass} ${
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-primary"
        }`}
      >
        <Icon aria-hidden className="h-4 w-4 shrink-0" />
        <span className="font-semibold">{item.label}</span>
        <DashboardLinkStatus />
      </Link>
    );
  };

  return (
    <aside className="min-w-0 w-full shrink-0 rounded-2xl border border-border/25 bg-card p-3 lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-4">
      <div className="mb-1 hidden px-3 py-2 lg:mb-4 lg:block">
        <h2 className="text-lg font-bold text-primary">
          FYA (Find Your Animal)
        </h2>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>
      <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground lg:block">
        {copy.navLabel}
      </p>
      <nav
        aria-label={copy.navLabel}
        className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
      >
        {items.map((item) => renderLink(item))}
        {accountItems.map((item) => renderLink(item, "lg:hidden"))}
      </nav>
      <p className="mt-4 hidden border-t border-border/40 px-3 pt-4 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground lg:block">
        {copy.accountLabel}
      </p>
      <nav
        aria-label={copy.accountLabel}
        className="mt-2 hidden flex-col gap-1 lg:flex"
      >
        {accountItems.map((item) => renderLink(item))}
        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut aria-hidden className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{copy.links.logout}</span>
          </button>
        </form>
      </nav>
    </aside>
  );
}
