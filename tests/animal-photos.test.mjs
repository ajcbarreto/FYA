import { test } from "node:test";
import assert from "node:assert/strict";
import {
  listPhotosForAnimals,
  listPrimaryPhotosForAnimals,
} from "../lib/canil/animal-photos.ts";

function photoClient(rows, error = null) {
  const query = {
    select() {
      return this;
    },
    in(column, ids) {
      assert.equal(column, "animal_id");
      assert.deepEqual(ids, ["a", "b"]);
      return this;
    },
    order(column, { ascending }) {
      rows = [...rows].sort((a, b) => {
        const direction = ascending ? 1 : -1;
        return a[column] < b[column]
          ? -direction
          : a[column] > b[column]
            ? direction
            : 0;
      });
      // Model the query's primary-first, newest-first ordering.
      if (column === "created_at")
        rows.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
      return this;
    },
    then(resolve) {
      return Promise.resolve({ data: rows, error }).then(resolve);
    },
  };
  return {
    from(table) {
      assert.equal(table, "animal_fotos");
      return query;
    },
  };
}

const rows = [
  {
    animal_id: "a",
    public_url: "new.jpg",
    is_primary: false,
    created_at: "2026-03-01",
  },
  {
    animal_id: "a",
    public_url: "cover.jpg",
    is_primary: true,
    created_at: "2026-01-01",
  },
  {
    animal_id: "a",
    public_url: "old.jpg",
    is_primary: false,
    created_at: "2025-01-01",
  },
  {
    animal_id: "a",
    public_url: "new.jpg",
    is_primary: false,
    created_at: "2026-02-01",
  },
  {
    animal_id: "b",
    public_url: null,
    is_primary: true,
    created_at: "2026-01-01",
  },
];

test("batch photos retain the cover first, deduplicate URLs and omit unavailable photos", async () => {
  const photos = await listPhotosForAnimals(photoClient(rows), ["a", "b"]);
  assert.deepEqual([...photos], [["a", ["cover.jpg", "new.jpg", "old.jpg"]]]);
  const primary = await listPrimaryPhotosForAnimals(photoClient(rows), [
    "a",
    "b",
  ]);
  assert.deepEqual([...primary], [["a", "cover.jpg"]]);
});

test("animals without photos return an empty map and empty requests skip the query", async () => {
  assert.equal((await listPhotosForAnimals({}, [])).size, 0);
  assert.equal(
    (await listPhotosForAnimals(photoClient([]), ["a", "b"])).size,
    0,
  );
});

test("photo query errors propagate", async () => {
  await assert.rejects(
    listPhotosForAnimals(photoClient([], { message: "unavailable" }), [
      "a",
      "b",
    ]),
    /Unable to load data/,
  );
});
