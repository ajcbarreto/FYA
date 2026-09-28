"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { Dialog } from "radix-ui";
import { Bell, BellOff, Check, FileText, Heart, X } from "lucide-react";
import { NavigationLink as Link } from "@/components/navigation-link";
import { markNotificationsReadInPlace } from "@/app/notifications/actions";
import type { NotificationRow } from "@/lib/notifications/db";

type PanelNotification = Pick<
  NotificationRow,
  "id" | "tipo" | "link" | "lida" | "created_at"
> & { title: string; body: string };

type PanelState =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; items: PanelNotification[] };

type NotificationsBellProps = {
  locale: string;
  label: string;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
};

const copyByLocale = {
  pt: {
    title: "Notificações",
    markAll: "Marcar todas como lidas",
    viewAll: "Ver todas",
    empty: "Sem notificações por agora.",
    loading: "A carregar notificações…",
    error: "Não foi possível carregar as notificações.",
    retry: "Tentar novamente",
    close: "Fechar",
    unread: "Não lida",
  },
  en: {
    title: "Notifications",
    markAll: "Mark all as read",
    viewAll: "View all",
    empty: "No notifications yet.",
    loading: "Loading notifications…",
    error: "Couldn't load notifications.",
    retry: "Try again",
    close: "Close",
    unread: "Unread",
  },
};

function formatRelative(value: string, locale: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(seconds) >= 7 * 86400) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  }

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }

  return formatter.format(0, "minute");
}

export function NotificationsBell({
  locale,
  label,
  unreadCount,
  onUnreadCountChange,
}: NotificationsBellProps) {
  const copy = locale === "pt" ? copyByLocale.pt : copyByLocale.en;
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const [panel, setPanel] = useState<PanelState>({ status: "idle" });
  const [isMarking, startMarking] = useTransition();

  const load = useCallback(() => {
    setPanel((current) =>
      current.status === "ready" ? current : { status: "loading" },
    );

    fetch(`/api/notifications?locale=${locale}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items: PanelNotification[]; unread: number } | null) => {
        if (!data) {
          setPanel({ status: "error" });
          return;
        }
        setPanel({ status: "ready", items: data.items });
        onUnreadCountChange(data.unread);
      })
      .catch(() => setPanel({ status: "error" }));
  }, [locale, onUnreadCountChange]);

  function handleOpenChange(next: boolean) {
    if (next && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAnchor({
        top: rect.bottom + 8,
        right: Math.max(window.innerWidth - rect.right - 8, 8),
      });
      load();
    }
    setOpen(next);
  }

  function markRead(ids: string[] | "all") {
    setPanel((current) =>
      current.status === "ready"
        ? {
            status: "ready",
            items: current.items.map((item) =>
              ids === "all" || ids.includes(item.id)
                ? { ...item, lida: true }
                : item,
            ),
          }
        : current,
    );
  }

  function handleMarkAll() {
    const previous = panel;
    const previousCount = unreadCount;
    markRead("all");
    onUnreadCountChange(0);

    startMarking(async () => {
      const result = await markNotificationsReadInPlace();
      if (!result.ok) {
        setPanel(previous);
        onUnreadCountChange(previousCount);
        return;
      }
      router.refresh();
    });
  }

  function handleOpenItem(item: PanelNotification) {
    setOpen(false);
    if (item.lida) return;

    markRead([item.id]);
    onUnreadCountChange(Math.max(unreadCount - 1, 0));
    void markNotificationsReadInPlace(item.id);
  }

  const items = panel.status === "ready" ? panel.items : [];
  const hasUnread = unreadCount > 0 || items.some((item) => !item.lida);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        ref={triggerRef}
        aria-label={
          unreadCount > 0 ? `${label} (${unreadCount} ${copy.unread})` : label
        }
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary data-[state=open]:bg-muted data-[state=open]:text-primary"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/35 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:bg-transparent sm:backdrop-blur-none" />
        <Dialog.Content
          aria-describedby={undefined}
          style={
            {
              "--bell-top": `${anchor.top}px`,
              "--bell-right": `${anchor.right}px`,
            } as CSSProperties
          }
          className="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85dvh] flex-col rounded-t-3xl border border-border/40 bg-background pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:bottom-auto sm:right-[var(--bell-right)] sm:top-[var(--bell-top)] sm:max-h-[min(32rem,calc(100dvh-var(--bell-top)-1rem))] sm:w-96 sm:rounded-2xl sm:pb-0 sm:data-[state=open]:slide-in-from-top-2 sm:data-[state=open]:fade-in-0"
        >
          <div
            aria-hidden
            className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted sm:hidden"
          />
          <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-3">
            <Dialog.Title className="text-base font-extrabold">
              {copy.title}
            </Dialog.Title>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={isMarking}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  {copy.markAll}
                </button>
              )}
              <Dialog.Close
                aria-label={copy.close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:hidden"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {(panel.status === "loading" || panel.status === "idle") && (
              <p
                role="status"
                className="px-5 py-10 text-center text-sm text-muted-foreground"
              >
                {copy.loading}
              </p>
            )}

            {panel.status === "error" && (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                <p>{copy.error}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold hover:text-primary"
                >
                  {copy.retry}
                </button>
              </div>
            )}

            {panel.status === "ready" && items.length === 0 && (
              <div className="px-5 py-10 text-center">
                <BellOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{copy.empty}</p>
              </div>
            )}

            {items.length > 0 && (
              <ul className="divide-y divide-border/30">
                {items.map((item) => {
                  const Icon =
                    item.tipo === "favorito" || item.tipo === "canil_favorito"
                      ? Heart
                      : FileText;
                  const href = item.link?.startsWith("/")
                    ? `/${locale}${item.link}`
                    : `/${locale}/notificacoes`;

                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        onClick={() => handleOpenItem(item)}
                        className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/60 ${
                          item.lida ? "" : "bg-primary/5"
                        }`}
                      >
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            item.lida
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm ${item.lida ? "font-semibold" : "font-bold"}`}
                          >
                            {item.title}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                            {item.body}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground/70">
                            {formatRelative(item.created_at, locale)}
                          </span>
                        </span>
                        {!item.lida && (
                          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary">
                            <span className="sr-only">{copy.unread}</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border/40 p-2">
            <Link
              href={`/${locale}/notificacoes`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/10"
            >
              {copy.viewAll}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
