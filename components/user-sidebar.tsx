"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, FileText, MessageCircle, Search, Settings, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

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
          subtitle: "Area do Adotante",
          links: {
            dashboard: "Dashboard",
            catalog: "Catalogo de Pets",
            favorites: "Favoritos",
            requests: "Meus Pedidos",
            messages: "Mensagens",
            settings: "Configuracoes",
          },
        }
      : {
          subtitle: "Adopter Area",
          links: {
            dashboard: "Dashboard",
            catalog: "Pet Catalog",
            favorites: "Favorites",
            requests: "My Requests",
            messages: "Messages",
            settings: "Settings",
          },
        };

  const items: NavItem[] = [
    { href: `/${locale}/user`, label: copy.links.dashboard, icon: Home },
    { href: `/${locale}/pets`, label: copy.links.catalog, icon: Search },
    { href: `/${locale}/user/favoritos`, label: copy.links.favorites, icon: Heart },
    { href: `/${locale}/user/pedidos`, label: copy.links.requests, icon: FileText },
    { href: `/${locale}/user/mensagens`, label: copy.links.messages, icon: MessageCircle },
    { href: `/${locale}/user/configuracoes`, label: copy.links.settings, icon: Settings },
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
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
