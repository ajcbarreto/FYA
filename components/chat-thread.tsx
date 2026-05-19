"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import { sendAdoptionMessage } from "@/app/adoption/actions";

export type ChatMessage = {
  id: string;
  conversa_id: string;
  sender_profile_id: string;
  conteudo: string;
  created_at: string;
};

type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  currentUserInitial: string;
  otherPartyInitial: string;
  audience: "user" | "canil";
  locale: string;
  initialMessages: ChatMessage[];
  copy: {
    empty: string;
    inputPlaceholder: string;
    send: string;
  };
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(iso: string, locale: string) {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(now)) return locale === "pt" ? "Hoje" : "Today";
  if (dayKey(date) === dayKey(yesterday)) return locale === "pt" ? "Ontem" : "Yesterday";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long" }).format(date);
}

export function ChatThread({
  conversationId,
  currentUserId,
  currentUserInitial,
  otherPartyInitial,
  audience,
  locale,
  initialMessages,
  copy,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages);
  const listRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`adoption-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens_adocao",
          filter: `conversa_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((current) => {
            if (current.some((message) => message.id === incoming.id)) return current;
            return [...current, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="flex max-h-[55vh] min-h-[280px] flex-1 flex-col gap-1 overflow-y-auto py-4 pr-1"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          messages.map((message, index) => {
            const isMine = message.sender_profile_id === currentUserId;
            const previous = messages[index - 1];
            const showDay =
              !previous || dayKey(new Date(previous.created_at)) !== dayKey(new Date(message.created_at));
            const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
              new Date(message.created_at),
            );

            return (
              <div key={message.id}>
                {showDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      {dayLabel(message.created_at, locale)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isMine ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {isMine ? currentUserInitial : otherPartyInitial}
                  </span>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.conteudo}</p>
                    <p className={`mt-1 text-[10px] ${isMine ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        action={sendAdoptionMessage}
        className="mt-3 flex items-center gap-2 rounded-lg border border-border/50 bg-background p-1.5"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="audience" value={audience} />
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          type="text"
          name="message"
          placeholder={copy.inputPlaceholder}
          autoComplete="off"
          required
          className="h-9 flex-1 bg-transparent px-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {copy.send}
        </button>
      </form>
    </div>
  );
}
