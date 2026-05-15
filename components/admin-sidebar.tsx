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
    <aside className="sticky top-24 h-fit w-full rounded-3xl border border-border/25 bg-card p-4 shadow-sm lg:w-72">
      <div className="mb-4 px-3 py-2">
        <h2 className="text-lg font-bold text-primary">FYA (Found Your Animal)</h2>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>
      <nav className="space-y-1">
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
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm transition-colors ${
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
