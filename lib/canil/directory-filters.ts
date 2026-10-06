export type DirectoryAnimal = {
  canil_id: string;
  especie: string;
  status: string;
};
export type DirectoryShelter = {
  id: string;
  nome: string;
  localizacao: string;
  missao: string | null;
};
export type DirectoryFilters = {
  query: string;
  location: string;
  species: string;
  available: boolean;
  sort: string;
};
export function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt")
    .trim();
}
export function filterDirectory<T extends DirectoryShelter>(
  shelters: T[],
  animals: DirectoryAnimal[],
  filters: DirectoryFilters,
): T[] {
  const counts = new Map<string, number>(),
    matching = new Set<string>();
  for (const a of animals) {
    if (a.status === "disponivel")
      counts.set(a.canil_id, (counts.get(a.canil_id) ?? 0) + 1);
    if (
      (!filters.species || a.especie === filters.species) &&
      (!filters.available || a.status === "disponivel")
    )
      matching.add(a.canil_id);
  }
  const query = normalized(filters.query);
  return shelters
    .filter(
      (s) =>
        (!query ||
          normalized(`${s.nome} ${s.localizacao} ${s.missao ?? ""}`).includes(
            query,
          )) &&
        (!filters.location ||
          normalized(s.localizacao) === normalized(filters.location)) &&
        (!(filters.species || filters.available) || matching.has(s.id)),
    )
    .sort((a, b) =>
      filters.sort === "available"
        ? (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
          a.nome.localeCompare(b.nome, "pt")
        : a.nome.localeCompare(b.nome, "pt"),
    );
}
