import { notFound } from "next/navigation";
import { BadgeCheck, Building2, MapPin, ShieldOff } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { toggleShelterVerification } from "@/app/[locale]/(admin)/admin/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { PageEmpty } from "@/components/page-empty";

type AdminSheltersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

type ShelterAdminRow = {
  id: string;
  nome: string;
  localizacao: string;
  verificado: boolean;
  created_at: string;
};

export default async function AdminSheltersPage({ params, searchParams }: AdminSheltersPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("canis")
    .select("id,nome,localizacao,verificado,created_at")
    .order("verificado", { ascending: true })
    .order("nome", { ascending: true });

  const shelters = (data as ShelterAdminRow[] | null) ?? [];

  const copy = getDictionary(locale).adminShelters;
  const feedback = (success && copy.messages[success]) || (error && copy.messages[error]) || null;

  return (
    <main className="space-y-6">
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {shelters.length === 0 ? (
        <PageEmpty title={copy.empty} icon={Building2} />
      ) : (
        <ul className="space-y-3">
          {shelters.map((shelter) => {
            const joined = new Intl.DateTimeFormat(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(shelter.created_at));
            return (
              <li
                key={shelter.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/25 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{shelter.nome}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {shelter.localizacao}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{joined}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      shelter.verificado ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {shelter.verificado ? <BadgeCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                    {shelter.verificado ? copy.verified : copy.pending}
                  </span>
                  <form action={toggleShelterVerification}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="shelterId" value={shelter.id} />
                    <input type="hidden" name="verify" value={shelter.verificado ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
                        shelter.verificado
                          ? "bg-muted text-muted-foreground hover:text-destructive"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {shelter.verificado ? copy.unverify : copy.verify}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
