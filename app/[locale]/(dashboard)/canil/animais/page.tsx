import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ImagePlus, Plus } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser, localizeAnimalStatus, localizeSpecies } from "@/lib/canil/shelter-data";
import { updateAnimalStatus } from "@/app/[locale]/(dashboard)/canil/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { PageEmpty } from "@/components/page-empty";
import { PawPrint } from "lucide-react";

type CanilPetsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CanilPetsPage({ params, searchParams }: CanilPetsPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais`);
  }

  const { animals } = await getShelterForUser(supabase, user.id);
  const copy = getDictionary(locale).canilPets;

  const summary = {
    available: animals.filter((animal) => animal.status.toLowerCase() === "disponivel").length,
    pending: animals.filter((animal) => ["reservado", "em_tratamento"].includes(animal.status.toLowerCase())).length,
    adopted: animals.filter((animal) => animal.status.toLowerCase() === "adotado").length,
  };

  const feedback =
    (success && copy.successMessages[success as keyof typeof copy.successMessages]) ||
    (error && copy.errorMessages[error as keyof typeof copy.errorMessages]) ||
    null;

  return (
    <main className="space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Link
            href={`/${locale}/canil/animais/novo`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {copy.newPet}
          </Link>
        }
      />

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={copy.statusOptions.disponivel} value={summary.available} tone="secondary" />
        <StatCard label={copy.statusOptions.reservado} value={summary.pending} tone="primary" />
        <StatCard label={copy.statusOptions.adotado} value={summary.adopted} />
      </section>

      {animals.length === 0 ? (
        <PageEmpty
          title={copy.noAnimals}
          icon={PawPrint}
          action={
            <Link
              href={`/${locale}/canil/animais/novo`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {copy.newPet}
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">Pet</th>
                  <th className="px-6 py-4 font-bold">{copy.species}</th>
                  <th className="px-6 py-4 font-bold">{copy.age}</th>
                  <th className="px-6 py-4 font-bold">{copy.statusLabel}</th>
                  <th className="px-6 py-4 font-bold">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.id} className="border-t border-border/15">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{animal.nome}</p>
                      <p className="text-xs text-muted-foreground">#{animal.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {localizeSpecies(animal.especie, locale)}
                      {animal.raca ? ` - ${animal.raca}` : ""}
                    </td>
                    <td className="px-6 py-4 text-sm">{animal.idade_anos === null ? "-" : `${animal.idade_anos}`}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{localizeAnimalStatus(animal.status, locale)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={updateAnimalStatus} className="flex items-center gap-2">
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="animalId" value={animal.id} />
                          <select
                            name="status"
                            defaultValue={animal.status.toLowerCase()}
                            className="h-10 rounded-full border border-border/30 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="disponivel">{copy.statusOptions.disponivel}</option>
                            <option value="reservado">{copy.statusOptions.reservado}</option>
                            <option value="em_tratamento">{copy.statusOptions.em_tratamento}</option>
                            <option value="adotado">{copy.statusOptions.adotado}</option>
                          </select>
                          <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                            {copy.save}
                          </button>
                        </form>
                        <Link
                          href={`/${locale}/canil/animais/${animal.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/80"
                        >
                          <ImagePlus className="h-3 w-3" />
                          {copy.photos}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </main>
  );
}
