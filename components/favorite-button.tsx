import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/favorites/actions";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const favoriteButton = getDictionary(locale as Locale).favoriteButton;
  const buttonLabels = labels ?? {
    add: favoriteButton.save,
    remove: favoriteButton.remove,
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
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
            isFavorite
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:border-primary/40 hover:bg-muted"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? buttonLabels.remove : buttonLabels.add}
        </button>
      </form>
    );
  }

  return (
    <form action={toggleFavorite} className="absolute right-2.5 top-2.5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="animalId" value={animalId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="action" value={isFavorite ? "remove" : "add"} />
      <button
        type="submit"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? buttonLabels.remove : buttonLabels.add}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all ${
          isFavorite
            ? "bg-primary text-primary-foreground"
            : "bg-white/70 text-foreground hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </form>
  );
}
