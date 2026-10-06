"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PetGalleryProps = {
  photos: string[];
  name: string;
  locale: string;
  /** Overlays drawn on the main photo (status badge, favourite button). */
  children?: ReactNode;
};

export function PetGallery({
  photos,
  name,
  locale,
  children,
}: PetGalleryProps) {
  const pt = locale === "pt";
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted"
        role="region"
        aria-roledescription={pt ? "galeria" : "gallery"}
        aria-label={pt ? `Fotografias de ${name}` : `Photos of ${name}`}
        onKeyDown={(event) => {
          if (count < 2) return;
          if (event.key === "ArrowLeft") go(index - 1);
          if (event.key === "ArrowRight") go(index + 1);
        }}
      >
        {photos.map((url, i) => (
          <Image
            key={url}
            src={url}
            alt={count > 1 ? `${name} · ${i + 1}/${count}` : name}
            fill
            preload={i === 0}
            sizes="(max-width:1024px) 100vw, 55vw"
            className={`object-cover transition-opacity duration-300 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          />
        ))}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={pt ? "Fotografia anterior" : "Previous photo"}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={pt ? "Fotografia seguinte" : "Next photo"}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-5 right-5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
        {children}
      </div>
      {count > 1 && (
        <div className="-m-1 flex gap-3 overflow-x-auto p-1 [scrollbar-width:none]">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${pt ? "Ver fotografia" : "Show photo"} ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-[3px] transition sm:w-24 ${
                i === index
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
