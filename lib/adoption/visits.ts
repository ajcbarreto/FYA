import type { SupabaseClient } from "@supabase/supabase-js";

export type VisitStatus = "proposta" | "confirmada" | "cancelada" | "realizada";

export type VisitRow = {
  id: string;
  pedido_id: string;
  canil_id: string;
  applicant_profile_id: string;
  animal_id: string | null;
  scheduled_at: string;
  status: VisitStatus;
  notas: string | null;
  created_at: string;
};

export function localizeVisitStatus(status: VisitStatus, locale: string) {
  const labels: Record<VisitStatus, { pt: string; en: string }> = {
    proposta: { pt: "Proposta", en: "Proposed" },
    confirmada: { pt: "Confirmada", en: "Confirmed" },
    cancelada: { pt: "Cancelada", en: "Cancelled" },
    realizada: { pt: "Realizada", en: "Completed" },
  };
  return labels[status][locale === "pt" ? "pt" : "en"];
}

export function visitStatusClass(status: VisitStatus) {
  if (status === "confirmada") return "bg-secondary/15 text-secondary";
  if (status === "cancelada") return "bg-destructive/10 text-destructive";
  if (status === "realizada") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

export async function getVisitsByPedido(supabase: SupabaseClient, pedidoIds: string[]) {
  const result = new Map<string, VisitRow[]>();
  if (pedidoIds.length === 0) return result;

  const { data, error } = await supabase
    .from("visitas")
    .select("id,pedido_id,canil_id,applicant_profile_id,animal_id,scheduled_at,status,notas,created_at")
    .in("pedido_id", pedidoIds)
    .order("scheduled_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("[getVisitsByPedido] Supabase error:", error.message);
    return result;
  }

  for (const row of data as VisitRow[]) {
    const list = result.get(row.pedido_id) ?? [];
    list.push(row);
    result.set(row.pedido_id, list);
  }
  return result;
}

export function formatVisitDate(scheduledAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(scheduledAt));
}
