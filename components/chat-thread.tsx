"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowUp, Check, LoaderCircle, RefreshCw } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import { sendAdoptionMessage } from "@/app/adoption/actions";
export type ChatMessage = {
  id: string;
  conversa_id: string;
  sender_profile_id: string;
  conteudo: string;
  created_at: string;
};
function merge(a: ChatMessage[], b: ChatMessage[]) {
  return Array.from(new Map([...a, ...b].map((m) => [m.id, m])).values()).sort(
    (a, b) =>
      a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
  );
}
const fields = "id,conversa_id,sender_profile_id,conteudo,created_at";
export function ChatThread({
  conversationId,
  currentUserId,
  locale,
  initialMessages,
  copy,
}: {
  conversationId: string;
  currentUserId: string;
  currentUserInitial: string;
  otherPartyInitial: string;
  audience: "user" | "canil";
  locale: string;
  initialMessages: ChatMessage[];
  copy: { empty: string; inputPlaceholder: string; send: string };
}) {
  const pt = locale === "pt";
  const [received, setReceived] = useState<ChatMessage[]>([]);
  const messages = useMemo(
    () => merge(initialMessages, received),
    [initialMessages, received],
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [older, setOlder] = useState(initialMessages.length === 50);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pending, startTransition] = useTransition();
  const retry = useRef<{ id: string; text: string } | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const initialCursor = useRef(
    initialMessages[0]?.created_at ?? new Date().toISOString(),
  );
  useEffect(() => {
    let cancelled = false;
    let recovering = false;
    const recover = async () => {
      if (recovering) return;
      recovering = true;
      try {
        let offset = 0;
        while (!cancelled) {
          const { data, error } = await supabase
            .from("mensagens_adocao")
            .select(fields)
            .eq("conversa_id", conversationId)
            .gte("created_at", initialCursor.current)
            .order("created_at")
            .order("id")
            .range(offset, offset + 99);
          if (error) {
            setConnected(false);
            break;
          }
          if (!cancelled)
            setReceived((current) => merge(current, data as ChatMessage[]));
          if (data.length < 100) break;
          offset += 100;
        }
      } finally {
        recovering = false;
      }
    };
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens_adocao",
          filter: `conversa_id=eq.${conversationId}`,
        },
        (payload) =>
          setReceived((current) =>
            merge(current, [payload.new as ChatMessage]),
          ),
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") void recover();
      });
    const onFocus = () => {
      if (document.visibilityState === "visible") void recover();
    };
    window.addEventListener("online", recover);
    document.addEventListener("visibilitychange", onFocus);
    // Keep a short safety poll alongside Realtime. It covers local stacks,
    // suspended tabs and proxies that silently drop websocket events.
    const interval = setInterval(onFocus, 3000);
    void recover();
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("online", recover);
      document.removeEventListener("visibilitychange", onFocus);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);
  useEffect(() => {
    if (nearBottom.current)
      list.current?.scrollTo({
        top: list.current.scrollHeight,
        behavior: "instant",
      });
  }, [messages.length]);
  async function loadOlder() {
    const first = messages[0];
    if (!first) return;
    setLoadingOlder(true);
    const height = list.current?.scrollHeight ?? 0;
    const { data, error } = await supabase
      .from("mensagens_adocao")
      .select(fields)
      .eq("conversa_id", conversationId)
      .or(
        `created_at.lt.${first.created_at},and(created_at.eq.${first.created_at},id.lt.${first.id})`,
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(50);
    setLoadingOlder(false);
    if (error) {
      setError(
        pt
          ? "Não foi possível carregar o histórico."
          : "Could not load history.",
      );
      return;
    }
    nearBottom.current = false;
    setReceived((current) => merge(current, data as ChatMessage[]));
    setOlder(data.length === 50);
    requestAnimationFrame(() => {
      if (list.current)
        list.current.scrollTop += list.current.scrollHeight - height;
    });
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p
        role="status"
        className="flex items-center gap-2 py-3 text-[11px] text-muted-foreground"
      >
        <span
          className={`size-1.5 rounded-full ${connected ? "bg-secondary" : "bg-accent"}`}
        />
        {connected
          ? pt
            ? "Ligado · mensagens em tempo real"
            : "Connected · live messages"
          : pt
            ? "A restabelecer ligação · atualização automática"
            : "Reconnecting · automatic refresh"}
      </p>
      <div
        ref={list}
        role="log"
        aria-label={pt ? "Mensagens" : "Messages"}
        aria-live="polite"
        onScroll={() => {
          const el = list.current;
          if (el)
            nearBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        }}
        className="flex max-h-[55vh] min-h-[300px] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-muted/50 p-4"
      >
        {older && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="mx-auto flex items-center gap-2 py-2 text-xs font-semibold"
          >
            {loadingOlder && <LoaderCircle className="size-3 animate-spin" />}
            {pt ? "Mensagens anteriores" : "Earlier messages"}
          </button>
        )}
        {!messages.length && (
          <p className="m-auto text-sm text-muted-foreground">{copy.empty}</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.sender_profile_id === currentUserId ? "self-end rounded-br-sm bg-primary text-white" : "self-start rounded-bl-sm border border-border/50 bg-card"}`}
          >
            <p className="whitespace-pre-wrap break-words">
              {message.conteudo}
            </p>
            <p className="mt-1.5 flex items-center justify-end gap-1 text-[10px] opacity-65">
              <time dateTime={message.created_at}>
                {new Intl.DateTimeFormat(locale, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.created_at))}
              </time>
              {message.sender_profile_id === currentUserId && (
                <Check
                  aria-label={pt ? "Enviada" : "Sent"}
                  className="size-3"
                />
              )}
            </p>
          </div>
        ))}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-2 text-xs text-destructive"
        >
          <RefreshCw className="size-3" />
          {error}
        </p>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim() || pending) return;
          setError("");
          const text = draft.trim();
          const id =
            retry.current?.text === text
              ? retry.current.id
              : crypto.randomUUID();
          retry.current = { id, text };
          startTransition(async () => {
            try {
              const result = await sendAdoptionMessage(
                conversationId,
                id,
                text,
              );
              if (!result.message) throw new Error();
              nearBottom.current = true;
              setReceived((current) =>
                merge(current, [result.message as ChatMessage]),
              );
              setDraft("");
              retry.current = null;
            } catch {
              setError(
                pt
                  ? "Mensagem não enviada. O texto foi mantido; tenta enviar novamente."
                  : "Message not sent. Your text was kept; please try again.",
              );
            }
          });
        }}
        className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">{copy.inputPlaceholder}</span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={copy.inputPlaceholder}
            required
            maxLength={4000}
            rows={2}
            disabled={pending}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label={copy.send}
          className="button-primary min-h-11 px-3.5"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
