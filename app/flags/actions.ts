"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

const ALLOWED_TARGETS = new Set(["animal", "mensagem", "conversa", "canil", "profile"]);
const ALLOWED_REASONS = new Set([
  "conteudo_inapropriado",
  "animal_nao_pertence",
  "spam",
  "comunicacao_abusiva",
  "fraude",
  "outro",
]);

function localeFromForm(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(value) ? value : defaultLocale) as Locale;
}

// Envia uma denuncia. Insere na tabela denuncias e redireciona de volta
// para o redirectTo com um query param de sucesso/erro consumido por
// ToastFeedback na pagina-alvo.
export async function submitFlag(formData: FormData) {
  const locale = localeFromForm(formData);
  const targetType = String(formData.get("target_type") ?? "").trim();
  const targetId = String(formData.get("target_id") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? `/${locale}`);

  const separator = redirectTo.includes("?") ? "&" : "?";

  if (!ALLOWED_TARGETS.has(targetType) || !ALLOWED_REASONS.has(motivo) || !targetId) {
    redirect(`${redirectTo}${separator}error=invalid_report`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth/login?next=${encodeURIComponent(redirectTo)}`);
  }

  const { error } = await supabase.from("denuncias").insert({
    reporter_profile_id: user.id,
    target_type: targetType,
    target_id: targetId,
    motivo,
    descricao: descricao || null,
  });

  if (error) {
    console.error("[submitFlag] insert error:", error.message);
    redirect(`${redirectTo}${separator}error=report_failed`);
  }

  redirect(`${redirectTo}${separator}success=report_sent`);
}
