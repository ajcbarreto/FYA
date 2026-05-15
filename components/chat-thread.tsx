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
  audience: "user" | "canil";
  locale: string;
  initialMessages: ChatMessage[];
  copy: {
    empty: string;
    inputPlaceholder: string;
    send: string;
  };
};

export function ChatThread({
  conversationId,
  currentUserId,
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
    <>
      <div ref={listRef} className="max-h-[420px] space-y-4 overflow-y-auto py-6 pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_profile_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isMine ? "ml-auto rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                }`}
              >
                <p>{message.conteudo}</p>
                <p className={`mt-1 text-[10px] ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
                    new Date(message.created_at),
                  )}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form
        action={sendAdoptionMessage}
        className="flex items-center gap-2 rounded-full bg-muted px-3 py-2"
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
          className="h-9 flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          {copy.send}
        </button>
      </form>
    </>
  );
}
