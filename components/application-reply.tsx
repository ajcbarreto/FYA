"use client";
import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { replyToApplication } from "@/app/records/request-actions";
import { fillReplyTemplate } from "@/lib/records/request-queue";
export function ApplicationReply({
  locale,
  requestId,
  messageId,
  templates,
  values,
  filters,
}: {
  locale: string;
  requestId: string;
  messageId: string;
  templates: { id: string; title: string; body: string }[];
  values: { animal: string; adotante: string; canil: string };
  filters: string;
}) {
  const [body, setBody] = useState(""),
    [selected, setSelected] = useState("");
  const pt = locale === "pt";
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-semibold">
        {pt ? "Responder ao adotante" : "Reply to applicant"}
      </summary>
      <form action={replyToApplication} className="mt-3 space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="applicationId" value={requestId} />
        <input type="hidden" name="messageId" value={messageId} />
        <input type="hidden" name="filters" value={filters} />
        <label className="block text-sm">
          {pt ? "Resposta modelo" : "Reply template"}
          <select
            className="block w-full rounded-lg border bg-background p-2"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">—</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="text-sm underline"
          disabled={!selected}
          onClick={() => {
            const t = templates.find((t) => t.id === selected);
            if (t)
              setBody((previous) =>
                [previous, fillReplyTemplate(t.body, values)]
                  .filter(Boolean)
                  .join("\n\n"),
              );
          }}
        >
          {pt ? "Inserir modelo no texto" : "Insert template into text"}
        </button>
        <label className="block text-sm">
          {pt ? "Mensagem para o adotante" : "Message to applicant"}
          <textarea
            name="reply"
            required
            maxLength={4000}
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="block w-full rounded-lg border bg-background p-2"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          {pt
            ? "Revê o texto antes de enviar. A mensagem fica na conversa; o estado da candidatura mantém-se."
            : "Review before sending. The message is added to the conversation; the application status stays unchanged."}
        </p>
        <SubmitButton
          disabled={body.trim().length === 0 || body.length > 4000}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {pt ? "Enviar mensagem" : "Send message"}
        </SubmitButton>
      </form>
    </details>
  );
}
