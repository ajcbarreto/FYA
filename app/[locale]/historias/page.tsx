import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart, PawPrint } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAdoptedPets } from "@/lib/pet-catalog/db-pets";
import { staticPageMetadata } from "@/lib/seo/metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "stories");
}

type SuccessStoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SuccessStoriesPage({
  params,
}: SuccessStoriesPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const adopted = await getAdoptedPets(supabase, locale, 36);

  const copy =
    locale === "pt"
      ? {
          eyebrow: "Adoções concluídas",
          title: "Animais que já foram adotados",
          subtitle:
            "Adoções concluídas através dos canis e associações da FYA.",
          stat: (count: number) =>
            `${count} ${count === 1 ? "amigo encontrou lar" : "amigos encontraram lar"}`,
          empty:
            "Ainda não há adoções concluídas registadas. Quando houver, aparecem aqui.",
          browse: "Explorar animais para adoção",
          foundHome: "encontrou um lar",
          via: "através de",
        }
      : {
          eyebrow: "Completed adoptions",
          title: "Animals that have been adopted",
          subtitle:
            "Adoptions completed through shelters and rescue groups on FYA.",
          stat: (count: number) =>
            `${count} ${count === 1 ? "friend found a home" : "friends found a home"}`,
          empty:
            "No completed adoptions have been recorded yet. They will appear here when there are.",
          browse: "Browse pets for adoption",
          foundHome: "found a home",
          via: "via",
        };

  return (
    <main id="main-content" tabIndex={-1} className="w-full flex-1 pb-16 pt-10">
      <section className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-secondary p-10 text-center text-white md:p-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {copy.eyebrow}
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/85">{copy.subtitle}</p>
          {adopted.length > 0 && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-bold">
              <Heart className="h-4 w-4 fill-current" />
              {copy.stat(adopted.length)}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-8">
        {adopted.length === 0 ? (
          <div className="rounded-3xl border border-border/40 bg-card p-12 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{copy.empty}</p>
            <Link
              href={`/${locale}/pets`}
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              {copy.browse}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
            {adopted.map((pet) => (
              <article
                key={pet.id}
                className="overflow-hidden rounded-2xl border border-border/40 bg-card"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                    <Heart className="h-3 w-3 fill-current" />
                    {copy.foundHome}
                  </span>
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="truncate text-base font-bold">{pet.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {copy.via} {pet.shelterName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
