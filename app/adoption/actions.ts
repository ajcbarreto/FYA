"use server";

import { after } from "next/server";
import { deliverEmailOutbox } from "@/lib/email/outbox";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCurrentProfileRole } from "@/lib/adoption/db";
import { parseApplicationAnswers } from "@/lib/adoption/application-form";

const requestStatuses = [
  "pendente",
  "entrevista",
  "aprovado",
  "rejeitado",
  "concluido",
] as const;

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function submitAdoptionRequest(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const petId = String(formData.get("petId") ?? "");
  let answers;
  try {
    answers = parseApplicationAnswers(formData);
  } catch {
    return { error: "invalid_application" };
  }
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return { error: "invalid_pet" };
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "login" };
  const role = await getCurrentProfileRole(supabase, user.id);
  if (role !== "user") return { error: "only_users_can_apply" };
  const { data, error } = await supabase.rpc("submit_adoption", {
    p_animal: petId,
    p_answers: answers,
    p_message: answers.message ?? "",
  });
  if (error || !data)
    return {
      error: error?.code === "23514" ? "pet_unavailable" : "request_failed",
    };
  after(async () => {
    try {
      await deliverEmailOutbox();
    } catch {
      console.error("Email delivery deferred to scheduled retry");
    }
  });
  return { conversationId: String(data), locale };
}

export async function updateRequestStatus(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !requestId ||
    !requestStatuses.includes(status as (typeof requestStatuses)[number])
  ) {
    redirect(`/${locale}/canil/pedidos?error=invalid_request`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/pedidos`);
  }

  const role = await getCurrentProfileRole(supabase, user.id);
  if (role !== "canil" && role !== "admin") {
    redirect(`/${locale}/canil/pedidos?error=unauthorized`);
  }

  const { error } = await supabase.rpc("transition_adoption", {
    p_request: requestId,
    p_status: status,
    p_notes: notes,
  });
  if (error)
    redirect(
      `/${locale}/canil/pedidos?error=${error.code === "23514" ? "invalid_request" : "save_failed"}`,
    );
  after(async () => {
    try {
      await deliverEmailOutbox();
    } catch {
      console.error("Email delivery deferred to scheduled retry");
    }
  });
  redirect(`/${locale}/canil/pedidos?success=updated`);
}

export async function sendAdoptionMessage(
  conversationId: string,
  messageId: string,
  text: string,
) {
  const message = text.trim();
  if (
    ![conversationId, messageId].every((id) => /^[0-9a-f-]{36}$/i.test(id)) ||
    !message ||
    message.length > 4000
  )
    return { error: "invalid_message" };
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "login" };
  const payload = {
    id: messageId,
    conversa_id: conversationId,
    sender_profile_id: user.id,
    conteudo: message,
  };
  const fields = "id,conversa_id,sender_profile_id,conteudo,created_at";
  const { data, error } = await supabase
    .from("mensagens_adocao")
    .insert(payload)
    .select(fields)
    .single();
  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("mensagens_adocao")
      .select(fields)
      .eq("id", messageId)
      .eq("sender_profile_id", user.id)
      .eq("conversa_id", conversationId)
      .single();
    if (existing && existing.conteudo === message) return { message: existing };
  }
  return error || !data ? { error: "send_failed" } : { message: data };
}
