export const queueStatuses = [
  "pendente",
  "entrevista",
  "aprovado",
  "rejeitado",
  "concluido",
] as const;
export type QueueSearch = {
  q?: string;
  status?: string;
  assignee?: string;
  days?: string;
  unanswered?: string;
  order?: string;
  page?: string;
  success?: string;
  error?: string;
};
export function queueFilters(search: QueueSearch) {
  const days = Number(search.days ?? 0);
  return {
    q: (search.q ?? "").trim().slice(0, 160),
    status: queueStatuses.some((s) => s === search.status)
      ? search.status!
      : "",
    assignee:
      search.assignee === "unassigned" ||
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(search.assignee ?? "")
        ? search.assignee!
        : "",
    days:
      Number.isInteger(days) && days >= 0 && days <= 36500 ? String(days) : "0",
    unanswered: search.unanswered === "1" ? "1" : "",
    order: search.order === "newest" ? "newest" : "oldest",
  };
}
export function queueQuery(search: QueueSearch) {
  return new URLSearchParams(
    Object.entries(queueFilters(search)).filter(([, v]) => v !== ""),
  ).toString();
}
export function fillReplyTemplate(
  body: string,
  values: { animal: string; adotante: string; canil: string },
) {
  return body.replace(
    /\{(animal|adotante|canil)\}/g,
    (_, key: keyof typeof values) => values[key],
  );
}
export function defaultReplyTemplates(pt: boolean) {
  return pt
    ? [
        {
          id: "interview",
          title: "Convidar para entrevista",
          body: "Olá {adotante}, obrigado pelo interesse em {animal}. Gostaríamos de combinar uma conversa para conhecer melhor a tua família. Que disponibilidade tens?\nEquipa {canil}",
        },
        {
          id: "information",
          title: "Pedir informação",
          body: "Olá {adotante}, estamos a analisar a candidatura para {animal}. Podes esclarecer a seguinte informação: [indicar informação em falta]?\nEquipa {canil}",
        },
        {
          id: "decision",
          title: "Comunicar decisão",
          body: "Olá {adotante}, concluímos a análise da candidatura para {animal}. A nossa decisão é: [indicar decisão e motivo].\nPróximos passos: [indicar próximos passos].\nEquipa {canil}",
        },
      ]
    : [
        {
          id: "interview",
          title: "Invite to interview",
          body: "Hello {adotante}, thank you for your interest in {animal}. We would like to arrange a conversation to learn more about your family. When are you available?\n{canil} team",
        },
        {
          id: "information",
          title: "Request information",
          body: "Hello {adotante}, we are reviewing your application for {animal}. Could you clarify: [specify missing information]?\n{canil} team",
        },
        {
          id: "decision",
          title: "Communicate decision",
          body: "Hello {adotante}, we have reviewed your application for {animal}. Our decision is: [state decision and reason].\nNext steps: [specify next steps].\n{canil} team",
        },
      ];
}
