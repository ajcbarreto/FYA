"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { LayoutDashboard, Building2, Users, Settings } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

type AdminSidebarProps = {
  locale: Locale;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const copy =
    locale === "pt"
      ? {
          subtitle: "Administracao",
          links: {
            dashboard: "Visao geral",
            shelters: "Canis",
            users: "Utilizadores",
            settings: "Configuracoes",
          },
        }
      : {
          subtitle: "Administration",
          links: {
            dashboard: "Overview",
            shelters: "Shelters",
            users: "Users",
            settings: "Settings",
          },
        };

  const items: NavItem[] = [
    { href: `/${locale}/admin`, label: copy.links.dashboard, icon: LayoutDashboard },
    { href: `/${locale}/admin/canis`, label: copy.links.shelters, icon: Building2 },
    { href: `/${locale}/admin/utilizadores`, label: copy.links.users, icon: Users },
    { href: `/${locale}/admin/configuracoes`, label: copy.links.settings, icon: Settings },
  ];

  return (
    <aside className="w-full rounded-2xl border border-border/25 bg-card p-3 lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-4">
      <div className="mb-1 hidden px-3 py-2 lg:mb-4 lg:block">
        <h2 className="text-lg font-bold text-primary">FYA (Found Your Animal)</h2>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === `/${locale}/admin`
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors lg:gap-3 lg:px-4 lg:py-3 ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
