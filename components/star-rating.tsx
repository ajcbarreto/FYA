import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  size?: "sm" | "md";
  className?: string;
};

export function StarRating({ value, size = "sm", className = "" }: StarRatingProps) {
  const starClass = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  const rounded = Math.round(value);

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClass} ${star <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </span>
  );
}
