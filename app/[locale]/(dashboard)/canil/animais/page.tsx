import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser, localizeAnimalStatus, localizeSpecies } from "@/lib/canil/shelter-data";
import { updateAnimalStatus } from "@/app/[locale]/(dashboard)/canil/actions";

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

  const { shelter, animals } = await getShelterForUser(supabase, user.id);
  const copy =
    locale === "pt"
      ? {
          title: "Gestao de Animais",
          subtitle: "Atualiza estados dos pets e acompanha o inventario do teu canil.",
          statusLabel: "Estado",
          species: "Especie / Raca",
          age: "Idade",
          actions: "Acoes",
          noAnimals: "Ainda nao tens animais registados para este canil.",
          save: "Guardar",
          statusOptions: {
            disponivel: "Disponivel",
            reservado: "Reservado",
            em_tratamento: "Em tratamento",
            adotado: "Adotado",
          },
          success: "Estado do animal atualizado com sucesso.",
          errors: {
            invalid_status: "Estado invalido.",
            save_failed: "Nao foi possivel guardar as alteracoes.",
            no_shelter: "Nao foi encontrado um canil para a tua conta.",
            invalid_data: "Dados invalidos.",
          },
        }
      : {
          title: "Pet Inventory",
          subtitle: "Update pet statuses and keep your shelter inventory in sync.",
          statusLabel: "Status",
          species: "Species / Breed",
          age: "Age",
          actions: "Actions",
          noAnimals: "No pets were found for this shelter yet.",
          save: "Save",
          statusOptions: {
            disponivel: "Available",
            reservado: "Reserved",
            em_tratamento: "In treatment",
            adotado: "Adopted",
          },
          success: "Pet status was updated successfully.",
          errors: {
            invalid_status: "Invalid status.",
            save_failed: "Could not save the changes.",
            no_shelter: "No shelter was found for your account.",
            invalid_data: "Invalid data.",
          },
        };

  const summary = {
    available: animals.filter((animal) => animal.status.toLowerCase() === "disponivel").length,
    pending: animals.filter((animal) => ["reservado", "em_tratamento"].includes(animal.status.toLowerCase())).length,
    adopted: animals.filter((animal) => animal.status.toLowerCase() === "adotado").length,
  };

  const feedback =
    success === "updated"
      ? copy.success
      : error && copy.errors[error as keyof typeof copy.errors]
        ? copy.errors[error as keyof typeof copy.errors]
        : null;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      {feedback && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            success ? "border border-secondary/25 bg-secondary/10 text-secondary" : "border border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.statusOptions.disponivel}</p>
          <p className="mt-1 text-3xl font-black text-secondary">{summary.available}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.statusOptions.reservado}</p>
          <p className="mt-1 text-3xl font-black text-primary">{summary.pending}</p>
        </article>
        <article className="rounded-2xl border border-border/20 bg-card p-5">
          <p className="text-sm text-muted-foreground">{copy.statusOptions.adotado}</p>
          <p className="mt-1 text-3xl font-black">{summary.adopted}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border/20 bg-card">
        {animals.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">{copy.noAnimals}</p>
        ) : (
          <div className="overflow-x-auto">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">{shelter?.nome ?? "FYA Shelter"}</p>
    </main>
  );
}
