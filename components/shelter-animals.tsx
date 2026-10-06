"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  filterShelterAnimals,
  initialAnimalFilters,
  type AnimalFilters,
  type ShelterAnimal,
} from "@/lib/canil/animal-filters";
export function ShelterAnimals({
  animals,
  locale,
}: {
  animals: ShelterAnimal[];
  locale: string;
}) {
  const pt = locale === "pt";
  const [filters, setFilters] = useState(initialAnimalFilters),
    [limit, setLimit] = useState(6);
  const update = (key: keyof AnimalFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setLimit(6);
  };
  const visible = filterShelterAnimals(animals, filters);
  const statuses = [
    ["disponivel", pt ? "Para adoção" : "For adoption"],
    ["reservado", pt ? "Em processo" : "In progress"],
    ["adotado", pt ? "Já adotados" : "Already adopted"],
  ];
  return (
    <section
      id="animais"
      aria-labelledby="shelter-animals-title"
      className="scroll-mt-24 rounded-3xl border bg-card p-4 sm:p-6"
    >
      <h2 id="shelter-animals-title" className="text-xl font-bold">
        {pt ? "Animais do canil" : "Shelter animals"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {pt
          ? "Encontra um companheiro e conhece a sua história antes de te candidatares."
          : "Find a companion and learn their story before applying."}
      </p>
      <div
        className="my-4 flex flex-wrap gap-2"
        role="group"
        aria-label={pt ? "Estado de adoção" : "Adoption status"}
      >
        {statuses.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.status === value}
            onClick={() => update("status", value)}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${filters.status === value ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
          >
            {label}{" "}
            <span className="ml-1">
              ({animals.filter((a) => a.statusCode === value).length})
            </span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          {pt ? "Nome ou raça" : "Name or breed"}
          <input
            className="field"
            type="search"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            placeholder={pt ? "Procurar animal…" : "Find an animal…"}
          />
        </label>
        <label className="text-sm font-medium">
          {pt ? "Espécie" : "Species"}
          <select
            className="field"
            value={filters.species}
            onChange={(e) => update("species", e.target.value)}
          >
            <option value="">{pt ? "Todas" : "All"}</option>
            <option value="cao">{pt ? "Cães" : "Dogs"}</option>
            <option value="gato">{pt ? "Gatos" : "Cats"}</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          {pt ? "Porte" : "Size"}
          <select
            className="field"
            value={filters.size}
            onChange={(e) => update("size", e.target.value)}
          >
            <option value="">{pt ? "Todos" : "All"}</option>
            <option value="pequeno">{pt ? "Pequeno" : "Small"}</option>
            <option value="medio">{pt ? "Médio" : "Medium"}</option>
            <option value="grande">{pt ? "Grande" : "Large"}</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          {pt ? "Idade" : "Age"}
          <select
            className="field"
            value={filters.age}
            onChange={(e) => update("age", e.target.value)}
          >
            <option value="">{pt ? "Todas" : "All"}</option>
            <option value="young">
              {pt ? "Menos de 1 ano" : "Under 1 year"}
            </option>
            <option value="adult">{pt ? "1 a 7 anos" : "1 to 7 years"}</option>
            <option value="senior">
              {pt ? "8 anos ou mais" : "8 years or older"}
            </option>
          </select>
        </label>
      </div>
      <div className="my-3 flex flex-wrap items-center justify-between gap-2">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {visible.length} {pt ? "resultados" : "results"}
        </p>
        <button
          type="button"
          className="min-h-11 px-2 text-sm font-semibold underline"
          onClick={() => {
            setFilters(initialAnimalFilters);
            setLimit(6);
          }}
        >
          {pt ? "Limpar filtros" : "Clear filters"}
        </button>
      </div>
      {!visible.length ? (
        <div className="rounded-2xl bg-muted p-5">
          <p>
            {pt
              ? "Não há animais com estes filtros. Experimenta outra pesquisa ou consulta os outros estados."
              : "No animals match these filters. Try another search or status."}
          </p>
          <a
            className="mt-2 inline-flex min-h-11 items-center font-semibold underline"
            href="#contactos"
          >
            {pt ? "Falar com o canil" : "Contact the shelter"}
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.slice(0, limit).map((pet) => (
            <Link
              key={pet.id}
              href={`/${locale}/pets/${pet.id}`}
              className="flex overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md sm:block"
            >
              <div className="relative aspect-square w-24 shrink-0 self-start sm:w-full">
                <Image
                  src={pet.imageUrl}
                  alt={pet.name}
                  fill
                  sizes="(max-width: 639px) 96px, (max-width: 1023px) 45vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 space-y-1 break-words p-3 sm:p-4">
                <h3 className="font-bold">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.age} · {pet.species}
                </p>
                <p className="text-sm font-medium">{pet.status}</p>
                <span className="inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
                  {pt ? "Conhecer melhor" : "Meet this animal"}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {visible.length > limit && (
        <button
          type="button"
          className="button-secondary mt-5 w-full"
          onClick={() => setLimit((n) => n + 6)}
        >
          {pt ? "Mostrar mais animais" : "Show more animals"} (
          {visible.length - limit})
        </button>
      )}
    </section>
  );
}
