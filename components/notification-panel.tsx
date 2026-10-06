"use client";
import { Dialog } from "radix-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type CSSProperties } from "react";
import { Bell, BellOff, Check, LoaderCircle, X } from "lucide-react";
import {
  loadNotificationPanel,
  readNotificationPanel,
} from "@/app/notifications/actions";
import {
  localizeNotification,
  type NotificationRow,
} from "@/lib/notifications/db";
export function NotificationPanel({
  locale,
  label,
  unread,
  onCount,
}: {
  locale: string;
  label: string;
  unread: number;
  onCount: (n: number) => void;
}) {
  const pt = locale === "pt",
    router = useRouter(),
    trigger = useRef<HTMLButtonElement>(null),
    request = useRef(0);
  const [open, setOpen] = useState(false),
    [items, setItems] = useState<NotificationRow[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [position, setPosition] = useState({ top: 72, right: 16 });
  async function load() {
    const sequence = ++request.current;
    setLoading(true);
    setError(false);
    try {
      const result = await loadNotificationPanel();
      if (sequence !== request.current) return;
      if (!result.ok) {
        setError(true);
        return;
      }
      setItems(result.items);
      onCount(result.unread);
    } catch {
      if (sequence === request.current) setError(true);
    } finally {
      if (sequence === request.current) setLoading(false);
    }
  }
  function changeOpen(value: boolean) {
    setOpen(value);
    if (value) {
      const box = trigger.current?.getBoundingClientRect();
      if (box)
        setPosition({
          top: box.bottom + 8,
          right: Math.max(16, window.innerWidth - box.right),
        });
      void load();
    } else {
      ++request.current;
      setLoading(false);
    }
  }
  async function mark(id?: string) {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const result = await readNotificationPanel(locale, id);
      if (!result.ok) {
        setError(true);
        return;
      }
      if (id && result.target) {
        changeOpen(false);
        router.push(result.target);
        router.refresh();
        onCount(
          Math.max(0, unread - (items.find((i) => i.id === id)?.lida ? 0 : 1)),
        );
      } else {
        await load();
        router.refresh();
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          aria-label={label}
          className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          <span className="sr-only">
            {unread} {pt ? "não lidas" : "unread"}
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/30 sm:bg-transparent" />
        <Dialog.Content
          style={
            {
              "--notification-top": `${position.top}px`,
              "--notification-right": `${position.right}px`,
            } as CSSProperties
          }
          className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[85dvh] flex-col rounded-t-3xl border bg-card shadow-2xl outline-none sm:inset-x-auto sm:bottom-auto sm:right-[var(--notification-right)] sm:top-[var(--notification-top)] sm:max-h-[min(75dvh,640px)] sm:w-[min(400px,calc(100vw-32px))] sm:rounded-2xl"
        >
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
            <Dialog.Title className="text-lg font-bold">
              {pt ? "Notificações" : "Notifications"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted"
                aria-label={pt ? "Fechar notificações" : "Close notifications"}
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            {pt
              ? "As dez notificações mais recentes da tua conta."
              : "Your ten most recent notifications."}
          </Dialog.Description>
          <div
            className="min-h-24 overflow-y-auto overscroll-contain p-3"
            aria-busy={loading || busy}
          >
            {loading ? (
              <p
                role="status"
                className="flex items-center justify-center gap-2 p-6"
              >
                <LoaderCircle className="size-5 animate-spin" />
                {pt ? "A carregar…" : "Loading…"}
              </p>
            ) : (
              <>
                {error && (
                  <div role="alert" className="space-y-2 rounded-xl border p-4">
                    <p>
                      {pt
                        ? "Não foi possível atualizar as notificações."
                        : "Could not update notifications."}
                    </p>
                    <button
                      className="min-h-11 underline"
                      type="button"
                      onClick={() => void load()}
                      disabled={busy}
                    >
                      {pt ? "Tentar novamente" : "Try again"}
                    </button>
                  </div>
                )}
                {!error && !items.length && (
                  <div className="space-y-3 p-6 text-center text-muted-foreground">
                    <BellOff aria-hidden="true" className="mx-auto size-8" />
                    <p>
                      {pt
                        ? "Sem notificações por agora."
                        : "No notifications yet."}
                    </p>
                  </div>
                )}
                <ul className="space-y-2">
                  {items.map((n) => {
                    const text = localizeNotification(n, locale);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void mark(n.id)}
                          className={`w-full rounded-xl border p-4 text-left transition-colors hover:border-primary disabled:opacity-60 ${n.lida ? "bg-card" : "border-primary/20 bg-primary/5"}`}
                        >
                          <span className="flex items-center gap-2 font-semibold">
                            {!n.lida && (
                              <span className="size-2 shrink-0 rounded-full bg-primary" />
                            )}
                            {text.title}
                            {!n.lida && (
                              <span className="sr-only">
                                {" "}
                                — {pt ? "Não lida" : "Unread"}
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {text.body}
                          </span>
                          <time
                            dateTime={n.created_at}
                            className="mt-2 block text-xs text-muted-foreground"
                          >
                            {new Date(n.created_at).toLocaleString(locale, {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {unread > 0 && (
              <button
                type="button"
                disabled={busy || loading}
                onClick={() => void mark()}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold disabled:opacity-50"
              >
                <Check className="size-4" />
                {pt ? "Marcar todas como lidas" : "Mark all as read"}
              </button>
            )}
            <Link
              onClick={() => changeOpen(false)}
              href={`/${locale}/notificacoes`}
              className="inline-flex min-h-11 items-center text-sm font-semibold underline"
            >
              {pt ? "Ver todas" : "View all"}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
