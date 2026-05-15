import { notFound, redirect } from "next/navigation";
import { Bell, BellOff, Check, FileText, MessageCircle } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { listNotifications, localizeNotification } from "@/lib/notifications/db";
import { markAllNotificationsRead, openNotification } from "@/app/notifications/actions";

type NotificationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/notificacoes`);
  }

  const notifications = await listNotifications(supabase, user.id);
  const hasUnread = notifications.some((notification) => !notification.lida);
  const copy =
    locale === "pt"
      ? {
          title: "Notificacoes",
          subtitle: "Atualizacoes dos teus pedidos e conversas.",
          markAll: "Marcar todas como lidas",
          empty: "Sem notificacoes por agora.",
          open: "Abrir",
        }
      : {
          title: "Notifications",
          subtitle: "Updates from your requests and conversations.",
          markAll: "Mark all as read",
          empty: "No notifications yet.",
          open: "Open",
        };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-10 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary"
            >
              <Check className="h-4 w-4" />
              {copy.markAll}
            </button>
          </form>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-border/30 bg-card p-10 text-center">
          <BellOff className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => {
            const { title, body } = localizeNotification(notification, locale);
            const Icon = notification.tipo === "nova_mensagem" ? MessageCircle : FileText;
            return (
              <li
                key={notification.id}
                className={`rounded-2xl border p-4 ${
                  notification.lida ? "border-border/20 bg-card" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      notification.lida ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{title}</p>
                      {!notification.lida && <Bell className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {new Intl.DateTimeFormat(locale, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(notification.created_at))}
                    </p>
                  </div>
                  {notification.link && (
                    <form action={openNotification}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <input type="hidden" name="link" value={notification.link} />
                      <button
                        type="submit"
                        className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                      >
                        {copy.open}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
