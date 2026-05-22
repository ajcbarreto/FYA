"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { getCurrentProfileRole } from "@/lib/adoption/db";

function localeFromForm(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? defaultLocale);
  return (isLocale(value) ? value : defaultLocale) as Locale;
}

type CreateContext = "canil" | "user";

function settingsPath(locale: Locale, context: CreateContext) {
  return context === "canil" ? `/${locale}/canil/configuracoes` : `/${locale}/user/configuracoes`;
}

export async function createResponseTemplate(formData: FormData) {
  const locale = localeFromForm(formData);
  const context = (String(formData.get("context") ?? "canil") as CreateContext) === "user" ? "user" : "canil";
  const titulo = String(formData.get("titulo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  const base = settingsPath(locale, context);

  if (!titulo || !conteudo) {
    redirect(`${base}?error=invalid_template`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth/login?next=${context === "canil" ? "/canil/configuracoes" : "/user/configuracoes"}`);
  }

  if (context === "canil") {
    const { shelter } = await getShelterForUser(supabase, user.id);
    if (!shelter) {
      redirect(`${base}?error=no_shelter`);
    }
    const { error } = await supabase
      .from("respostas_modelo")
      .insert({ canil_id: shelter.id, titulo, conteudo });
    if (error) {
      console.error("[createResponseTemplate] error:", error.message);
      redirect(`${base}?error=template_failed`);
    }
  } else {
    const role = await getCurrentProfileRole(supabase, user.id);
    if (role !== "user") {
      redirect(`${base}?error=not_authorized`);
    }
    const { error } = await supabase
      .from("respostas_modelo")
      .insert({ owner_profile_id: user.id, titulo, conteudo });
    if (error) {
      console.error("[createResponseTemplate] error:", error.message);
      redirect(`${base}?error=template_failed`);
    }
  }

  revalidatePath(base);
  redirect(`${base}?success=template_created`);
}

export async function deleteResponseTemplate(formData: FormData) {
  const locale = localeFromForm(formData);
  const context = (String(formData.get("context") ?? "canil") as CreateContext) === "user" ? "user" : "canil";
  const templateId = String(formData.get("templateId") ?? "").trim();
  const base = settingsPath(locale, context);

  if (!templateId) {
    redirect(`${base}?error=invalid_template`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // RLS limita a deletar so o que pertence ao utilizador.
  const { error } = await supabase.from("respostas_modelo").delete().eq("id", templateId);
  if (error) {
    console.error("[deleteResponseTemplate] error:", error.message);
    redirect(`${base}?error=template_failed`);
  }

  revalidatePath(base);
  redirect(`${base}?success=template_deleted`);
}
