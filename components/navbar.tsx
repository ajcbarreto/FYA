import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { logout } from "@/app/auth/register/actions";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import type { UserRole } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  locale: Locale;
};

export async function Navbar({ locale }: NavbarProps) {
  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    role = (profile?.role as UserRole | undefined) ?? null;
  }

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="font-semibold tracking-tight">
          FYA
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />

          <Link href={`/${locale}`} className="text-sm text-muted-foreground hover:text-foreground">
            {dictionary.nav.home}
          </Link>

          {!user && (
            <>
              <Link href={`/${locale}/auth/login`} className="text-sm text-muted-foreground hover:text-foreground">
                {dictionary.nav.login}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {dictionary.nav.register}
              </Link>
            </>
          )}

          {role === "user" && (
            <Link href={`/${locale}/user`} className="text-sm text-muted-foreground hover:text-foreground">
              {dictionary.nav.userDashboard}
            </Link>
          )}

          {role === "canil" && (
            <Link href={`/${locale}/canil`} className="text-sm text-muted-foreground hover:text-foreground">
              {dictionary.nav.canilDashboard}
            </Link>
          )}

          {role === "admin" && (
            <Link href={`/${locale}/admin`} className="text-sm text-muted-foreground hover:text-foreground">
              {dictionary.nav.admin}
            </Link>
          )}

          {user && (
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" size="sm" variant="outline">
                {dictionary.nav.logout}
              </Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
