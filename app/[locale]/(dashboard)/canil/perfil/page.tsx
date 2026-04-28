import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Heart, MapPin, Phone, Globe, ShieldCheck, ArrowDown } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toCatalogItem, type AnimalRow } from "@/lib/pet-catalog/db-pets";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type ShelterProfilePageProps = {
  params: Promise<{ locale: string }>;
};

function formatJoinedDate(createdAt: string | null, locale: string) {
  if (!createdAt) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

export default async function ShelterProfilePage({ params }: ShelterProfilePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
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

  const { data: ownedShelter } = await supabase
    .from("canis")
    .select("id,nome,localizacao,missao,telefone,email_contacto,created_at")
    .eq("owner_profile_id", user.id)
    .maybeSingle();

  const shelter = ownedShelter
    ? ownedShelter
    : (
        await supabase
          .from("canis")
          .select("id,nome,localizacao,missao,telefone,email_contacto,created_at")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      ).data;

  const { data: residentRows } = shelter
    ? await supabase
        .from("animais")
        .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)")
        .eq("canil_id", shelter.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as AnimalRow[] };

  const shelterName = shelter?.nome ?? profile?.full_name ?? user.user_metadata.full_name ?? "FYA Shelter";
  const joinedDate = formatJoinedDate((shelter?.created_at as string | null) ?? profile?.created_at ?? null, locale);
  const isVerified = Boolean(user.email_confirmed_at);
  const contactBlocks =
    locale === "pt"
      ? [
          {
            icon: MapPin,
            label: "VISITE-NOS",
            value: shelter?.localizacao
              ? `${shelter.localizacao}\nPortugal`
              : dictionary.canilProfile.notProvided,
          },
          {
            icon: Phone,
            label: "LIGUE",
            value: `${shelter?.telefone ?? dictionary.canilProfile.notProvided}\nMon-Sat: 9h - 18h`,
          },
          {
            icon: Globe,
            label: "WEBSITE",
            value: `${shelter?.email_contacto ?? dictionary.canilProfile.notProvided}\n${profile?.email ?? user.email ?? dictionary.canilProfile.notProvided}`,
          },
        ]
      : [
          {
            icon: MapPin,
            label: "VISIT US",
            value: shelter?.localizacao
              ? `${shelter.localizacao}\nPortugal`
              : dictionary.canilProfile.notProvided,
          },
          {
            icon: Phone,
            label: "CALL US",
            value: `${shelter?.telefone ?? dictionary.canilProfile.notProvided}\nMon-Sat: 9am - 6pm`,
          },
          {
            icon: Globe,
            label: "WEBSITE",
            value: `${shelter?.email_contacto ?? dictionary.canilProfile.notProvided}\n${profile?.email ?? user.email ?? dictionary.canilProfile.notProvided}`,
          },
        ];
  const allResidents = ((residentRows ?? []) as AnimalRow[]).map((row) => toCatalogItem(row, locale));
  const residents = allResidents.slice(0, 4);
  const shelterImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCJod5LHzRAEThmcTXqkUUFQA0xOZAWWN-pWHaWS8TFZ0iyyS_oX02PK_d2Tt-HGWUJjBQH_CBAS4si5B-Jd3s8uqr8cu4sffo_aWul-0J4iXiNXi48_GtSUGT3hKMvx6p3evgdh7hf55u7W0l77rcECfG387Is0PxGlFeqweF1FIlt_Uy7gcs8h7TXagcqDFv6Psgmvh3CaMd6InoSFz9ohGg-IFhaYsSjY9hnql1Jp7r9RTg3JKnMSbQt5C8dVh9lg4mlVBI83kE";
  const profileLogo =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBjHBo6mt8VtCZG2-nUPJ975n0H-sGPoZSjjRMFpYU96YVfXD9cQ7QFpZllBFYHJMeodd9ZWpQoAWsKQ6yq5xaZ2v1dbi4xvmP7GG8Oy3MctMeebzUK-MJ6La0oJx_RTZ5clVYMR5gsSZ_BlqmnP3hFBEhnhbHoxakzmMpR_Riw6d6MLbSswzc2OZrqGkQWAio46A_TTEjrO0CXmpYEysKU-QyhEacg3PA49tJq3KmOv4g1iskrrUX5tMxBWyo1gVjdjJhmFzFlHhU";

  return (
    <main className="w-full flex-1 pb-20 pt-8">
      <section className="mx-auto mb-16 w-full max-w-7xl px-6 lg:px-8">
        <div className="group relative h-[420px] w-full overflow-hidden rounded-3xl">
          <img src={shelterImage} alt={locale === "pt" ? "Interior de abrigo moderno" : "Modern shelter interior"} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 flex items-end gap-6">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-white p-2 shadow-2xl">
              <img src={profileLogo} alt={locale === "pt" ? "Logo do abrigo" : "Shelter logo"} className="h-full w-full rounded-full object-cover" />
            </div>
            <div className="pb-2 text-white">
              <h1 className="text-5xl font-black tracking-tight">{shelterName}</h1>
              <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white/90">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {dictionary.canilProfile.verifiedLabel}:{" "}
                {isVerified ? dictionary.canilProfile.verifiedValue : dictionary.canilProfile.unverifiedValue}
                {joinedDate ? ` • ${joinedDate}` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-24 grid w-full max-w-7xl grid-cols-1 gap-14 px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-10 lg:col-span-8">
          <div>
            <h2 className="mb-8 text-4xl font-black tracking-tight text-secondary">{dictionary.canilProfile.aboutTitle}</h2>
            <p className="border-l-8 border-primary/35 py-4 pl-6 text-lg italic leading-relaxed text-muted-foreground">
              {dictionary.canilProfile.aboutDescription}
            </p>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              {shelter?.missao
                ? shelter.missao
                : locale === "pt"
                  ? "A nossa equipa trabalha diariamente para garantir cuidado, seguranca e socializacao de cada animal. Priorizamos adocoes responsaveis com acompanhamento apos a entrega."
                  : "Our team works daily to ensure care, safety, and socialization for every resident. We prioritize responsible adoptions with post-adoption follow-up."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <article key={block.label} className="rounded-3xl border border-border/30 bg-muted/35 p-7 text-center transition-colors hover:bg-secondary/5">
                  <Icon className="mx-auto mb-4 h-8 w-8 text-secondary" />
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">{block.label}</p>
                  <p className="whitespace-pre-line text-sm font-bold">{block.value}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
            <h3 className="mb-3 text-2xl font-black text-primary">
              {locale === "pt" ? "Apoie o nosso trabalho" : "Support our work"}
            </h3>
            <p className="mb-7 text-sm text-muted-foreground">
              {locale === "pt"
                ? "As contribuicoes ajudam tratamentos veterinarios, alimentacao e melhoria de espacos."
                : "Contributions directly support veterinary treatment, food, and shelter improvements."}
            </p>
            <button type="button" className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-accent px-6 py-4 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:scale-[0.99]">
              <Heart className="h-4 w-4" />
              {locale === "pt" ? "Doar ao abrigo" : "Donate to shelter"}
            </button>
            <button type="button" className="w-full rounded-full border-2 border-primary px-6 py-4 text-sm font-black text-primary transition-colors hover:bg-primary/5">
              {locale === "pt" ? "Ser voluntario" : "Volunteer with us"}
            </button>
          </div>

          <div className="rounded-3xl border border-border/35 bg-muted/35 p-7 shadow-sm">
            <h4 className="mb-5 text-lg font-black text-secondary">
              {locale === "pt" ? "Estatisticas do abrigo" : "Shelter statistics"}
            </h4>
            <div className="space-y-4">
              {[
                {
                  title: dictionary.canilProfile.stats.activePets,
                  value: String(allResidents.filter((pet) => pet.status.toLowerCase().includes(locale === "pt" ? "disponivel" : "available")).length),
                },
                {
                  title: dictionary.canilProfile.stats.completedAdoptions,
                  value: String(allResidents.filter((pet) => pet.status.toLowerCase().includes(locale === "pt" ? "reserv" : "reserved")).length),
                },
                { title: dictionary.canilProfile.stats.responseTime, value: "< 2h" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.title}</span>
                  <span className="text-xl font-black text-secondary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="bg-muted/55 py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-secondary">
                {locale === "pt" ? "Residentes a procura de lar" : "Residents seeking homes"}
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {locale === "pt"
                  ? "Conhece os animais atualmente no abrigo. Todos os residentes estao vacinados e prontos para conhecer novas familias."
                  : "Meet residents currently staying at the shelter. All pets are vaccinated and ready to meet new families."}
              </p>
            </div>
            <div className="relative">
              <select className="appearance-none rounded-full border border-border bg-background px-6 py-3 pr-11 text-sm font-bold uppercase tracking-wider shadow-sm outline-none ring-0 focus:ring-2 focus:ring-secondary/20">
                <option>{locale === "pt" ? "Todas as especies" : "All species"}</option>
                <option>{locale === "pt" ? "Caes" : "Dogs"}</option>
                <option>{locale === "pt" ? "Gatos" : "Cats"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {residents.map((pet) => (
              <article
                key={pet.id}
                className="group overflow-hidden rounded-3xl border border-border/20 bg-background shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${pet.id}`}
                    alt={pet.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {pet.badge && (
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white ${
                        pet.badge === "new" ? "bg-primary" : "bg-destructive"
                      }`}
                    >
                      {pet.badge === "new" ? dictionary.petCatalog.tags.newArrival : dictionary.petCatalog.tags.urgent}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-2xl font-black text-primary">{pet.name}</h3>
                    <span className="text-base font-black text-secondary">{pet.age}</span>
                  </div>
                  <p className="mb-4 text-sm font-bold text-muted-foreground">
                    {pet.species} • {pet.sex}
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {pet.traits.map((trait) => (
                      <span key={trait} className="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                        {trait}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/${locale}/pets/${pet.id}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-secondary-foreground transition-opacity hover:opacity-90"
                  >
                    {locale === "pt" ? `Conhecer ${pet.name}` : `Meet ${pet.name}`}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary">
              {locale === "pt" ? "Ver todos os residentes" : "View all residents"}
              <ArrowDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
