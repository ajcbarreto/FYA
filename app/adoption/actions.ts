"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCurrentProfileRole } from "@/lib/adoption/db";
import { getShelterForUser } from "@/lib/canil/shelter-data";

const requestStatuses = ["pendente", "entrevista", "aprovado", "rejeitado"] as const;

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function submitAdoptionRequest(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const petId = String(formData.get("petId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!petId) {
    redirect(`/${locale}/pets?error=invalid_pet`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/pets/${petId}`);
  }

  const role = await getCurrentProfileRole(supabase, user.id);
  if (role !== "user") {
    redirect(`/${locale}/pets/${petId}?error=only_users_can_apply`);
  }

  const { data: animal } = await supabase.from("animais").select("id,canil_id").eq("id", petId).maybeSingle();
  if (!animal) {
    redirect(`/${locale}/pets/${petId}?error=pet_not_found`);
  }

  const { data: existingRequest } = await supabase
    .from("pedidos_adocao")
    .select("id")
    .eq("animal_id", petId)
    .eq("applicant_profile_id", user.id)
    .in("status", ["pendente", "entrevista"])
    .maybeSingle();

  const requestId = existingRequest?.id ?? crypto.randomUUID();

  const requestPayload = {
    id: requestId,
    animal_id: petId,
    canil_id: animal.canil_id,
    applicant_profile_id: user.id,
    status: "pendente" as const,
    mensagem_inicial: message || null,
  };

  const { error: requestError } = await supabase.from("pedidos_adocao").upsert(requestPayload);
  if (requestError) {
    redirect(`/${locale}/pets/${petId}?error=request_failed`);
  }

  const { data: existingConversation } = await supabase
    .from("conversas_adocao")
    .select("id")
    .eq("canil_id", animal.canil_id)
    .eq("applicant_profile_id", user.id)
    .eq("animal_id", petId)
    .maybeSingle();

  const conversationId = existingConversation?.id ?? crypto.randomUUID();
  if (!existingConversation) {
    const { error: conversationError } = await supabase.from("conversas_adocao").insert({
      id: conversationId,
      canil_id: animal.canil_id,
      applicant_profile_id: user.id,
      animal_id: petId,
      pedido_id: requestId,
    });

    if (conversationError) {
      redirect(`/${locale}/pets/${petId}?error=conversation_failed`);
    }
  }

  const initialMessage = message || (locale === "pt" ? "Ola! Tenho interesse neste animal." : "Hi! I am interested in this pet.");
  const { error: messageError } = await supabase.from("mensagens_adocao").insert({
    conversa_id: conversationId,
    sender_profile_id: user.id,
    conteudo: initialMessage,
  });

  if (messageError) {
    redirect(`/${locale}/user/pedidos?success=request_created`);
  }

  redirect(`/${locale}/user/mensagens?conversation=${conversationId}&success=message_sent`);
}

export async function updateRequestStatus(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!requestId || !requestStatuses.includes(status as (typeof requestStatuses)[number])) {
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

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter && role !== "admin") {
    redirect(`/${locale}/canil/pedidos?error=no_shelter`);
  }

  let query = supabase.from("pedidos_adocao").update({
    status,
    observacoes_canil: notes || null,
    reviewed_at: new Date().toISOString(),
  }).eq("id", requestId);

  if (shelter) {
    query = query.eq("canil_id", shelter.id);
  }

  const { error } = await query;
  if (error) {
    redirect(`/${locale}/canil/pedidos?error=save_failed`);
  }

  redirect(`/${locale}/canil/pedidos?success=updated`);
}

export async function sendAdoptionMessage(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const conversationId = String(formData.get("conversationId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const audience = String(formData.get("audience") ?? "user");

  if (!conversationId || !message) {
    const redirectBase = audience === "canil" ? `/${locale}/canil/mensagens` : `/${locale}/user/mensagens`;
    redirect(`${redirectBase}?error=invalid_message`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const nextPath = audience === "canil" ? "/canil/mensagens" : "/user/mensagens";
    redirect(`/${locale}/auth/login?next=${nextPath}`);
  }

  const { error } = await supabase.from("mensagens_adocao").insert({
    conversa_id: conversationId,
    sender_profile_id: user.id,
    conteudo: message,
  });

  const redirectBase = audience === "canil" ? `/${locale}/canil/mensagens` : `/${locale}/user/mensagens`;
  if (error) {
    redirect(`${redirectBase}?conversation=${conversationId}&error=send_failed`);
  }

  redirect(`${redirectBase}?conversation=${conversationId}&success=message_sent`);
}
