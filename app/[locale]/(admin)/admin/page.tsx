import { notFound } from "next/navigation";
import { BadgeCheck, Building2, ShieldOff, Users } from "lucide-react";
import { toggleShelterVerification, updatePetCatalogFilters } from "@/app/[locale]/(admin)/admin/actions";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPetCatalogFiltersConfig } from "@/lib/pet-catalog/filter-config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { ToastFeedback } from "@/components/toast-feedback";

type AdminPageProps = {
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

type ProfileAdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [filterConfig, sheltersResult, profilesResult] = await Promise.all([
    getPetCatalogFiltersConfig(supabase),
    supabase
      .from("canis")
      .select("id,nome,localizacao,verificado,created_at")
      .order("nome", { ascending: true }),
    supabase
      .from("profiles")
      .select("id,email,full_name,role,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const shelters = (sheltersResult.data as ShelterAdminRow[] | null) ?? [];
  const profiles = (profilesResult.data as ProfileAdminRow[] | null) ?? [];

  const copy =
    locale === "pt"
      ? {
          sheltersTitle: "Canis registados",
          sheltersSubtitle: "Verifica os canis parceiros para aumentar a confianca dos adotantes.",
          verified: "Verificado",
          pending: "Pendente",
          verify: "Verificar",
          unverify: "Remover verificacao",
          usersTitle: "Utilizadores",
          usersSubtitle: "Todos os perfis registados na plataforma.",
          colName: "Nome",
          colEmail: "Email",
          colRole: "Perfil",
          colStatus: "Estado",
          colActions: "Acoes",
          noShelters: "Sem canis registados.",
          noUsers: "Sem utilizadores.",
          messages: {
            shelter_verified: "Canil verificado.",
            shelter_unverified: "Verificacao removida.",
            unauthorized: "Nao autorizado.",
            invalid_shelter: "Canil invalido.",
            verification_failed: "Nao foi possivel atualizar a verificacao.",
          },
        }
      : {
          sheltersTitle: "Registered shelters",
          sheltersSubtitle: "Verify partner shelters to build adopter trust.",
          verified: "Verified",
          pending: "Pending",
          verify: "Verify",
          unverify: "Remove verification",
          usersTitle: "Users",
          usersSubtitle: "All profiles registered on the platform.",
          colName: "Name",
          colEmail: "Email",
          colRole: "Role",
          colStatus: "Status",
          colActions: "Actions",
          noShelters: "No shelters registered.",
          noUsers: "No users.",
          messages: {
            shelter_verified: "Shelter verified.",
            shelter_unverified: "Verification removed.",
            unauthorized: "Not authorized.",
            invalid_shelter: "Invalid shelter.",
            verification_failed: "Could not update verification.",
          },
        };

  const messageMap = copy.messages as Record<string, string>;
  const feedbackMessage =
    (success && (messageMap[success] ?? decodeURIComponent(success))) ||
    (error && (messageMap[error] ?? decodeURIComponent(error))) ||
    null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <ToastFeedback message={feedbackMessage} variant={success ? "success" : "error"} />
      <h1 className="text-2xl font-semibold">{dictionary.admin.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dictionary.admin.subtitle}</p>

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{copy.sheltersTitle}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{copy.sheltersSubtitle}</p>

        {shelters.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{copy.noShelters}</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2 font-bold">{copy.colName}</th>
                  <th className="py-2 font-bold">{copy.colStatus}</th>
                  <th className="py-2 font-bold">{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {shelters.map((shelter) => (
                  <tr key={shelter.id} className="border-t border-border/20">
                    <td className="py-3">
                      <p className="font-semibold">{shelter.nome}</p>
                      <p className="text-xs text-muted-foreground">{shelter.localizacao}</p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          shelter.verificado
                            ? "bg-secondary/15 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {shelter.verificado ? <BadgeCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                        {shelter.verificado ? copy.verified : copy.pending}
                      </span>
                    </td>
                    <td className="py-3">
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

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{copy.usersTitle}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{copy.usersSubtitle}</p>

        {profiles.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{copy.noUsers}</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-2 font-bold">{copy.colName}</th>
                  <th className="py-2 font-bold">{copy.colEmail}</th>
                  <th className="py-2 font-bold">{copy.colRole}</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-t border-border/20">
                    <td className="py-3 font-semibold">{profile.full_name ?? "-"}</td>
                    <td className="py-3 text-muted-foreground">{profile.email}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize text-muted-foreground">
                        {profile.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{dictionary.admin.filterConfigTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dictionary.admin.filterConfigDescription}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.admin.hint}</p>

        <form action={updatePetCatalogFilters} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />

          {(
            [
              ["species", dictionary.admin.species, filterConfig.species],
              ["ageRanges", dictionary.admin.ageRanges, filterConfig.ageRanges],
              ["sizes", dictionary.admin.sizes, filterConfig.sizes],
              ["genders", dictionary.admin.genders, filterConfig.genders],
              ["compatibilities", dictionary.admin.compatibilities, filterConfig.compatibilities],
            ] as const
          ).map(([name, label, values]) => (
            <div key={name} className="space-y-2">
              <label htmlFor={name} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
                defaultValue={values.join(", ")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}

          <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
            {dictionary.admin.save}
          </button>
        </form>
      </section>
    </main>
  );
}
