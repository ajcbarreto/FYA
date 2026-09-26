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
