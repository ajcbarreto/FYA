import test from "node:test";
import assert from "node:assert/strict";
import { getOwnedShelter } from "../lib/canil/owned-shelter.ts";

function client(result) {
  const calls = [];
  const query = {
    select() {
      return query;
    },
    eq(...args) {
      calls.push(args);
      return query;
    },
    async maybeSingle() {
      return result;
    },
  };
  return {
    calls,
    from(table) {
      calls.push(table);
      return query;
    },
  };
}

test("ownership lookup makes one scoped query without loading animals", async () => {
  const shelter = { id: "shelter", owner_profile_id: "owner" };
  const db = client({ data: shelter, error: null });
  assert.deepEqual(await getOwnedShelter(db, "owner"), shelter);
  assert.deepEqual(db.calls, ["canis", ["owner_profile_id", "owner"]]);
});

test("missing ownership never falls back to another shelter", async () => {
  const db = client({ data: null, error: null });
  assert.equal(await getOwnedShelter(db, "new-owner"), null);
  assert.equal(db.calls.length, 2);
});

test("database errors are not mistaken for missing ownership", async () => {
  const error = { message: "connection unavailable" };
  await assert.rejects(
    getOwnedShelter(client({ data: null, error }), "owner"),
    (failure) => failure.cause === error,
  );
});
