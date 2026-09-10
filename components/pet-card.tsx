import { PetCardPhotos } from "@/components/pet-card-photos";
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
  const href = `/${locale}/pets/${pet.id}${returnTo ? `?back=${encodeURIComponent(returnTo)}` : ""}`;
  return (
    <article className="pet-card">
      <PetCardPhotos
        key={JSON.stringify([pet.id, pet.imageUrls, pet.imageUrl])}
        name={pet.name}
        imageUrls={pet.imageUrls?.length ? pet.imageUrls : [pet.imageUrl]}
        status={pet.status}
        locale={locale}
        href={href}
      />
      <Link href={href} className="group block">
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
