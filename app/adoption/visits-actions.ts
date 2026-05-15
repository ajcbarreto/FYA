"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

const visitStatuses = ["proposta", "confirmada", "cancelada", "realizada"] as const;

function getLocaleFromForm(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(localeValue) ? localeValue : defaultLocale) as Locale;
}

export async function proposeVisit(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const pedidoId = String(formData.get("pedidoId") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const redirectBase = `/${locale}/user/pedidos`;

  const scheduledDate = scheduledRaw ? new Date(scheduledRaw) : null;
  if (!pedidoId || !scheduledDate || Number.isNaN(scheduledDate.getTime())) {
    redirect(`${redirectBase}?error=invalid_visit`);
  }
  if ((scheduledDate as Date).getTime() < Date.now()) {
    redirect(`${redirectBase}?error=visit_in_past`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/pedidos`);
  }

  const { data: pedido } = await supabase
    .from("pedidos_adocao")
    .select("id,canil_id,animal_id,applicant_profile_id,status")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido || pedido.applicant_profile_id !== user.id) {
    redirect(`${redirectBase}?error=invalid_visit`);
  }
  if (pedido.status === "rejeitado" || pedido.status === "concluido") {
    redirect(`${redirectBase}?error=visit_not_allowed`);
  }

  const { error } = await supabase.from("visitas").insert({
    pedido_id: pedido.id,
    canil_id: pedido.canil_id,
    animal_id: pedido.animal_id,
    applicant_profile_id: user.id,
    scheduled_at: (scheduledDate as Date).toISOString(),
    notas: notas || null,
  });

  if (error) {
    console.error("[proposeVisit] error:", error.message);
    redirect(`${redirectBase}?error=visit_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=visit_proposed`);
}

export async function updateVisitStatus(formData: FormData) {
  const locale = getLocaleFromForm(formData);
  const visitId = String(formData.get("visitId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const audience = String(formData.get("audience") ?? "user");
  const redirectBase = audience === "canil" ? `/${locale}/canil/pedidos` : `/${locale}/user/pedidos`;

  if (!visitId || !visitStatuses.includes(status as (typeof visitStatuses)[number])) {
    redirect(`${redirectBase}?error=invalid_visit`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=${audience === "canil" ? "/canil/pedidos" : "/user/pedidos"}`);
  }

  const { error } = await supabase.from("visitas").update({ status }).eq("id", visitId);

  if (error) {
    redirect(`${redirectBase}?error=visit_failed`);
  }

  revalidatePath(redirectBase);
  redirect(`${redirectBase}?success=visit_updated`);
}
