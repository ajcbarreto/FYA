import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PetCatalogItem } from "@/lib/pet-catalog/db-pets";
import { FavoriteButton } from "@/components/favorite-button";
export function PetCard({
  pet,
  locale,
  isFavorite,
  returnTo,
}: {
  pet: PetCatalogItem;
  locale: string;
  isFavorite?: boolean;
  returnTo?: string;
}) {
  return (
    <article className="pet-card">
      <Link
        href={`/${locale}/pets/${pet.id}${returnTo ? `?back=${encodeURIComponent(returnTo)}` : ""}`}
        className="group block"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-muted">
          <Image
            src={pet.imageUrl}
            alt={
              pet.imageUrl.includes("placeholder")
                ? locale === "pt"
                  ? "Fotografia indisponível"
                  : "Photo unavailable"
                : pet.name
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-primary">
            {pet.status}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">{pet.name}</h3>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {pet.species} · {pet.age} · {pet.sex}
          </p>
          <p className="mt-4 flex items-center gap-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {pet.location}
          </p>
        </div>
      </Link>
      {isFavorite !== undefined && (
        <FavoriteButton
          animalId={pet.id}
          locale={locale}
          isFavorite={isFavorite}
          redirectTo={returnTo ?? `/${locale}/pets`}
        />
      )}
    </article>
  );
}
