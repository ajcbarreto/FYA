import test from "node:test";
import assert from "node:assert/strict";
import { getOwnedShelter } from "../lib/canil/owned-shelter.ts";
test("shelter selection uses only the membership-scoped RPC", async () => {
  let calls = 0;
  const shelter = { id: "allowed" };
  const db = {
    rpc: async (name) => {
      assert.equal(name, "my_shelters");
      calls++;
      return { data: [shelter], error: null };
    },
  };
  assert.deepEqual(await getOwnedShelter(db, "user"), shelter);
  assert.equal(calls, 1);
});
test("missing membership never falls back to a public shelter", async () => {
  assert.equal(
    await getOwnedShelter(
      { rpc: async () => ({ data: [], error: null }) },
      "user",
    ),
    null,
  );
});
test("database errors are not mistaken for missing ownership", async () => {
  const error = { message: "unavailable" };
  await assert.rejects(
    getOwnedShelter({ rpc: async () => ({ data: null, error }) }, "user"),
    (e) => e.cause === error,
  );
});
