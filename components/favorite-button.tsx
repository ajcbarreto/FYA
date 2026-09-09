"use client";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { setFavorite } from "@/app/favorites/actions";
export function FavoriteButton({
  animalId,
  locale,
  isFavorite,
  redirectTo,
  size = "sm",
  labels,
}: {
  animalId: string;
  locale: string;
  isFavorite: boolean;
  redirectTo: string;
  size?: "sm" | "lg";
  labels?: { add: string; remove: string };
}) {
  const [favorite, setOptimistic] = useOptimistic(isFavorite);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pt = locale === "pt";
  const copy = labels ?? {
    add: pt ? "Guardar animal" : "Save animal",
    remove: pt ? "Remover dos favoritos" : "Remove from favorites",
  };
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? copy.remove : copy.add}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!favorite);
          try {
            const result = await setFavorite(animalId, !favorite, locale);
            if (result.error === "login") {
              router.push(
                `/${locale}/auth/login?next=${encodeURIComponent(redirectTo.replace(new RegExp(`^/${locale}`), ""))}`,
              );
              return;
            }
            if (result.error) throw new Error(result.error);
            router.refresh();
          } catch {
            toast.error(
              pt
                ? "Não foi possível guardar. Tenta novamente."
                : "Could not save. Please try again.",
            );
          }
        })
      }
      className={
        size === "lg"
          ? "button-secondary w-full"
          : "absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition-transform hover:scale-105"
      }
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
      )}
      {size === "lg" && (favorite ? copy.remove : copy.add)}
    </button>
  );
}
