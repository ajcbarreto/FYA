import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getFavoritesForUser } from "@/lib/favorites/db";
import { toggleFavorite } from "@/app/favorites/actions";

type UserFavoritesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function UserFavoritesPage({ params }: UserFavoritesPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/user/favoritos`);
  }

  const favorites = await getFavoritesForUser(supabase, user.id, locale);
  const copy =
    locale === "pt"
      ? {
          title: "Os meus favoritos",
          subtitle: "Animais que guardaste para reveres mais tarde.",
          empty: "Ainda nao tens favoritos. Explora o catalogo e guarda os animais que mais gostares.",
          browse: "Explorar catalogo",
          remove: "Remover",
          view: "Ver detalhes",
        }
      : {
          title: "My favorites",
          subtitle: "Pets you have saved to revisit later.",
          empty: "No favorites yet. Browse the catalog and save the pets you like.",
          browse: "Browse catalog",
          remove: "Remove",
          view: "View details",
        };

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      {favorites.length === 0 ? (
        <section className="rounded-3xl border border-border/20 bg-card p-8 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
          <Link
            href={`/${locale}/pets`}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {copy.browse}
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((pet) => (
            <article
              key={pet.id}
              className="overflow-hidden rounded-2xl border border-border/20 bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/${locale}/pets/${pet.id}`} className="block">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{pet.name}</h2>
                    <p className="text-sm font-bold text-primary">{pet.age}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pet.species} • {pet.sex}
                  </p>
                  <p className="text-xs text-muted-foreground">{pet.location}</p>
                </div>
              </Link>
              <form action={toggleFavorite} className="border-t border-border/20 px-5 py-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="animalId" value={pet.id} />
                <input type="hidden" name="redirectTo" value={`/${locale}/user/favoritos`} />
                <input type="hidden" name="action" value="remove" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  {copy.remove}
                </button>
              </form>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
