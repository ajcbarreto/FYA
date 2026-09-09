"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { isLocale } from "@/lib/i18n/config";
export async function updateAccountName(form: FormData) {
  const value = String(form.get("locale") ?? "pt");
  const locale = isLocale(value) ? value : "pt";
  const name = String(form.get("full_name") ?? "").trim();
  if (name.length < 2 || name.length > 100)
    redirect(`/${locale}/user/configuracoes?error=name`);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name })
    .eq("id", user.id);
  if (error) redirect(`/${locale}/user/configuracoes?error=save`);
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/user/configuracoes?success=saved`);
}
