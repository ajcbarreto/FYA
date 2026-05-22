import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ImagePlus, Plus } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { localizeAnimalStatus, localizeSpecies } from "@/lib/canil/shelter-data";
import { updateUserAnimalStatus } from "@/app/[locale]/(dashboard)/user/animais/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";

type UserPetsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

type UserAnimalRow = {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade_anos: number | null;
  status: string;
};

export default async function UserPetsPage({ params, searchParams }: UserPetsPageProps) {
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
    redirect(`/${locale}/auth/login?next=/user/animais`);
  }

  const { data: animalsRaw } = await supabase
    .from("animais")
    .select("id,nome,especie,raca,idade_anos,status")
    .eq("owner_profile_id", user.id)
    .order("created_at", { ascending: false });
  const animals = (animalsRaw as UserAnimalRow[] | null) ?? [];

  const dict = getDictionary(locale);
  const t = dict.userPets;
  const canilT = dict.canilPets;
  const feedback =
    (success && canilT.successMessages[success as keyof typeof canilT.successMessages]) ||
    (error && canilT.errorMessages[error as keyof typeof canilT.errorMessages]) ||
    null;

  return (
    <main className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Link
            href={`/${locale}/user/animais/novo`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {canilT.newPet}
          </Link>
        }
      />

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <p className="rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">{t.publishHint}</p>

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {animals.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{t.noAnimals}</p>
        ) : (
          <div className="overflow-x-auto stacked-table">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-muted text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">Pet</th>
                  <th className="px-6 py-4 font-bold">{canilT.species}</th>
                  <th className="px-6 py-4 font-bold">{canilT.age}</th>
                  <th className="px-6 py-4 font-bold">{canilT.statusLabel}</th>
                  <th className="px-6 py-4 font-bold">{canilT.actions}</th>
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
                        <form action={updateUserAnimalStatus} className="flex items-center gap-2">
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="animalId" value={animal.id} />
                          <select
                            name="status"
                            defaultValue={animal.status.toLowerCase()}
                            className="h-10 rounded-full border border-border/30 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="disponivel">{canilT.statusOptions.disponivel}</option>
                            <option value="reservado">{canilT.statusOptions.reservado}</option>
                            <option value="em_tratamento">{canilT.statusOptions.em_tratamento}</option>
                            <option value="adotado">{canilT.statusOptions.adotado}</option>
                          </select>
                          <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                            {canilT.save}
                          </button>
                        </form>
                        <Link
                          href={`/${locale}/user/animais/${animal.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/80"
                        >
                          <ImagePlus className="h-3 w-3" />
                          {canilT.photos}
                        </Link>
                      </div>
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
