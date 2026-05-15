import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getConversationsForUser, getMessagesByConversationId, mapConversationListItem } from "@/lib/adoption/db";
import { ChatThread } from "@/components/chat-thread";
import { ToastFeedback } from "@/components/toast-feedback";

type UserMessagesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string; success?: string; error?: string }>;
};

export default async function UserMessagesPage({ params, searchParams }: UserMessagesPageProps) {
  const { locale } = await params;
  const { conversation: selectedConversationId, success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/mensagens`);
  }

  const conversationRows = await getConversationsForUser(supabase, user.id);
  const conversations = conversationRows.map((row) => mapConversationListItem(row, locale));
  const activeConversation = selectedConversationId
    ? conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0] ?? null
    : conversations[0] ?? null;
  const messages = activeConversation ? await getMessagesByConversationId(supabase, activeConversation.id) : [];

  const copy =
    locale === "pt"
      ? {
          title: "Mensagens com Canis",
          searchPlaceholder: "Pesquisar conversa...",
          noConversations: "Sem conversas ainda.",
          inputPlaceholder: "Escreve a tua mensagem...",
          send: "Enviar",
          withShelter: "Conversa com",
          success: "Mensagem enviada.",
          errors: {
            invalid_message: "Mensagem invalida.",
            send_failed: "Nao foi possivel enviar a mensagem.",
          },
        }
      : {
          title: "Messages with Shelters",
          searchPlaceholder: "Search conversation...",
          noConversations: "No conversations yet.",
          inputPlaceholder: "Write your message...",
          send: "Send",
          withShelter: "Chat with",
          success: "Message sent.",
          errors: {
            invalid_message: "Invalid message.",
            send_failed: "Could not send message.",
          },
        };

  const feedback =
    success === "message_sent"
      ? copy.success
      : error && copy.errors[error as keyof typeof copy.errors]
        ? copy.errors[error as keyof typeof copy.errors]
        : null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
      </header>
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-3xl border border-border/20 bg-card p-4 xl:col-span-4">
          <div className="mb-4 px-2">
            <input
              type="search"
              placeholder={copy.searchPlaceholder}
              className="h-11 w-full rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">{copy.noConversations}</p>
            ) : (
              conversations.map((conversation) => (
                <a
                  key={conversation.id}
                  href={`/${locale}/user/mensagens?conversation=${conversation.id}`}
                  className={`block w-full rounded-2xl px-4 py-3 text-left ${
                    activeConversation?.id === conversation.id ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{conversation.canilName}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
                        new Date(conversation.updatedAt),
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary">{conversation.animalName}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.applicantName}</p>
                </a>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-border/20 bg-card p-6 xl:col-span-8">
          {activeConversation ? (
            <>
              <div className="border-b border-border/20 pb-4">
                <p className="text-lg font-bold">{activeConversation.animalName}</p>
                <p className="text-sm text-muted-foreground">
                  {copy.withShelter} {activeConversation.canilName}
                </p>
              </div>
              <ChatThread
                key={activeConversation.id}
                conversationId={activeConversation.id}
                currentUserId={user.id}
                audience="user"
                locale={locale}
                initialMessages={messages.map((message) => ({
                  id: message.id,
                  conversa_id: message.conversa_id,
                  sender_profile_id: message.sender_profile_id,
                  conteudo: message.conteudo,
                  created_at: message.created_at,
                }))}
                copy={{
                  empty: copy.noConversations,
                  inputPlaceholder: copy.inputPlaceholder,
                  send: copy.send,
                }}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{copy.noConversations}</p>
          )}
        </article>
      </section>
    </main>
  );
}
