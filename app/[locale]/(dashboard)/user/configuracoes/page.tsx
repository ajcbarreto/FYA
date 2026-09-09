import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { updateAccountName } from "@/app/account/actions";
import { SubmitButton } from "@/components/submit-button";
import { ToastFeedback } from "@/components/toast-feedback";
export default async function Settings({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const { success, error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login?next=/user/configuracoes`);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .single();
  if (profileError)
    throw new Error("Unable to load account", { cause: profileError });
  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="surface">
        <p className="eyebrow">{pt ? "O teu espaço" : "Your space"}</p>
        <h1 className="display-title mt-3 text-4xl">
          {pt ? "A tua conta." : "Your account."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {pt
            ? "Mantém os teus dados atualizados para os abrigos te conhecerem melhor."
            : "Keep your details up to date so shelters can get to know you."}
        </p>
      </header>
      <ToastFeedback
        message={
          success
            ? pt
              ? "Nome atualizado."
              : "Name updated."
            : error
              ? pt
                ? "Não foi possível guardar. Usa um nome entre 2 e 100 caracteres."
                : "Could not save. Use a name between 2 and 100 characters."
              : null
        }
        variant={success ? "success" : "error"}
      />
      <form action={updateAccountName} className="surface max-w-xl space-y-5">
        <input type="hidden" name="locale" value={locale} />
        <label className="block text-sm font-semibold">
          {pt ? "Como te devemos chamar?" : "What should we call you?"}
          <input
            name="full_name"
            defaultValue={profile.full_name ?? ""}
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="field mt-2"
          />
        </label>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Email</p>
          <p className="mt-1 text-sm">{profile.email}</p>
        </div>
        <SubmitButton className="button-primary">
          {pt ? "Guardar alterações" : "Save changes"}
        </SubmitButton>
      </form>
      <section className="surface max-w-xl">
        <h2 className="font-semibold">
          {pt ? "Segurança da conta" : "Account security"}
        </h2>
        <p className="my-3 text-sm text-muted-foreground">
          {pt
            ? "Podes pedir um link seguro para alterar a tua palavra-passe."
            : "You can request a secure link to change your password."}
        </p>
        <Link
          href={`/${locale}/auth/forgot-password`}
          className="text-sm font-semibold underline underline-offset-4"
        >
          {pt ? "Alterar palavra-passe" : "Change password"}
        </Link>
      </section>
    </main>
  );
}
