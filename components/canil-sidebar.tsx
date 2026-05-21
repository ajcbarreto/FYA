"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, PawPrint, FileText, MessageCircle, Settings, Building2, Star } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type CanilSidebarProps = {
  locale: Locale;
  pendingRequestsCount?: number;
  pendingReviewsCount?: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
};

export function CanilSidebar({ locale, pendingRequestsCount = 0, pendingReviewsCount = 0 }: CanilSidebarProps) {
  const pathname = usePathname();
  const t = getDictionary(locale).sidebar;

  const items: NavItem[] = [
    { href: `/${locale}/canil`, label: t.dashboard, icon: Home },
    { href: `/${locale}/canil/perfil`, label: t.shelterPage, icon: Building2 },
    { href: `/${locale}/canil/animais`, label: t.pets, icon: PawPrint },
    {
      href: `/${locale}/canil/pedidos`,
      label: t.adoptionRequests,
      icon: FileText,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { href: `/${locale}/canil/mensagens`, label: t.messages, icon: MessageCircle },
    {
      href: `/${locale}/canil/avaliacoes`,
      label: t.reviews,
      icon: Star,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    { href: `/${locale}/canil/configuracoes`, label: t.settings, icon: Settings },
  ];

  return (
    <aside className="w-full rounded-2xl border border-border/25 bg-card p-3 lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-4">
      <div className="mb-1 hidden px-3 py-2 lg:mb-4 lg:block">
        <h2 className="text-lg font-bold text-primary">FYA (Found Your Animal)</h2>
        <p className="text-xs text-muted-foreground">{t.canilSubtitle}</p>
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
              {item.badge !== undefined && (
                <span
                  className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
