import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { SubmitButton } from "@/components/submit-button";
import { ToastFeedback } from "@/components/toast-feedback";
import { listPrimaryPhotosForAnimals } from "@/lib/canil/animal-photos";
import {
  moderationReasonLabel,
  type ModerationState,
} from "@/lib/listings/moderation";
import { moderateListing } from "@/app/[locale]/(admin)/admin/actions";

type ListingRow = {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade_anos: number | null;
  descricao: string | null;
  created_at: string;
  archived_at: string | null;
  moderacao: ModerationState;
  moderacao_motivos: string[];
  moderacao_nota: string | null;
  canis: {
    id: string;
    nome: string;
    localizacao: string;
    owner_profile_id: string | null;
    individual_contacts: { telefone: string } | null;
  } | null;
};

export default async function IndividualListingsAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; success?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const { filter, success, error } = await searchParams;
  const state: ModerationState = ["aprovado", "rejeitado"].includes(
    filter ?? "",
  )
    ? (filter as ModerationState)
    : "pendente";
  const { supabase, user } = await getAuthUser();
  if (!user || !supabase) redirect(`/${locale}/auth/login?next=/admin`);

  const { data, error: loadError } = await supabase
    .from("animais")
    .select(
      "id,nome,especie,raca,idade_anos,descricao,created_at,archived_at,moderacao,moderacao_motivos,moderacao_nota,canis!inner(id,nome,localizacao,owner_profile_id,individual_contacts(telefone))",
    )
    .eq("canis.tipo", "particular")
    .eq("moderacao", state)
    .order("created_at", { ascending: state === "pendente" })
    .limit(50);
  if (loadError)
    throw new Error("Unable to load listings", { cause: loadError });
  const listings = (data ?? []) as unknown as ListingRow[];
  const photos = await listPrimaryPhotosForAnimals(
    supabase,
    listings.map((listing) => listing.id),
  );

  const tabs: [ModerationState, string][] = pt
    ? [
        ["pendente", "Em análise"],
        ["aprovado", "Aprovados"],
        ["rejeitado", "Rejeitados"],
      ]
    : [
        ["pendente", "Under review"],
        ["aprovado", "Approved"],
        ["rejeitado", "Rejected"],
      ];
  const messages: Record<string, string> = pt
    ? {
        aprovado: "Anúncio aprovado.",
        rejeitado: "Anúncio rejeitado.",
        invalid_data: "Dados inválidos.",
        moderation_failed: "Não foi possível guardar a decisão.",
      }
    : {
        aprovado: "Listing approved.",
        rejeitado: "Listing rejected.",
        invalid_data: "Invalid data.",
        moderation_failed: "Could not save the decision.",
      };

  return (
    <main id="main-content" tabIndex={-1} className="space-y-6">
      <header className="rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
        <h1 className="display-title text-4xl">
          {pt ? "Anúncios de particulares" : "Individual listings"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pt
            ? "Os anúncios que a verificação automática assinala esperam aqui pela tua decisão. Podes também retirar um anúncio já aprovado."
            : "Listings flagged by the automatic checks wait here for your decision. You can also withdraw an approved listing."}
        </p>
      </header>

      <ToastFeedback
        message={
          (success && messages[success]) || (error && messages[error]) || null
        }
        variant={success ? "success" : "error"}
      />

      <nav className="flex gap-2" aria-label={pt ? "Estado" : "State"}>
        {tabs.map(([value, label]) => (
          <a
            key={value}
            href={`/${locale}/admin/anuncios?filter=${value}`}
            aria-current={value === state ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              value === state
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      {listings.length === 0 ? (
        <p className="rounded-3xl border border-border/20 bg-card p-6 text-sm text-muted-foreground">
          {pt ? "Não há anúncios neste estado." : "No listings in this state."}
        </p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => {
            const photo = photos.get(listing.id);
            return (
              <li
                key={listing.id}
                className="grid gap-5 rounded-3xl border border-border/20 bg-card p-6 sm:grid-cols-[160px_1fr]"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={listing.nome}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <p className="p-4 text-xs text-muted-foreground">
                      {pt ? "Sem foto" : "No photo"}
                    </p>
                  )}
                </div>
                <div className="min-w-0 space-y-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {listing.nome}
                      {listing.archived_at && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {pt ? "(arquivado)" : "(archived)"}
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {[
                        listing.especie,
                        listing.raca,
                        listing.idade_anos === null
                          ? null
                          : `${listing.idade_anos} ${pt ? "anos" : "years"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {listing.canis?.nome} · {listing.canis?.localizacao}
                      {listing.canis?.individual_contacts?.telefone &&
                        ` · ${listing.canis.individual_contacts.telefone}`}
                    </p>
                  </div>
                  {listing.moderacao_motivos.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {listing.moderacao_motivos.map((reason) => (
                        <li
                          key={reason}
                          className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold"
                        >
                          {moderationReasonLabel(reason, locale)}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="whitespace-pre-wrap text-sm">
                    {listing.descricao ||
                      (pt ? "Sem descrição." : "No description.")}
                  </p>
                  {listing.moderacao_nota && (
                    <p className="text-xs text-muted-foreground">
                      {pt ? "Nota: " : "Note: "}
                      {listing.moderacao_nota}
                    </p>
                  )}
                  <form
                    action={moderateListing}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="animalId" value={listing.id} />
                    <input
                      name="note"
                      maxLength={1000}
                      placeholder={
                        pt
                          ? "Nota para o particular (opcional)"
                          : "Note for the owner (optional)"
                      }
                      className="field min-w-0 flex-1"
                    />
                    {state !== "aprovado" && (
                      <SubmitButton
                        name="decision"
                        value="aprovado"
                        className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
                      >
                        {pt ? "Aprovar" : "Approve"}
                      </SubmitButton>
                    )}
                    {state !== "rejeitado" && (
                      <SubmitButton
                        name="decision"
                        value="rejeitado"
                        className="rounded-full border border-destructive/40 px-5 py-2 text-sm font-bold text-destructive"
                      >
                        {state === "aprovado"
                          ? pt
                            ? "Retirar"
                            : "Withdraw"
                          : pt
                            ? "Rejeitar"
                            : "Reject"}
                      </SubmitButton>
                    )}
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
