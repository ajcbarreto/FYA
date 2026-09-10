"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PetCardPhotos({
  name,
  imageUrls,
  status,
  locale,
  href,
}: {
  name: string;
  imageUrls: string[];
  status: string;
  locale: string;
  href: string;
}) {
  const [index, setIndex] = useState(0);
  const pt = locale === "pt";
  const imageUrl = imageUrls[index] ?? "/animal-placeholder.svg";
  const multiple = imageUrls.length > 1;
  const position = pt
    ? `Fotografia ${index + 1} de ${imageUrls.length}`
    : `Photo ${index + 1} of ${imageUrls.length}`;

  return (
    <div className="relative aspect-[5/4] overflow-hidden bg-muted">
      <Link href={href} className="group absolute inset-0 block">
        <Image
          src={imageUrl}
          alt={
            imageUrl.includes("placeholder")
              ? pt
                ? "Fotografia indisponível"
                : "Photo unavailable"
              : multiple
                ? `${name} — ${position}`
                : name
          }
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-primary">
        {status}
      </span>
      {multiple && (
        <>
          <button
            type="button"
            aria-label={`${pt ? "Fotografia anterior de" : "Previous photo of"} ${name}`}
            onClick={() =>
              setIndex(
                (current) =>
                  (current - 1 + imageUrls.length) % imageUrls.length,
              )
            }
            className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`${pt ? "Fotografia seguinte de" : "Next photo of"} ${name}`}
            onClick={() =>
              setIndex((current) => (current + 1) % imageUrls.length)
            }
            className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-primary"
          >
            <span aria-hidden="true">
              {index + 1}/{imageUrls.length}
            </span>
            <span className="sr-only">
              {name}: {position}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
