"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NotificationsBell } from "@/components/notifications-bell";
import type { UserRole } from "@/lib/supabase/types";

type BadgeCounts = {
  unreadNotifications: number;
  unreadMessages: number;
};

type NavbarBadgeLinksProps = {
  locale: string;
  role: UserRole | null;
  messagesLabel: string;
  notificationsLabel: string;
};

function Badge({
  count,
  variant,
}: {
  count: number;
  variant: "accent" | "primary";
}) {
  if (count <= 0) return null;

  const classes =
    variant === "accent"
      ? "bg-accent text-white"
      : "bg-primary text-primary-foreground";

  return (
    <span
      className={`absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-background ${classes}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function NavbarBadgeLinks({
  locale,
  role,
  messagesLabel,
  notificationsLabel,
}: NavbarBadgeLinksProps) {
  const [counts, setCounts] = useState<BadgeCounts | null>(null);
  const showMessages = role === "user" || role === "canil";

  useEffect(() => {
    let cancelled = false;

    fetch("/api/navbar-badges")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: BadgeCounts | null) => {
        if (!cancelled && data) {
          setCounts(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const setUnreadNotifications = useCallback((count: number) => {
    setCounts((current) => ({
      unreadMessages: current?.unreadMessages ?? 0,
      unreadNotifications: count,
    }));
  }, []);

  const unreadMessages = counts?.unreadMessages ?? 0;
  const unreadNotifications = counts?.unreadNotifications ?? 0;

  return (
    <>
      {showMessages && (
        <Link
          href={`/${locale}/${role === "canil" ? "canil" : "user"}/mensagens`}
          aria-label={messagesLabel}
          className="relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <MessageCircle className="h-5 w-5" />
          <Badge count={unreadMessages} variant="accent" />
        </Link>
      )}

      <NotificationsBell
        locale={locale}
        label={notificationsLabel}
        unreadCount={unreadNotifications}
        onUnreadCountChange={setUnreadNotifications}
      />
    </>
  );
}
