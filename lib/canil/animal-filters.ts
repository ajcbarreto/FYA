import type { PetCatalogItem } from "../pet-catalog/db-pets";
export type ShelterAnimal = PetCatalogItem & {
  speciesCode: string;
  sizeCode: string;
  ageYears: number | null;
  statusCode: string;
};
export type AnimalFilters = {
  status: string;
  species: string;
  size: string;
  age: string;
  query: string;
};
export const initialAnimalFilters: AnimalFilters = {
  status: "disponivel",
  species: "",
  size: "",
  age: "",
  query: "",
};
const normalise = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function filterShelterAnimals(
  animals: ShelterAnimal[],
  filters: AnimalFilters,
) {
  const query = normalise(filters.query.trim());
  return animals.filter(
    (a) =>
      a.statusCode === filters.status &&
      (!filters.species || a.speciesCode === filters.species) &&
      (!filters.size || a.sizeCode === filters.size) &&
      (!query || normalise(`${a.name} ${a.species}`).includes(query)) &&
      (!filters.age ||
        (a.ageYears !== null &&
          (filters.age === "young"
            ? a.ageYears < 1
            : filters.age === "adult"
              ? a.ageYears >= 1 && a.ageYears < 8
              : a.ageYears >= 8))),
  );
}
