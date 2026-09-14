import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, PawPrint } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function AboutFamily({ locale }: { locale: Locale }) {
  const { aboutFamily } = getDictionary(locale);

  return (
    <section
      id="sobre-nos"
      aria-labelledby="about-family-title"
      className="page-shell grid items-center gap-10 lg:grid-cols-[.9fr_1fr] lg:gap-20"
    >
      <div className="relative rounded-[2rem] bg-[#ece6db] p-6 sm:p-10">
        <div className="relative aspect-square overflow-hidden rounded-[45%_45%_1.5rem_1.5rem] border border-primary/15 bg-[#f7f3eb]">
          <Image
            src="/family-illustrated.webp"
            alt={aboutFamily.imageAlt}
            fill
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="mt-5 flex items-start gap-3 text-primary">
          <Heart
            aria-hidden="true"
            className="mt-1 size-6 shrink-0"
            strokeWidth={1.25}
          />
          <p className="display-title text-2xl sm:text-3xl">{aboutFamily.quote}</p>
        </div>
        <span className="absolute -right-2 bottom-10 flex size-16 rotate-12 items-center justify-center rounded-full bg-[#e9edb9] text-primary">
          <PawPrint aria-hidden="true" className="size-7" />
        </span>
      </div>
      <div>
        <p className="eyebrow">{aboutFamily.eyebrow}</p>
        <h2
          id="about-family-title"
          className="display-title mt-4 text-4xl sm:text-5xl"
        >
          {aboutFamily.title}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
          <p>{aboutFamily.paragraph1}</p>
          <p>{aboutFamily.paragraph2}</p>
        </div>
        <p className="mt-7 border-l-2 border-accent pl-5 font-serif text-2xl italic leading-relaxed text-primary">
          {aboutFamily.closingQuote}
        </p>
        <Link href={`/${locale}/pets`} className="button-secondary mt-8">
          {aboutFamily.cta}
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </div>
    </section>
  );
}
