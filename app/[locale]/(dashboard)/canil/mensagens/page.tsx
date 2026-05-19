import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import {
  getApplicationAnswersForConversation,
  getConversationsForCanil,
  getMessagesByConversationId,
  mapConversationListItem,
} from "@/lib/adoption/db";
import { ChatThread } from "@/components/chat-thread";
import { ToastFeedback } from "@/components/toast-feedback";
import { AdoptionAnswers } from "@/components/adoption-answers";

type CanilMessagesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string; q?: string; success?: string; error?: string }>;
};

export default async function CanilMessagesPage({ params, searchParams }: CanilMessagesPageProps) {
  const { locale } = await params;
  const { conversation: selectedConversationId, q, success, error } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/mensagens`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil?error=no_shelter`);
  }

  const conversationRows = await getConversationsForCanil(supabase, shelter.id);
  const conversations = conversationRows.map((row) => mapConversationListItem(row, locale));
  const visibleConversations = query
    ? conversations.filter((conversation) =>
        [conversation.canilName, conversation.animalName, conversation.applicantName].some((value) =>
          value.toLowerCase().includes(query),
        ),
      )
    : conversations;
  const activeConversation = selectedConversationId
    ? conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0] ?? null
    : conversations[0] ?? null;
  const messages = activeConversation ? await getMessagesByConversationId(supabase, activeConversation.id) : [];
  const application = activeConversation
    ? await getApplicationAnswersForConversation(supabase, {
        pedidoId: activeConversation.pedidoId,
        animalId: activeConversation.animalId,
        applicantId: activeConversation.applicantId,
      })
    : null;

  const copy =
    locale === "pt"
      ? {
          title: "Mensagens",
          searchPlaceholder: "Procurar conversas...",
          noConversations: "Sem conversas no momento.",
          inputPlaceholder: "Escreve a tua mensagem...",
          send: "Enviar",
          adopterInfo: "Sobre o adotante",
          profileVerified: "Perfil verificado",
          reminder: "Lembrete",
          success: "Mensagem enviada.",
          errors: {
            invalid_message: "Mensagem invalida.",
            send_failed: "Nao foi possivel enviar a mensagem.",
          },
        }
      : {
          title: "Messages",
          searchPlaceholder: "Search conversations...",
          noConversations: "No conversations yet.",
          inputPlaceholder: "Write your message...",
          send: "Send",
          adopterInfo: "About the adopter",
          profileVerified: "Verified profile",
          reminder: "Reminder",
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
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
      </header>
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article
          className={`rounded-2xl border border-border/20 bg-card p-4 xl:col-span-4 xl:block ${
            selectedConversationId ? "hidden" : "block"
          }`}
        >
          <form method="get" className="mb-4">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder={copy.searchPlaceholder}
              className="h-11 w-full rounded-lg border border-border/40 bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
          <div className="space-y-1.5">
            {visibleConversations.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">{copy.noConversations}</p>
            ) : (
              visibleConversations.map((conversation) => (
                <a
                  key={conversation.id}
                  href={`/${locale}/canil/mensagens?conversation=${conversation.id}`}
                  className={`block w-full rounded-lg px-4 py-3 text-left transition-colors ${
                    activeConversation?.id === conversation.id ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{conversation.applicantName}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
                        new Date(conversation.updatedAt),
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary">{conversation.animalName}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.canilName}</p>
                </a>
              ))
            )}
          </div>
        </article>

        <article
          className={`flex-col rounded-2xl border border-border/20 bg-card p-4 sm:p-6 xl:col-span-5 xl:flex ${
            selectedConversationId ? "flex" : "hidden"
          }`}
        >
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-border/20 pb-4">
                <Link
                  href={`/${locale}/canil/mensagens`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground xl:hidden"
                  aria-label={copy.searchPlaceholder}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{activeConversation.animalName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {locale === "pt" ? "Conversa com" : "Chat with"} {activeConversation.applicantName}
                  </p>
                </div>
              </div>

              <ChatThread
                key={activeConversation.id}
                conversationId={activeConversation.id}
                currentUserId={user.id}
                currentUserInitial={(activeConversation.canilName || user.email || "?").charAt(0).toUpperCase()}
                otherPartyInitial={(activeConversation.applicantName || "?").charAt(0).toUpperCase()}
                audience="canil"
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

        <article
          className={`rounded-2xl border border-border/20 bg-card p-6 xl:col-span-3 xl:block ${
            selectedConversationId ? "block" : "hidden"
          }`}
        >
          <h2 className="text-lg font-bold">{activeConversation?.applicantName ?? "-"}</h2>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy.adopterInfo}</p>
          {activeConversation ? (
            <div className="mt-3 space-y-3">
              {application?.mensagemInicial && (
                <p className="rounded-xl bg-muted px-3 py-2 text-sm italic text-muted-foreground">
                  {application.mensagemInicial}
                </p>
              )}
              <AdoptionAnswers answers={application?.respostas ?? null} locale={locale} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{copy.noConversations}</p>
          )}

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy.reminder}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "pt"
              ? "Confirmar compatibilidade com outros animais durante a visita presencial."
              : "Confirm compatibility with other pets during the in-person visit."}
          </p>
        </article>
      </section>
    </main>
  );
}
