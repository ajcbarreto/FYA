import test from "node:test";
import assert from "node:assert/strict";
import { filterDirectory } from "../lib/canil/directory-filters.ts";
test("directory combines location, literal accent-insensitive search and availability for the same species", () => {
  const shelters = [
    {
      id: "a",
      nome: "Árvore",
      localizacao: "Évora",
      missao: "Acolhemos animais",
    },
    { id: "b", nome: "Bairro", localizacao: "Lisboa", missao: null },
    { id: "c", nome: "Casa", localizacao: "Évora", missao: null },
  ];
  const animals = [
    { canil_id: "a", especie: "cao", status: "adotado" },
    { canil_id: "a", especie: "gato", status: "disponivel" },
    { canil_id: "b", especie: "cao", status: "disponivel" },
    { canil_id: "b", especie: "cao", status: "disponivel" },
  ];
  const initial = {
      query: "",
      location: "",
      species: "",
      available: false,
      sort: "name",
    },
    ids = (f) =>
      filterDirectory(shelters, animals, { ...initial, ...f }).map((s) => s.id);
  assert.deepEqual(ids({ query: "arvore" }), ["a"]);
  assert.deepEqual(ids({ location: "evora" }), ["a", "c"]);
  assert.deepEqual(ids({ species: "cao", available: true }), ["b"]);
  assert.deepEqual(
    ids({ location: "evora", species: "cao", available: true }),
    [],
  );
  assert.deepEqual(ids({ species: "cao" }), ["a", "b"]);
  assert.deepEqual(ids({ sort: "available" }), ["b", "a", "c"]);
  assert.deepEqual(ids({ query: "%,)" }), []);
  assert.deepEqual(ids({}), ["a", "b", "c"]);
});
