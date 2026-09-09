import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, PawPrint } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export function AboutFamily({ locale }: { locale: Locale }) {
  const pt = locale === "pt";
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
            alt={
              pt
                ? "Retrato ilustrado da família FYA: o casal e o filho junto ao rio"
                : "Illustrated portrait of the FYA family: the couple and their son by the river"
            }
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
          <p className="display-title text-2xl sm:text-3xl">
            {pt
              ? "Uma família. Uma paixão em comum."
              : "One family. One shared passion."}
          </p>
        </div>
        <span className="absolute -right-2 bottom-10 flex size-16 rotate-12 items-center justify-center rounded-full bg-[#e9edb9] text-primary">
          <PawPrint aria-hidden="true" className="size-7" />
        </span>
      </div>
      <div>
        <p className="eyebrow">{pt ? "Sobre nós" : "About us"}</p>
        <h2
          id="about-family-title"
          className="display-title mt-4 text-4xl sm:text-5xl"
        >
          {pt
            ? "O amor pelos animais começa em casa."
            : "Our love for animals starts at home."}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            {pt
              ? "Somos uma família — um casal e o nosso filho — unida pela paixão pelos animais. A FYA nasce dessa ligação e da vontade de a transformar em ajuda para quem mais precisa."
              : "We are a family — a couple and our son — brought together by a love of animals. FYA grows out of that bond and our wish to turn it into help for those who need it most."}
          </p>
          <p>
            {pt
              ? "Queremos dar mais visibilidade aos animais dos canis e abrigos e ajudar os animais abandonados a encontrar uma família. Aproximamos quem cuida deles de quem está pronto para lhes abrir a porta de casa, com tempo, carinho e responsabilidade."
              : "We want to give animals in shelters more visibility and help abandoned animals find a family. We connect the people caring for them with those ready to welcome them home with time, kindness and responsibility."}
          </p>
        </div>
        <p className="mt-7 border-l-2 border-accent pl-5 font-serif text-2xl italic leading-relaxed text-primary">
          {pt
            ? "Porque todos merecem um lugar onde pertencer."
            : "Because everyone deserves a place to belong."}
        </p>
        <Link href={`/${locale}/pets`} className="button-secondary mt-8">
          {pt
            ? "Conhece quem espera por uma família"
            : "Meet those waiting for a family"}
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </div>
    </section>
  );
}
