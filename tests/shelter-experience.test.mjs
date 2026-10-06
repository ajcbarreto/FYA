import test from "node:test";
import assert from "node:assert/strict";
import {
  filterShelterAnimals,
  initialAnimalFilters,
} from "../lib/canil/animal-filters.ts";
import {
  hasShelterExperience,
  missingFeature,
} from "../lib/canil/public-experience.ts";
test("shelter filters use canonical species, size, age and adoption status", () => {
  const common = {
    speciesCode: "cao",
    sizeCode: "medio",
    ageYears: 2,
    statusCode: "disponivel",
    name: "Ágata",
    species: "Labrador",
  };
  const pets = [
    { ...common, id: "adult" },
    { ...common, id: "adopted", statusCode: "adotado" },
    { ...common, id: "young", ageYears: 0 },
    { ...common, id: "unknown", ageYears: null },
    {
      ...common,
      id: "cat",
      speciesCode: "gato",
      sizeCode: "pequeno",
      ageYears: 8,
    },
  ];
  const ids = (f) =>
    filterShelterAnimals(pets, { ...initialAnimalFilters, ...f }).map(
      (a) => a.id,
    );
  assert.deepEqual(ids({ query: "agata", age: "adult" }), ["adult"]);
  assert.deepEqual(ids({ age: "young" }), ["young"]);
  assert.deepEqual(ids({ species: "gato", age: "senior", size: "pequeno" }), [
    "cat",
  ]);
  assert.deepEqual(ids({ status: "adotado" }), ["adopted"]);
  assert.deepEqual(ids({ query: "unknown" }), []);
  assert.equal(ids({}).includes("unknown"), true);
});
test("missing migration disables new forms; authentication and other failures still surface", async () => {
  assert.equal(
    await hasShelterExperience({
      rpc: async () => ({
        data: null,
        error: {
          code: "PGRST202",
          message: "Could not find public.shelter_experience_version",
        },
      }),
    }),
    false,
  );
  assert.equal(
    await hasShelterExperience({ rpc: async () => ({ data: 1, error: null }) }),
    true,
  );
  assert.equal(
    missingFeature(
      { code: "PGRST205", message: "Could not find public.support_projects" },
      "support_projects",
    ),
    true,
  );
  const error = { message: "Invalid API key" };
  await assert.rejects(
    hasShelterExperience({ rpc: async () => ({ data: null, error }) }),
    (e) => e.cause === error,
  );
  assert.equal(
    missingFeature(
      { code: "42703", message: "column support_projects.goal does not exist" },
      "support_projects",
    ),
    false,
  );
});
