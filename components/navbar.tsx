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
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href={`/${locale}`} className="text-2xl font-black tracking-tight text-primary">
          FYA
        </Link>

        <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <Link href={`/${locale}`} className="text-muted-foreground transition-colors hover:text-primary">
            {dictionary.nav.home}
          </Link>
          <Link href={`/${locale}/pets`} className="text-muted-foreground transition-colors hover:text-primary">
            {dictionary.nav.pets}
          </Link>

          {role === "user" && (
            <Link href={`/${locale}/user`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.userDashboard}
            </Link>
          )}

          {role === "canil" && (
            <>
              <Link href={`/${locale}/canil`} className="text-muted-foreground transition-colors hover:text-primary">
                {dictionary.nav.canilDashboard}
              </Link>
              <Link href={`/${locale}/canil/configuracoes`} className="text-muted-foreground transition-colors hover:text-primary">
                {dictionary.nav.canilSettings}
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link href={`/${locale}/admin`} className="text-muted-foreground transition-colors hover:text-primary">
              {dictionary.nav.admin}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />

          {!user && (
            <Link
              href={`/${locale}/auth/login`}
              className="hidden rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary sm:inline-flex"
            >
              {dictionary.nav.login}
            </Link>
          )}
          {!user && (
            <Link
              href={`/${locale}/auth/register`}
              className="rounded-full bg-gradient-to-br from-primary to-accent px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[0.98]"
            >
              {dictionary.nav.register}
            </Link>
          )}

          {user && (
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" size="sm" className="rounded-full px-5">
                {dictionary.nav.logout}
              </Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
