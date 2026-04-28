import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/supabase/types";

export type AdoptionRequestRow = {
  id: string;
  animal_id: string;
  canil_id: string;
  applicant_profile_id: string;
  status: "pendente" | "entrevista" | "aprovado" | "rejeitado";
  mensagem_inicial: string | null;
  observacoes_canil: string | null;
  created_at: string;
  reviewed_at: string | null;
  animais: { nome: string; especie: string; raca: string | null } | { nome: string; especie: string; raca: string | null }[] | null;
  canis: { nome: string; localizacao: string } | { nome: string; localizacao: string }[] | null;
  profiles: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
};

type ConversationRow = {
  id: string;
  canil_id: string;
  applicant_profile_id: string;
  animal_id: string | null;
  pedido_id: string | null;
  created_at: string;
  updated_at: string;
  canis: { nome: string; owner_profile_id: string | null } | { nome: string; owner_profile_id: string | null }[] | null;
  applicant: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  animais: { nome: string } | { nome: string }[] | null;
};

type MessageRow = {
  id: string;
  conversa_id: string;
  sender_profile_id: string;
  conteudo: string;
  created_at: string;
  sender: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
};

function firstFromRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function getDisplayName(fullName: string | null, email: string, fallback: string) {
  if (fullName && fullName.trim().length > 0) return fullName.trim();
  if (email.includes("@")) return email.split("@")[0] ?? fallback;
  return fallback;
}

export function localizeRequestStatus(status: AdoptionRequestRow["status"], locale: string) {
  if (locale === "pt") {
    if (status === "pendente") return "Pendente";
    if (status === "entrevista") return "Entrevista";
    if (status === "aprovado") return "Aprovado";
    return "Rejeitado";
  }

  if (status === "pendente") return "Pending";
  if (status === "entrevista") return "Interview";
  if (status === "aprovado") return "Approved";
  return "Rejected";
}

export async function getCurrentProfileRole(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return (profile?.role as UserRole | undefined) ?? null;
}

export async function getAdoptionRequestsForCanil(supabase: SupabaseClient, canilId: string) {
  const { data, error } = await supabase
    .from("pedidos_adocao")
    .select("id,animal_id,canil_id,applicant_profile_id,status,mensagem_inicial,observacoes_canil,created_at,reviewed_at,animais(nome,especie,raca),canis(nome,localizacao),profiles!pedidos_adocao_applicant_profile_id_fkey(full_name,email)")
    .eq("canil_id", canilId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("[getAdoptionRequestsForCanil] Supabase error:", error.message);
    }
    return [];
  }

  return data as AdoptionRequestRow[];
}

export async function getAdoptionRequestsForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("pedidos_adocao")
    .select("id,animal_id,canil_id,applicant_profile_id,status,mensagem_inicial,observacoes_canil,created_at,reviewed_at,animais(nome,especie,raca),canis(nome,localizacao),profiles!pedidos_adocao_applicant_profile_id_fkey(full_name,email)")
    .eq("applicant_profile_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("[getAdoptionRequestsForUser] Supabase error:", error.message);
    }
    return [];
  }

  return data as AdoptionRequestRow[];
}

export async function getConversationsForCanil(supabase: SupabaseClient, canilId: string) {
  const { data, error } = await supabase
    .from("conversas_adocao")
    .select("id,canil_id,applicant_profile_id,animal_id,pedido_id,created_at,updated_at,canis(nome,owner_profile_id),applicant:profiles!conversas_adocao_applicant_profile_id_fkey(id,full_name,email),animais(nome)")
    .eq("canil_id", canilId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("[getConversationsForCanil] Supabase error:", error.message);
    }
    return [];
  }

  return data as ConversationRow[];
}

export async function getConversationsForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("conversas_adocao")
    .select("id,canil_id,applicant_profile_id,animal_id,pedido_id,created_at,updated_at,canis(nome,owner_profile_id),applicant:profiles!conversas_adocao_applicant_profile_id_fkey(id,full_name,email),animais(nome)")
    .eq("applicant_profile_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("[getConversationsForUser] Supabase error:", error.message);
    }
    return [];
  }

  return data as ConversationRow[];
}

export async function getMessagesByConversationId(supabase: SupabaseClient, conversationId: string) {
  const { data, error } = await supabase
    .from("mensagens_adocao")
    .select("id,conversa_id,sender_profile_id,conteudo,created_at,sender:profiles!mensagens_adocao_sender_profile_id_fkey(id,full_name,email)")
    .eq("conversa_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) {
      console.error("[getMessagesByConversationId] Supabase error:", error.message);
    }
    return [];
  }

  return data as MessageRow[];
}

export function mapConversationListItem(conversation: ConversationRow, locale: string) {
  const applicant = firstFromRelation(conversation.applicant);
  const shelter = firstFromRelation(conversation.canis);
  const animal = firstFromRelation(conversation.animais);
  const contactName = getDisplayName(
    applicant?.full_name ?? null,
    applicant?.email ?? "contact@fya.local",
    locale === "pt" ? "Adotante" : "Adopter",
  );

  return {
    id: conversation.id,
    updatedAt: conversation.updated_at,
    animalName: animal?.nome ?? (locale === "pt" ? "Animal" : "Pet"),
    canilName: shelter?.nome ?? "FYA Shelter",
    applicantName: contactName,
    applicantId: conversation.applicant_profile_id,
    canilOwnerId: shelter?.owner_profile_id ?? null,
  };
}

export function mapRequestApplicantName(row: AdoptionRequestRow, locale: string) {
  const applicant = firstFromRelation(row.profiles);
  return getDisplayName(
    applicant?.full_name ?? null,
    applicant?.email ?? "adopter@fya.local",
    locale === "pt" ? "Adotante" : "Adopter",
  );
}

export function getRowAnimal(row: AdoptionRequestRow) {
  return firstFromRelation(row.animais);
}

export function getRowCanil(row: AdoptionRequestRow) {
  return firstFromRelation(row.canis);
}
