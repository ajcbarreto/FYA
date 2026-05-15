import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/favorites/actions";

type FavoriteButtonProps = {
  animalId: string;
  locale: string;
  isFavorite: boolean;
  redirectTo: string;
  size?: "sm" | "lg";
  labels?: {
    add: string;
    remove: string;
  };
};

export function FavoriteButton({
  animalId,
  locale,
  isFavorite,
  redirectTo,
  size = "sm",
  labels,
}: FavoriteButtonProps) {
  const buttonLabels = labels ?? {
    add: locale === "pt" ? "Guardar pet" : "Save pet",
    remove: locale === "pt" ? "Remover dos favoritos" : "Remove from favorites",
  };

  if (size === "lg") {
    return (
      <form action={toggleFavorite}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="animalId" value={animalId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="action" value={isFavorite ? "remove" : "add"} />
        <button
          type="submit"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? buttonLabels.remove : buttonLabels.add}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full border-2 px-5 py-3.5 text-base font-bold transition-colors ${
            isFavorite
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary text-primary hover:bg-primary/5"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? buttonLabels.remove : buttonLabels.add}
        </button>
      </form>
    );
  }

  return (
    <form action={toggleFavorite} className="absolute right-4 top-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="animalId" value={animalId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="action" value={isFavorite ? "remove" : "add"} />
      <button
        type="submit"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? buttonLabels.remove : buttonLabels.add}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all ${
          isFavorite
            ? "bg-primary text-primary-foreground"
            : "bg-white/40 text-white hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </form>
  );
}
