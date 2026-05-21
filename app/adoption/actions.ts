"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCurrentProfileRole } from "@/lib/adoption/db";
import { parseApplicationAnswers } from "@/lib/adoption/application-form";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { notifyAdopterStatusChange, notifyOwnerNewRequest, notifyShelterNewRequest } from "@/lib/email/notifications";

const requestStatuses = ["pendente", "entrevista", "aprovado", "rejeitado", "concluido"] as const;

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function submitAdoptionRequest(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const petId = String(formData.get("petId") ?? "");
  const answers = parseApplicationAnswers(formData);
  const message = (answers.message ?? "").trim();

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

  const { data: animal } = await supabase
    .from("animais")
    .select("id,canil_id,owner_profile_id,nome")
    .eq("id", petId)
    .maybeSingle();
  if (!animal) {
    redirect(`/${locale}/pets/${petId}?error=pet_not_found`);
  }

  if (animal.owner_profile_id && animal.owner_profile_id === user.id) {
    redirect(`/${locale}/pets/${petId}?error=cannot_apply_own_pet`);
  }

  const { data: existingRequest } = await supabase
    .from("pedidos_adocao")
    .select("id")
    .eq("animal_id", petId)
    .eq("applicant_profile_id", user.id)
    .in("status", ["pendente", "entrevista"])
    .maybeSingle();

  const requestId = existingRequest?.id ?? crypto.randomUUID();
  const isOwnerListed = !animal.canil_id && Boolean(animal.owner_profile_id);

  const requestPayload = {
    id: requestId,
    animal_id: petId,
    canil_id: isOwnerListed ? null : animal.canil_id,
    owner_profile_id: isOwnerListed ? animal.owner_profile_id : null,
    applicant_profile_id: user.id,
    status: "pendente" as const,
    mensagem_inicial: message || null,
    respostas: answers as unknown as Record<string, unknown>,
  };

  const { error: requestError } = await supabase.from("pedidos_adocao").upsert(requestPayload);
  if (requestError) {
    redirect(`/${locale}/pets/${petId}?error=request_failed`);
  }

  let conversationQuery = supabase
    .from("conversas_adocao")
    .select("id")
    .eq("applicant_profile_id", user.id)
    .eq("animal_id", petId);
  conversationQuery = isOwnerListed
    ? conversationQuery.eq("owner_profile_id", animal.owner_profile_id as string)
    : conversationQuery.eq("canil_id", animal.canil_id as string);
  const { data: existingConversation } = await conversationQuery.maybeSingle();

  const conversationId = existingConversation?.id ?? crypto.randomUUID();
  if (!existingConversation) {
    const { error: conversationError } = await supabase.from("conversas_adocao").insert({
      id: conversationId,
      canil_id: isOwnerListed ? null : animal.canil_id,
      owner_profile_id: isOwnerListed ? animal.owner_profile_id : null,
      applicant_profile_id: user.id,
      animal_id: petId,
      pedido_id: requestId,
    });

    if (conversationError) {
      redirect(`/${locale}/pets/${petId}?error=conversation_failed`);
    }
  }

  const initialMessage = message || getDictionary(locale).petDetails.initialGreeting;
  const { error: messageError } = await supabase.from("mensagens_adocao").insert({
    conversa_id: conversationId,
    sender_profile_id: user.id,
    conteudo: initialMessage,
  });

  if (isOwnerListed) {
    await notifyOwnerNewRequest(supabase, {
      ownerProfileId: animal.owner_profile_id as string,
      animalName: animal.nome,
      locale,
    });
  } else {
    await notifyShelterNewRequest(supabase, {
      canilId: animal.canil_id as string,
      animalName: animal.nome,
      locale,
    });
  }

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
  const audience = String(formData.get("audience") ?? "canil");
  const baseRedirect =
    audience === "owner" ? `/${locale}/user/pedidos-recebidos` : `/${locale}/canil/pedidos`;

  if (!requestId || !requestStatuses.includes(status as (typeof requestStatuses)[number])) {
    redirect(`${baseRedirect}?error=invalid_request`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=${baseRedirect.replace(`/${locale}`, "")}`);
  }

  const role = await getCurrentProfileRole(supabase, user.id);
  if (audience === "owner") {
    if (role !== "user") {
      redirect(`${baseRedirect}?error=unauthorized`);
    }
  } else if (role !== "canil" && role !== "admin") {
    redirect(`${baseRedirect}?error=unauthorized`);
  }

  let query = supabase
    .from("pedidos_adocao")
    .update({
      status,
      observacoes_canil: notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (audience === "owner") {
    query = query.eq("owner_profile_id", user.id);
  } else if (role !== "admin") {
    const { shelter } = await getShelterForUser(supabase, user.id);
    if (!shelter) {
      redirect(`${baseRedirect}?error=no_shelter`);
    }
    query = query.eq("canil_id", shelter.id);
  }

  const { data: updatedRows, error } = await query.select("applicant_profile_id,animais(nome)");
  if (error) {
    redirect(`${baseRedirect}?error=save_failed`);
  }

  const updatedRow = updatedRows?.[0];
  if (updatedRow) {
    const animalRelation = updatedRow.animais;
    const animal = Array.isArray(animalRelation) ? animalRelation[0] : animalRelation;
    await notifyAdopterStatusChange({
      applicantProfileId: updatedRow.applicant_profile_id as string,
      animalName: (animal?.nome as string | undefined) ?? "",
      status: status as (typeof requestStatuses)[number],
      locale,
    });
  }

  redirect(`${baseRedirect}?success=updated`);
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
