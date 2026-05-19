"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, PawPrint, FileText, MessageCircle, Settings, Building2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

type CanilSidebarProps = {
  locale: Locale;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function CanilSidebar({ locale }: CanilSidebarProps) {
  const pathname = usePathname();
  const copy =
    locale === "pt"
      ? {
          shelterAdmin: "Admin do Canil",
          links: {
            dashboard: "Dashboard",
            shelterPage: "Pagina do Canil",
            pets: "Meus Pets",
            requests: "Pedidos de Adocao",
            messages: "Mensagens",
            settings: "Configuracoes",
          },
        }
      : {
          shelterAdmin: "Shelter Admin",
          links: {
            dashboard: "Dashboard",
            shelterPage: "Shelter Page",
            pets: "My Pets",
            requests: "Adoption Requests",
            messages: "Messages",
            settings: "Settings",
          },
        };

  const items: NavItem[] = [
    { href: `/${locale}/canil`, label: copy.links.dashboard, icon: Home },
    { href: `/${locale}/canil/perfil`, label: copy.links.shelterPage, icon: Building2 },
    { href: `/${locale}/canil/animais`, label: copy.links.pets, icon: PawPrint },
    { href: `/${locale}/canil/pedidos`, label: copy.links.requests, icon: FileText },
    { href: `/${locale}/canil/mensagens`, label: copy.links.messages, icon: MessageCircle },
    { href: `/${locale}/canil/configuracoes`, label: copy.links.settings, icon: Settings },
  ];

  return (
    <aside className="w-full rounded-2xl border border-border/25 bg-card p-3 lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-4">
      <div className="mb-1 hidden px-3 py-2 lg:mb-4 lg:block">
        <h2 className="text-lg font-bold text-primary">FYA (Found Your Animal)</h2>
        <p className="text-xs text-muted-foreground">{copy.shelterAdmin}</p>
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
