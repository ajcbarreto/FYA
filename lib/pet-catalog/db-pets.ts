import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listPhotosForAnimals,
  listPrimaryPhotosForAnimals,
} from "@/lib/canil/animal-photos";
import {
  sexLabel,
  sizeLabel,
  speciesLabel,
  statusLabel,
} from "@/lib/i18n/animals";

export type PetCatalogItem = {
  id: string;
  name: string;
  age: string;
  species: string;
  sex: string;
  traits: string[];
  badge?: "new" | "urgent";
  location: string;
  shelterId: string;
  shelterName: string;
  description: string;
  status: string;
  imageUrl: string;
  imageUrls?: string[];
};

export type AnimalRow = {
  id: string;
  canil_id: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string | null;
  idade_anos: number | null;
  porte: string | null;
  status: string;
  descricao: string | null;
  canis:
    | { nome: string; localizacao: string }
    | { nome: string; localizacao: string }[]
    | null;
};

type CatalogPetsQueryOptions = {
  search?: string;
  limit?: number;
  page?: number;
  species?: string;
  sex?: string;
  size?: string;
  status?: string;
  location?: string;
  age?: string;
  compatibility?: string;
};

function toTitleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapAgeLabel(ageYears: number | null, locale: string) {
  if (ageYears === null || Number.isNaN(ageYears)) {
    return locale === "pt" ? "Idade n/d" : "Age n/a";
  }

  if (locale === "pt") {
    return `${ageYears} ${ageYears === 1 ? "ano" : "anos"}`;
  }

  return `${ageYears} ${ageYears === 1 ? "year" : "years"}`;
}

function mapSizeTrait(size: string | null, locale: string) {
  if (!size) return locale === "pt" ? "Porte n/d" : "Size n/a";
  return locale === "pt"
    ? `Porte ${sizeLabel(size, locale).toLowerCase()}`
    : `${sizeLabel(size, locale)} size`;
}

function extractShelter(canis: AnimalRow["canis"]) {
  if (!canis) return null;
  return Array.isArray(canis) ? (canis[0] ?? null) : canis;
}

export function toCatalogItem(
  animal: AnimalRow,
  locale: string,
  photoOverride?: string,
): PetCatalogItem {
  const shelter = extractShelter(animal.canis);
  const speciesText = speciesLabel(animal.especie, locale);
  const breed = animal.raca ? toTitleCase(animal.raca) : speciesText;
  const sex = sexLabel(animal.sexo, locale);
  const status = statusLabel(animal.status, locale);

  return {
    id: animal.id,
    name: animal.nome,
    age: mapAgeLabel(animal.idade_anos, locale),
    species: breed,
    sex,
    traits: [mapSizeTrait(animal.porte, locale), status],
    location:
      shelter?.localizacao ??
      (locale === "pt" ? "Localizacao n/d" : "Location n/a"),
    shelterId: animal.canil_id,
    shelterName:
      shelter?.nome ?? (locale === "pt" ? "Abrigo n/d" : "Shelter n/a"),
    description: animal.descricao ?? "",
    status,
    imageUrl: photoOverride ?? "/animal-placeholder.svg",
  };
}

async function applyPhotoOverrides(
  supabase: SupabaseClient,
  animals: AnimalRow[],
  locale: string,
): Promise<PetCatalogItem[]> {
  if (animals.length === 0) return [];
  const photoMap = await listPhotosForAnimals(
    supabase,
    animals.map((animal) => animal.id),
  );
  return animals.map((animal) => {
    const imageUrls = photoMap.get(animal.id) ?? [];
    return {
      ...toCatalogItem(animal, locale, imageUrls[0]),
      imageUrls,
    };
  });
}

