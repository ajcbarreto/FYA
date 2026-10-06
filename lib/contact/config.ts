export const statuses = {
  new: ["Novo", "New"],
  reviewing: ["Em análise", "Under review"],
  negotiating: ["Em negociação", "Negotiating"],
  accepted: ["Aprovado", "Accepted"],
  declined: ["Recusado", "Declined"],
  in_progress: ["Em acompanhamento", "In progress"],
  waiting: ["Aguarda resposta", "Waiting"],
  resolved: ["Resolvido", "Resolved"],
  closed: ["Fechado", "Closed"],
} as const;
export const categories = {
  sponsorship: ["Patrocínio", "Sponsorship"],
  advertising: ["Publicidade", "Advertising"],
  goods: ["Produtos", "Products"],
  services: ["Serviços", "Services"],
  technical: ["Problema técnico", "Technical issue"],
  account: ["Conta e acessos", "Account and access"],
  operations: ["Utilização da FYA", "Using FYA"],
  other: ["Outro assunto", "Other"],
} as const;
export const partnershipCategories = [
  "sponsorship",
  "advertising",
  "goods",
  "services",
  "other",
] as const;
export const helpCategories = [
  "technical",
  "account",
  "operations",
  "other",
] as const;
export const partnershipStatuses = [
  "new",
  "reviewing",
  "negotiating",
  "accepted",
  "declined",
  "closed",
] as const;
export const helpStatuses = [
  "new",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;
export const inputClass =
  "mt-1 block min-h-11 w-full rounded-xl border bg-background p-3 text-base";
export const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50";
export function label(
  values: Record<string, readonly string[]>,
  key: string,
  pt: boolean,
) {
  return values[key]?.[pt ? 0 : 1] ?? key;
}
