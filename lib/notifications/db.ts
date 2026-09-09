import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationRow = {
  id: string;
  user_profile_id: string;
  tipo: "pedido_status" | "favorito" | "canil_favorito";
  referencia: string | null;
  link: string | null;
  lida: boolean;
  created_at: string;
};

export async function getUnreadNotificationsCount(
  supabase: SupabaseClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("notificacoes")
    .select("id", { count: "exact", head: true })
    .eq("user_profile_id", userId)
    .eq("lida", false);

  if (error) {
    console.error(
      "[getUnreadNotificationsCount] Supabase error:",
      error.message,
    );
    return 0;
  }

  return count ?? 0;
}

export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 30,
) {
  const { data, error } = await supabase
    .from("notificacoes")
    .select("id,user_profile_id,tipo,referencia,link,lida,created_at")
    .eq("user_profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error("Unable to load data", { cause: error });

  if (!data) {
    return [];
  }

  return data as NotificationRow[];
}

export function localizeNotification(
  notification: NotificationRow,
  locale: string,
) {
  const isPt = locale === "pt";
  if (notification.tipo === "pedido_status") {
    const statusMap: Record<string, { pt: string; en: string }> = {
      pendente: { pt: "pendente", en: "pending" },
      entrevista: { pt: "entrevista", en: "interview" },
      aprovado: { pt: "aprovado", en: "approved" },
      rejeitado: { pt: "rejeitado", en: "rejected" },
    };
    const status = notification.referencia
      ? (statusMap[notification.referencia]?.[isPt ? "pt" : "en"] ??
        notification.referencia)
      : "";
    return {
      title: isPt ? "Pedido de adopcao atualizado" : "Adoption request updated",
      body: isPt
        ? `O estado do teu pedido mudou para "${status}".`
        : `Your request status changed to "${status}".`,
    };
  }

  return {
    title: isPt ? "Nova atividade" : "New activity",
    body: isPt
      ? "Tens uma nova atualização na tua conta."
      : "You have a new account update.",
  };
}
