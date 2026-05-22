import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toCatalogItem, type AnimalRow } from "@/lib/pet-catalog/db-pets";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

type ShelterProfilePageProps = {
  params: Promise<{ locale: string }>;
};

function formatJoinedDate(createdAt: string | null, locale: string) {
  if (!createdAt) return null;
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(new Date(createdAt));
}

export default async function ShelterProfilePage({ params }: ShelterProfilePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const cp = dictionary.canilProfile;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/perfil`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,created_at,role")
    .eq("id", user.id)
    .single();

  const { data: shelter } = await supabase
    .from("canis")
    .select("id,nome,localizacao,missao,telefone,email_contacto,created_at,verificado")
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  const { data: residentRows } = shelter
    ? await supabase
        .from("animais")
        .select(
          "id,canil_id,owner_profile_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,taxa_adocao,peso_kg,vacinado,microchip,esterilizado,canis(nome,localizacao,horario_visitas),owner_profile:profiles!owner_profile_id(full_name,email)",
        )
        .eq("canil_id", shelter.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as AnimalRow[] };

  const shelterName = shelter?.nome ?? profile?.full_name ?? user.user_metadata.full_name ?? "FYA Shelter";
  const joinedDate = formatJoinedDate((shelter?.created_at as string | null) ?? profile?.created_at ?? null, locale);
  const isVerified = Boolean(shelter?.verificado ?? user.email_confirmed_at);
  const residents = ((residentRows ?? []) as AnimalRow[]).map((row) => toCatalogItem(row, locale));
  const activeCount = residents.filter((pet) => pet.status.toLowerCase().includes(cp.availableKeyword)).length;
  const reservedCount = residents.filter((pet) => pet.status.toLowerCase().includes(cp.reservedKeyword)).length;

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={cp.shelterRole}
        title={shelterName}
        subtitle={joinedDate ? `${cp.joinedLabel} ${joinedDate}` : undefined}
        actions={
          shelter && (
            <Link
              href={`/${locale}/canis/${shelter.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              {cp.viewPublicProfile}
            </Link>
          )
        }
      />

      <section className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isVerified ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {cp.verifiedLabel}: {isVerified ? cp.verifiedValue : cp.unverifiedValue}
        </span>
        {shelter?.localizacao && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {shelter.localizacao}
          </span>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={cp.stats.activePets} value={activeCount} tone="secondary" />
        <StatCard label={cp.stats.pendingRequests} value={reservedCount} tone="primary" />
        <StatCard label={cp.stats.responseTime} value="< 2h" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-border/25 bg-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">{cp.aboutTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {shelter?.missao ? shelter.missao : cp.defaultMission}
          </p>
        </article>

        <article className="rounded-2xl border border-border/25 bg-card p-6">
          <h2 className="text-lg font-bold">{cp.contactCallLabel}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cp.locationLabel}
                </p>
                <p className="truncate">{shelter?.localizacao ?? cp.notProvided}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cp.phoneLabel}
                </p>
                <p className="truncate">{shelter?.telefone ?? cp.notProvided}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cp.emailLabel}
                </p>
                <p className="break-all">{shelter?.email_contacto ?? profile?.email ?? user.email ?? cp.notProvided}</p>
              </div>
            </li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-border/25 bg-card p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{cp.residentsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{cp.residentsSubtitle}</p>
          </div>
          <Link
            href={`/${locale}/canil/animais`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {cp.managePets}
          </Link>
        </div>

        {residents.length === 0 ? (
          <p className="rounded-xl bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">
            {dictionary.canilPets.noAnimals}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {residents.slice(0, 4).map((pet) => (
              <Link
                key={pet.id}
                href={`/${locale}/pets/${pet.id}`}
                className="group overflow-hidden rounded-xl border border-border/25 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold">{pet.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {pet.species} • {pet.age}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
