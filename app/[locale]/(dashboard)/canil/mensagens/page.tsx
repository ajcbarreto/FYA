import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import {
  getApplicationAnswersForConversation,
  getConversationsForCanil,
  getLatestMessagesByConversationIds,
  getMessagesByConversationId,
  mapConversationListItem,
} from "@/lib/adoption/db";
import { ChatThread } from "@/components/chat-thread";
import { ToastFeedback } from "@/components/toast-feedback";
import { AdoptionAnswers } from "@/components/adoption-answers";
import { PageHeader } from "@/components/page-header";
import { formatRelativeTime } from "@/lib/format/time";

type CanilMessagesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string; q?: string; success?: string; error?: string }>;
};

function initialFor(name: string) {
  return (name.trim().charAt(0) || "?").toUpperCase();
}

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
  const latestByConversation = await getLatestMessagesByConversationIds(
    supabase,
    conversations.map((conversation) => conversation.id),
  );
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

  const copy = getDictionary(locale).canilMessages;
  const feedback =
    success === "message_sent"
      ? copy.success
      : error && copy.errorMessages[error as keyof typeof copy.errorMessages]
        ? copy.errorMessages[error as keyof typeof copy.errorMessages]
        : null;

  return (
    <main className="space-y-6">
      <PageHeader title={copy.title} />
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article
          className={`rounded-2xl border border-border/25 bg-card p-3 xl:col-span-4 xl:block ${
            selectedConversationId ? "hidden" : "block"
          }`}
        >
          <form method="get" className="mb-3 px-1">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder={copy.searchPlaceholder}
              className="h-10 w-full rounded-lg border border-border/40 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
          <ul className="space-y-1">
            {visibleConversations.length === 0 ? (
              <li className="px-2 py-4 text-sm text-muted-foreground">{copy.noConversations}</li>
            ) : (
              visibleConversations.map((conversation) => {
                const isActive = activeConversation?.id === conversation.id;
                const latest = latestByConversation.get(conversation.id);
                const preview = latest
                  ? `${latest.sender_profile_id === user.id ? `${copy.youPrefix} ` : ""}${latest.conteudo}`
                  : copy.noPreview;
                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/${locale}/canil/mensagens?conversation=${conversation.id}`}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-primary/10" : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {initialFor(conversation.applicantName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{conversation.applicantName}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatRelativeTime(latest?.created_at ?? conversation.updatedAt, locale)}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-primary">{conversation.animalName}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{preview}</span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </article>

        <article
          className={`flex-col rounded-2xl border border-border/25 bg-card p-4 sm:p-6 xl:col-span-5 xl:flex ${
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
                    {copy.chatWith} {activeConversation.applicantName}
                  </p>
                </div>
              </div>

              <ChatThread
                key={activeConversation.id}
                conversationId={activeConversation.id}
                currentUserId={user.id}
                currentUserInitial={(activeConversation.canilName || user.email || "?").charAt(0).toUpperCase()}
                otherPartyInitial={initialFor(activeConversation.applicantName)}
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
          className={`rounded-2xl border border-border/25 bg-card p-6 xl:col-span-3 xl:block ${
            selectedConversationId ? "block" : "hidden"
          }`}
        >
          <h2 className="text-lg font-bold">{activeConversation?.applicantName ?? "-"}</h2>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.adopterInfo}</p>
          {activeConversation ? (
            <div className="mt-3 space-y-3">
              {application?.mensagemInicial && (
                <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm italic text-muted-foreground">
                  {application.mensagemInicial}
                </p>
              )}
              <AdoptionAnswers answers={application?.respostas ?? null} locale={locale} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{copy.noConversations}</p>
          )}

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.reminder}</p>
          <p className="mt-2 text-sm text-muted-foreground">{copy.reminderText}</p>
        </article>
      </section>
    </main>
  );
}
