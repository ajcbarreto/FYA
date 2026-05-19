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
    <aside className="w-full rounded-2xl border border-border/25 bg-card p-3 lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-4">
      <div className="mb-1 hidden px-3 py-2 lg:mb-4 lg:block">
        <h2 className="text-lg font-bold text-primary">FYA (Found Your Animal)</h2>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
