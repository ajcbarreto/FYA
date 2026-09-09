import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { Brand } from "@/components/brand";
export function SiteFooter({ locale }: { locale: Locale }) {
  const pt = locale === "pt";
  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/40">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            {pt
              ? "Ajudamos animais e pessoas a escrever a sua próxima história. Juntos."
              : "Helping animals and people write their next story. Together."}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">
            {pt ? "Encontra uma ligação" : "Find a connection"}
          </p>
          <ul className="space-y-3 text-sm">
            {[
              ["pets", pt ? "Animais para adoção" : "Animals for adoption"],
              ["canis", pt ? "Conhecer os abrigos" : "Meet the shelters"],
              ["historias", pt ? "Novos começos" : "New beginnings"],
              ["#sobre-nos", pt ? "Sobre nós" : "About us"],
            ].map(([path, label]) => (
              <li key={path}>
                <Link
                  href={`/${locale}/${path}`}
                  className="inline-flex items-center gap-2 hover:text-accent"
                >
                  {label}
                  <ArrowUpRight className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">{pt ? "Faz parte" : "Be part of it"}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {pt
              ? "Representas um abrigo? Dá a conhecer os animais que esperam por uma família."
              : "Represent a shelter? Introduce the animals waiting for a family."}
          </p>
          <Link
            href={`/${locale}/auth/shelter-registration`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          >
            {pt ? "Registar o meu abrigo" : "Register my shelter"}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border/50 px-8 py-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FYA · Found Your Animal</p>
        <p className="flex items-center gap-2">
          <Heart className="size-3 text-accent" />
          {pt
            ? "Mais encontros. Mais finais felizes."
            : "More connections. More happy endings."}
        </p>
      </div>
    </footer>
  );
}