export async function getCatalogPets(
  supabase: SupabaseClient,
  locale: string,
  options: CatalogPetsQueryOptions = {},
) {
  let query = supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis!inner(nome,localizacao)",
    )
    .order("created_at", { ascending: false });

  const normalizedSearch = options.search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_")
      .replace(/[(),.\\]/g, " ");
    query = query.or(
      `nome.ilike.%${escaped}%,raca.ilike.%${escaped}%,descricao.ilike.%${escaped}%`,
    );
  }
  if (options.location)
    query = query.ilike(
      "canis.localizacao",
      `%${options.location.replace(/[%_]/g, "")}%`,
    );
  if (options.compatibility)
    query = query.contains("compatibilidades", [options.compatibility]);
  if (options.age === "baby") query = query.lt("idade_anos", 1);
  if (options.age === "young")
    query = query.gte("idade_anos", 1).lt("idade_anos", 3);
  if (options.age === "adult")
    query = query.gte("idade_anos", 3).lt("idade_anos", 7);
  if (options.age === "senior") query = query.gte("idade_anos", 7);
  if (options.species) {
    query = query.eq("especie", options.species);
  }
  if (options.sex) {
    query = query.eq("sexo", options.sex);
  }
  if (options.size) {
    query = query.eq("porte", options.size);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  } else {
    query = query.neq("status", "adotado");
  }
  if (options.limit && options.limit > 0) {
    const page = Math.max(1, options.page ?? 1);
    const from = (page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error || !data) {
    if (error) {
      console.error("[getCatalogPets] Supabase error:", error.message);
    }
    throw new Error("Catalog data unavailable");
  }

  return applyPhotoOverrides(supabase, data as AnimalRow[], locale);
}

export async function getCatalogPetsCount(
  supabase: SupabaseClient,
  options: Pick<
    CatalogPetsQueryOptions,
    | "search"
    | "species"
    | "sex"
    | "size"
    | "status"
    | "location"
    | "age"
    | "compatibility"
  > = {},
) {
  let query = supabase
    .from("animais")
    .select("id,canis!inner(localizacao)", { count: "exact", head: true });
  const normalizedSearch = options.search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_")
      .replace(/[(),.\\]/g, " ");
    query = query.or(
      `nome.ilike.%${escaped}%,raca.ilike.%${escaped}%,descricao.ilike.%${escaped}%`,
    );
  }
  if (options.location)
    query = query.ilike(
      "canis.localizacao",
      `%${options.location.replace(/[%_]/g, "")}%`,
    );
  if (options.compatibility)
    query = query.contains("compatibilidades", [options.compatibility]);
  if (options.age === "baby") query = query.lt("idade_anos", 1);
  if (options.age === "young")
    query = query.gte("idade_anos", 1).lt("idade_anos", 3);
  if (options.age === "adult")
    query = query.gte("idade_anos", 3).lt("idade_anos", 7);
  if (options.age === "senior") query = query.gte("idade_anos", 7);
  if (options.species) {
    query = query.eq("especie", options.species);
  }
  if (options.sex) {
    query = query.eq("sexo", options.sex);
  }
  if (options.size) {
    query = query.eq("porte", options.size);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  } else {
    query = query.neq("status", "adotado");
  }

  const { count, error } = await query;
  if (error) {
    console.error("[getCatalogPetsCount] Supabase error:", error.message);
    throw new Error("Catalog count unavailable", { cause: error });
  }

  return count ?? 0;
}

export async function getAdoptedPets(
  supabase: SupabaseClient,
  locale: string,
  limit = 24,
) {
  const { data, error } = await supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis!inner(nome,localizacao)",
    )
    .eq("status", "adotado")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("[getAdoptedPets] Supabase error:", error.message);
    throw new Error("Catalog data unavailable");
  }

  return applyPhotoOverrides(supabase, data as AnimalRow[], locale);
}

export async function getPetById(
  supabase: SupabaseClient,
  petId: string,
  locale: string,
) {
  const { data, error } = await supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis!inner(nome,localizacao)",
    )
    .eq("id", petId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[getPetById] Supabase error:", error.message);
    }
    return null;
  }

  const animal = data as AnimalRow;
  const photoMap = await listPrimaryPhotosForAnimals(supabase, [animal.id]);
  return toCatalogItem(animal, locale, photoMap.get(animal.id));
}

export async function getRelatedPets(
  supabase: SupabaseClient,
  petId: string,
  locale: string,
  limit = 3,
) {
  const { data: current } = await supabase
    .from("animais")
    .select("canil_id")
    .eq("id", petId)
    .maybeSingle();
  const currentCanilId = current?.canil_id ?? null;

  const baseQuery = supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis!inner(nome,localizacao)",
    )
    .neq("id", petId)
    .neq("status", "adotado")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = currentCanilId
    ? await baseQuery.eq("canil_id", currentCanilId)
    : await baseQuery;

  if (error || !data) {
    if (error) {
      console.error("[getRelatedPets] Supabase error:", error.message);
    }
    throw new Error("Catalog data unavailable");
  }

  return applyPhotoOverrides(supabase, data as AnimalRow[], locale);
}
