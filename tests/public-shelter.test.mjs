import test from "node:test";
import assert from "node:assert/strict";
import { getPublicShelterById } from "../lib/canil/public-shelter.ts";
function client(result) {
  return {
    from(table) {
      assert.equal(table, "canis");
      return {
        select() {
          return this;
        },
        eq(column, id) {
          assert.equal(column, "id");
          assert.equal(id, "shelter-id");
          return this;
        },
        async maybeSingle() {
          return result;
        },
      };
    },
  };
}
test("only a successful empty shelter query means not found", async () => {
  assert.equal(
    await getPublicShelterById(
      client({ data: null, error: null }),
      "shelter-id",
    ),
    null,
  );
  const shelter = { id: "shelter-id", nome: "Abrigo" };
  assert.deepEqual(
    await getPublicShelterById(
      client({ data: shelter, error: null }),
      "shelter-id",
    ),
    shelter,
  );
});
test("invalid keys, missing migrations and network errors never become a false 404", async () => {
  for (const error of [
    { message: "Invalid API key" },
    { code: "42703", message: "column canis.donation_url does not exist" },
    { message: "fetch failed" },
  ]) {
    await assert.rejects(
      getPublicShelterById(client({ data: null, error }), "shelter-id"),
      (e) => e.cause === error,
    );
  }
});

test("missing optional image column retries list and detail without losing shelters", async () => {
  const { readPublicShelterQuery } =
    await import("../lib/canil/public-shelter.ts");
  for (const data of [
    { id: "a", nome: "Abrigo" },
    [{ id: "a", nome: "Abrigo" }],
    null,
  ]) {
    const selections = [];
    const result = await readPublicShelterQuery(async (selection) => {
      selections.push(selection);
      return selections.length === 1
        ? {
            data: null,
            error: {
              code: "42703",
              message: "column canis.image_url does not exist",
            },
          }
        : { data, error: null };
    });
    assert.equal(selections.length, 2);
    assert.equal(selections[0].includes("image_url"), true);
    assert.equal(selections[1].includes("image_url"), false);
    assert.equal(selections[1].includes("donation_url"), true);
    assert.deepEqual(
      result,
      data === null
        ? null
        : Array.isArray(data)
          ? [{ ...data[0], image_url: null }]
          : { ...data, image_url: null },
    );
  }
});
test("a failed photography fallback propagates the second error", async () => {
  const { readPublicShelterQuery } =
    await import("../lib/canil/public-shelter.ts");
  let calls = 0;
  const error = { message: "Invalid API key" };
  await assert.rejects(
    readPublicShelterQuery(async () => ({
      data: null,
      error:
        ++calls === 1
          ? { code: "42703", message: "column canis.image_url does not exist" }
          : error,
    })),
    (e) => e.cause === error,
  );
  assert.equal(calls, 2);
});
