import { notFound } from "next/navigation";
import { BadgeCheck, Building2, MapPin, ShieldOff } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { toggleShelterVerification } from "@/app/[locale]/(admin)/admin/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";

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

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {shelters.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">{copy.colName}</th>
                  <th className="px-6 py-4 font-bold">{copy.colJoined}</th>
                  <th className="px-6 py-4 font-bold">{copy.colStatus}</th>
                  <th className="px-6 py-4 font-bold">{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {shelters.map((shelter) => (
                  <tr key={shelter.id} className="border-t border-border/15">
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        {shelter.nome}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {shelter.localizacao}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
                        new Date(shelter.created_at),
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          shelter.verificado ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {shelter.verificado ? <BadgeCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                        {shelter.verificado ? copy.verified : copy.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <form action={toggleShelterVerification}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="shelterId" value={shelter.id} />
                        <input type="hidden" name="verify" value={shelter.verificado ? "false" : "true"} />
                        <button
                          type="submit"
                          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                            shelter.verificado
                              ? "bg-muted text-muted-foreground hover:text-destructive"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {shelter.verificado ? copy.unverify : copy.verify}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
